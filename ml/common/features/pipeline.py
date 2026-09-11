"""Feature Engineering Pipeline for ANVĪKṢA Behavioural Anomaly Detection.

Constructs windowed tabular datasets with all 31 operational features.
Guarantees:
1. Zero ground truth leakage (prompt §11).
2. Strict historical boundaries T_event <= T_window_end (prompt §14).
3. Machine-readable schema compatibility (prompt §13).
4. High-performance Parquet persistence (prompt §44).
"""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple
import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

from ml.adapters.maya_adapter import MayaObservations
from ml.common.features.aggregations import (
    compute_duration_aggregations,
    compute_volume_aggregations,
)
from ml.common.features.ratios import compute_operational_ratios
from ml.common.features.schema import FEATURE_NAMES
from ml.common.features.temporal import compute_temporal_latencies
from ml.common.features.windows import generate_time_windows
from ml.common.features.workload import compute_workload_and_breadth


def _compute_governance_indicators(
    escalations: Sequence,
    incidents: Sequence,
    t_start,
    t_end,
    analyst_id=None,
) -> Dict[str, float]:
    """Schema v1.1 (REMEDIATION.md P2-7): governance capability-area indicators.

    - escalation_signoff_rate: share of escalations with supervisor sign-off (RESOLVED).
    - escalation_coverage_rate: share of CRITICAL incidents that were escalated at all.
    - critical_without_escalation: count form — zero for idle windows.

    Existence checks ("was it escalated at all?") are DATASET-WIDE, mirroring the
    ExecutionGap/NegativeSpace engines and the simulator's ground-truth builder: an
    incident closed in this window whose escalation happened in an adjacent window is
    NOT a violation. Window-sliced existence lookups manufactured exactly that false
    signal and capped window-level F1 at ~0.3.
    """
    w_escalations = [
        e for e in escalations
        if t_start <= e.timestamp <= t_end
        and (analyst_id is None or e.analyst_id == analyst_id)
    ]
    signoff_rate = (
        round(sum(1 for e in w_escalations if str(e.status).upper() == "RESOLVED") / len(w_escalations), 4)
        if w_escalations else 0.0
    )

    w_critical = [
        i for i in incidents
        if t_start <= i.created_at <= t_end
        and str(getattr(i.severity, "value", i.severity)).upper() == "CRITICAL"
        and (analyst_id is None or i.assigned_analyst_id == analyst_id)
    ]
    escalated_incident_ids = {e.incident_id for e in escalations}
    coverage_rate = (
        round(sum(1 for i in w_critical if i.incident_id in escalated_incident_ids) / len(w_critical), 4)
        if w_critical else 0.0
    )
    # Count form (not rate): zero for idle windows, directly encodes the violation.
    critical_without_escalation = sum(1 for i in w_critical if i.incident_id not in escalated_incident_ids)
    return {
        "escalation_signoff_rate": float(signoff_rate),
        "escalation_coverage_rate": float(coverage_rate),
        "critical_without_escalation": float(critical_without_escalation),
    }


def _compute_discipline_indicators(
    investigations: Sequence,
    t_start,
    t_end,
    analyst_id=None,
    incidents: Sequence = (),
    actions: Sequence = (),
) -> Dict[str, float]:
    """Schema v1.1 (REMEDIATION.md P2-7): operational-discipline indicators.

    - investigation_documentation_rate: share of completed investigations with notes.
    - closure_discipline_rate: share of incidents CLOSED in window that have a recorded
      investigation — the direct closure-gaming signal (skipped investigation reads as
      perfect velocity on conventional dashboards).
    """
    w_inv = [
        inv for inv in investigations
        if inv.completed_at and t_start <= inv.completed_at <= t_end
        and (analyst_id is None or inv.analyst_id == analyst_id)
    ]
    doc_rate = (
        round(sum(1 for inv in w_inv if str(getattr(inv, "notes", "") or "").strip()) / len(w_inv), 4)
        if w_inv else 0.0
    )

    # DATASET-WIDE existence lookup (see _compute_governance_indicators docstring):
    # "closed without investigation" means no investigation record exists ANYWHERE,
    # matching the engines' and ground-truth builder's semantics.
    investigated_incident_ids = {inv.incident_id for inv in investigations}
    w_closed = [
        i for i in incidents
        if i.closed_at and t_start <= i.closed_at <= t_end
        and (analyst_id is None or i.assigned_analyst_id == analyst_id)
    ]
    closure_discipline = (
        round(sum(1 for i in w_closed if i.incident_id in investigated_incident_ids) / len(w_closed), 4)
        if w_closed else 0.0
    )
    # Count form (not rate): zero for idle windows, directly encodes the violation —
    # the window-level mirror of the ExecutionGap/NegativeSpace engine signal.
    closures_without_investigation = sum(1 for i in w_closed if i.incident_id not in investigated_incident_ids)

    # Same pattern for RESPONSE (dataset-wide existence): profile gaps and
    # fabricated fast closures skip the response action entirely.
    response_incident_ids = {
        a.incident_id for a in actions
        if str(getattr(a.action_type, "value", a.action_type)).upper() == "RESPONSE"
    }
    closures_without_response = sum(1 for i in w_closed if i.incident_id not in response_incident_ids)
    return {
        "investigation_documentation_rate": float(doc_rate),
        "closure_discipline_rate": float(closure_discipline),
        "closures_without_investigation": float(closures_without_investigation),
        "closures_without_response": float(closures_without_response),
    }


def _compute_resilience_indicators(
    incidents: Sequence,
    t_start,
    t_end,
    analyst_id=None,
) -> Dict[str, float]:
    """Schema v1.1 (REMEDIATION.md P2-7): cyber-resilience indicator.

    - threat_recurrence_rate: share of incidents closed in window whose threat_id
      appears in more than one incident overall (repeat-campaign pressure).
    """
    threat_counts: Dict[str, int] = {}
    for inc in incidents:
        for tid in inc.threat_ids:
            threat_counts[tid] = threat_counts.get(tid, 0) + 1
    repeat_threats = {tid for tid, n in threat_counts.items() if n > 1}

    w_closed = [
        i for i in incidents
        if i.closed_at and t_start <= i.closed_at <= t_end
        and (analyst_id is None or i.assigned_analyst_id == analyst_id)
    ]
    recurrence_rate = (
        round(sum(1 for i in w_closed if any(t in repeat_threats for t in i.threat_ids)) / len(w_closed), 4)
        if w_closed else 0.0
    )
    return {"threat_recurrence_rate": float(recurrence_rate)}


class FeaturePipeline:
    """Orchestrates feature extraction from normalized observations into structured DataFrames."""

    def __init__(self, window_size: str = "1h", step_size: Optional[str] = None) -> None:
        self.window_size = window_size
        self.step_size = step_size or window_size

    def extract_features(
        self,
        obs: MayaObservations,
        include_soc_level: bool = True,
        active_only: bool = True,
    ) -> pd.DataFrame:
        """Extracts the 31 behavioural features across sliding windows with window-level pre-binning."""
        # Find global timeline bounds across events/alerts/incidents
        all_timestamps: List[datetime] = []
        for e in obs.events:
            all_timestamps.append(e.timestamp)
        for a in obs.alerts:
            all_timestamps.append(a.timestamp)
        for inc in obs.incidents:
            all_timestamps.append(inc.created_at)
            if inc.closed_at:
                all_timestamps.append(inc.closed_at)

        if not all_timestamps:
            cols = ["window_id", "start_time", "end_time", "analyst_id"] + FEATURE_NAMES
            return pd.DataFrame(columns=cols)

        start_time = min(all_timestamps)
        end_time = max(all_timestamps)

        # Generate window boundaries
        windows = generate_time_windows(start_time, end_time, self.window_size, self.step_size)

        # Collect active analysts
        analyst_ids = sorted({
            inc.assigned_analyst_id
            for inc in obs.incidents
            if inc.assigned_analyst_id and inc.assigned_analyst_id not in ("ANA-UNASSIGNED", "ANA-UNKNOWN")
        })

        records: List[Dict[str, Any]] = []
        prior_queue_by_analyst: Dict[str, int] = {aid: 0 for aid in analyst_ids}
        prior_soc_queue = 0

        for idx, (w_start, w_end) in enumerate(windows):
            window_id = f"W-{idx:04d}"

            # High-performance window pre-filtering
            w_alerts = [a for a in obs.alerts if w_start <= a.timestamp <= w_end]
            w_incidents_active = [
                inc for inc in obs.incidents
                if inc.created_at <= w_end and (inc.closed_at is None or inc.closed_at > w_end)
            ]
            w_incidents_closed = [
                inc for inc in obs.incidents
                if inc.closed_at and w_start <= inc.closed_at <= w_end
            ]
            w_incidents_created = [
                inc for inc in obs.incidents
                if w_start <= inc.created_at <= w_end
            ]
            w_relevant_incidents = list({inc.incident_id: inc for inc in (w_incidents_active + w_incidents_closed + w_incidents_created)}.values())

            w_investigations = [
                inv for inv in obs.investigations
                if (w_start <= inv.started_at <= w_end)
                or (inv.completed_at and w_start <= inv.completed_at <= w_end)
            ]
            w_escalations = [esc for esc in obs.escalations if w_start <= esc.timestamp <= w_end]
            w_actions = [act for act in obs.actions if w_start <= act.timestamp <= w_end]
            w_events = [e for e in obs.events if w_start <= e.timestamp <= w_end]

            # 1. Analyst-level samples
            for aid in analyst_ids:
                vol = compute_volume_aggregations(
                    w_alerts, w_relevant_incidents, w_investigations, w_escalations, w_actions,
                    w_start, w_end, analyst_id=aid,
                )

                # Skip completely idle off-shift analysts when active_only=True
                is_active = (
                    vol["alerts_received"] > 0
                    or vol["investigations_started"] > 0
                    or vol["active_cases"] > 0
                    or vol["closures"] > 0
                    or vol["escalations"] > 0
                )
                if active_only and not is_active:
                    continue

                dur = compute_duration_aggregations(
                    w_investigations, w_start, w_end, analyst_id=aid,
                )
                lat = compute_temporal_latencies(
                    w_relevant_incidents, w_escalations, w_start, w_end, analyst_id=aid,
                )
                rat = compute_operational_ratios(
                    vol, prior_queue_depth=prior_queue_by_analyst.get(aid, 0),
                )
                prior_queue_by_analyst[aid] = vol["queue_depth"]

                wld = compute_workload_and_breadth(
                    w_alerts, w_relevant_incidents, w_events, obs.threats,
                    w_start, w_end, analyst_id=aid,
                )
                gov = _compute_governance_indicators(
                    obs.escalations, w_relevant_incidents, w_start, w_end, analyst_id=aid,
                )
                dis = _compute_discipline_indicators(
                    obs.investigations, w_start, w_end, analyst_id=aid,
                    incidents=obs.incidents, actions=obs.actions,
                )
                res = _compute_resilience_indicators(
                    obs.incidents, w_start, w_end, analyst_id=aid,
                )

                row: Dict[str, Any] = {
                    "window_id": window_id,
                    "start_time": w_start.isoformat(),
                    "end_time": w_end.isoformat(),
                    "analyst_id": aid,
                }
                row.update(vol)
                row.update(dur)
                row.update(lat)
                row.update(rat)
                row.update(wld)
                row.update(gov)
                row.update(dis)
                row.update(res)

                records.append(row)

            # 2. SOC-level aggregated sample
            if include_soc_level:
                vol_soc = compute_volume_aggregations(
                    w_alerts, w_relevant_incidents, w_investigations, w_escalations, w_actions,
                    w_start, w_end, analyst_id=None,
                )
                dur_soc = compute_duration_aggregations(
                    w_investigations, w_start, w_end, analyst_id=None,
                )
                lat_soc = compute_temporal_latencies(
                    w_relevant_incidents, w_escalations, w_start, w_end, analyst_id=None,
                )
                rat_soc = compute_operational_ratios(
                    vol_soc, prior_queue_depth=prior_soc_queue,
                )
                prior_soc_queue = vol_soc["queue_depth"]

                wld_soc = compute_workload_and_breadth(
                    w_alerts, w_relevant_incidents, w_events, obs.threats,
                    w_start, w_end, analyst_id=None,
                )
                gov_soc = _compute_governance_indicators(
                    obs.escalations, w_relevant_incidents, w_start, w_end, analyst_id=None,
                )
                dis_soc = _compute_discipline_indicators(
                    obs.investigations, w_start, w_end, analyst_id=None,
                    incidents=obs.incidents, actions=obs.actions,
                )
                res_soc = _compute_resilience_indicators(
                    obs.incidents, w_start, w_end, analyst_id=None,
                )

                row_soc: Dict[str, Any] = {
                    "window_id": window_id,
                    "start_time": w_start.isoformat(),
                    "end_time": w_end.isoformat(),
                    "analyst_id": "SOC_TOTAL",
                }
                row_soc.update(vol_soc)
                row_soc.update(dur_soc)
                row_soc.update(lat_soc)
                row_soc.update(rat_soc)
                row_soc.update(wld_soc)
                row_soc.update(gov_soc)
                row_soc.update(dis_soc)
                row_soc.update(res_soc)

                records.append(row_soc)

        df = pd.DataFrame(records)
        expected_cols = ["window_id", "start_time", "end_time", "analyst_id"] + FEATURE_NAMES
        for col in expected_cols:
            if col not in df.columns:
                df[col] = 0.0 if col in FEATURE_NAMES else ""

        return df[expected_cols]

    @staticmethod
    def save_parquet(df: pd.DataFrame, file_path: str | Path) -> None:
        """Saves feature DataFrame to Parquet with PyArrow."""
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        table = pa.Table.from_pandas(df)
        pq.write_table(table, str(path), compression="snappy")

    @staticmethod
    def load_parquet(file_path: str | Path) -> pd.DataFrame:
        """Loads feature DataFrame from Parquet."""
        return pd.read_parquet(str(file_path))
