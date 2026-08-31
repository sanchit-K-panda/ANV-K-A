"""Phase 6 — KPI Manipulation & Closure Anomaly Detection Engine.

Detects artificial metric gaming (e.g., suspiciously fast closures, dropped investigations/evidence,
and collapsed escalation rates designed to inflate throughput and lower MTTR).
"""
from __future__ import annotations

import statistics
from typing import Dict, List, Optional

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import AnalystFeatures, FeatureExtractor, IncidentTraceFeatures
from ml.schemas import FindingSeverity, FindingType, RawFinding


class KpiManipulationEngine:
    """Detects metric gaming: rapid closures combined with suppressed investigation/escalation evidence."""

    def __init__(
        self,
        max_suspicious_closure_min: float = 15.0,
        expected_median_closure_min: float = 35.0,
        min_expected_investigation_rate: float = 0.65,
    ):
        self.max_suspicious_closure_min = max_suspicious_closure_min
        self.expected_median_closure_min = expected_median_closure_min
        self.min_expected_investigation_rate = min_expected_investigation_rate

    def analyze(
        self,
        dataset: LoadedDataset,
        traces: Optional[Dict[str, IncidentTraceFeatures]] = None,
        analyst_map: Optional[Dict[str, AnalystFeatures]] = None,
    ) -> List[RawFinding]:
        if traces is None:
            traces = FeatureExtractor.extract_incident_traces(dataset)
        if analyst_map is None:
            analyst_map = FeatureExtractor.extract_analyst_features(dataset, traces)

        findings: List[RawFinding] = []

        # Evaluate individual analysts
        manipulator_ids = []
        for aid, af in analyst_map.items():
            if af.closed_incidents < 1 or af.role == "SUPERVISOR":
                continue

            # Check if closure time is abnormally fast relative to baseline
            is_fast_closure = (
                af.mean_closure_minutes > 0 and af.mean_closure_minutes <= self.max_suspicious_closure_min
            )
            is_low_inv = af.investigation_rate < self.min_expected_investigation_rate

            if is_fast_closure:
                manipulator_ids.append(aid)

        if manipulator_ids:
            # Aggregate cohort stats
            manipulator_analysts = [analyst_map[aid] for aid in manipulator_ids]
            all_closure_times = [
                t.closure_minutes
                for t in traces.values()
                if t.assigned_analyst_id in manipulator_ids and t.closure_minutes is not None
            ]
            avg_closure = round(statistics.mean(all_closure_times), 1) if all_closure_times else 0.0

            affected_incidents = [
                t.incident_id
                for t in traces.values()
                if t.assigned_analyst_id in manipulator_ids
            ]

            total_inv_count = sum(
                1 for t in traces.values() if t.assigned_analyst_id in manipulator_ids and t.has_investigation
            )
            actual_inv_rate = round(total_inv_count / max(1, len(affected_incidents)), 3)

            entity_id_str = ",".join(sorted(manipulator_ids))

            finding = RawFinding(
                engine_name="KpiManipulationEngine",
                finding_type=FindingType.KPI_MANIPULATION,
                severity=FindingSeverity.HIGH,
                confidence=0.96,
                title=f"Potential KPI Manipulation: {len(manipulator_ids)} analyst(s) exhibiting suspicious closure velocity",
                description=(
                    f"A cohort of {len(manipulator_ids)} analyst(s) [{entity_id_str}] exhibits characteristic "
                    f"KPI manipulation: average closure duration is {avg_closure} minutes (baseline expected: ~{self.expected_median_closure_min} min), "
                    f"while investigation rate dropped to {actual_inv_rate * 100:.1f}% (baseline expected: >80%). "
                    f"This pattern indicates premature closure to inflate MTTR productivity metrics without required triage."
                ),
                entity_type="analyst_group",
                entity_id=entity_id_str,
                affected_ids=affected_incidents,
                evidence={
                    "analyst_ids": manipulator_ids,
                    "analyst_count": len(manipulator_ids),
                    "affected_incident_count": len(affected_incidents),
                    "affected_incident_ids": affected_incidents[:20],
                    "observed_avg_closure_minutes": avg_closure,
                    "expected_avg_closure_minutes": self.expected_median_closure_min,
                    "observed_investigation_rate": actual_inv_rate,
                    "expected_investigation_rate": "> 0.80",
                    "violation_types": ["POTENTIAL_KPI_MANIPULATION", "CLOSURE_ANOMALY"],
                },
                baseline_metrics={
                    "avg_closure_minutes": self.expected_median_closure_min,
                    "investigation_rate": "> 0.80",
                    "escalation_rate_for_critical": "> 0.25",
                },
                observed_metrics={
                    "avg_closure_minutes": avg_closure,
                    "investigation_rate": actual_inv_rate,
                    "analyst_count": len(manipulator_ids),
                    "incident_count": len(affected_incidents),
                },
                recommended_action=(
                    f"Perform quality audit on all {len(affected_incidents)} incidents closed by "
                    f"analysts [{entity_id_str}]. Suspend MTTR-based bonus evaluation and enforce mandatory "
                    f"investigation evidence checklists prior to incident resolution."
                ),
            )
            findings.append(finding)

        return findings
