"""CLI script to generate feature datasets and ground truth tables from MĀYĀ.

Produces:
- data/features/healthy_v1.parquet (benign baseline only)
- data/features/test_v1.parquet (multi-scenario evaluation set)
- data/simulator/ground_truth/test_v1.parquet (evaluation oracle)
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Set

import pandas as pd

from ml.adapters.maya_adapter import MayaAdapter, MayaDatasetBundle
from ml.common.features.pipeline import FeaturePipeline
from ml.common.features.schema import FEATURE_NAMES, export_feature_schema_json
from ml.common.normalization.timestamps import normalize_timestamp


def is_window_anomalous(
    w_start_str: str,
    w_end_str: str,
    analyst_id: str,
    scenario: str,
    bundle: MayaDatasetBundle,
) -> int:
    """Window-level ground-truth oracle (REMEDIATION.md P0-2 fix #3).

    A window is anomalous only when the INJECTED BEHAVIOUR IS OBSERVABLE INSIDE IT —
    i.e. the window contains the workflow moment (creation/closure of a GT incident,
    identity-change session, or a member-analyst's flagged case). Span-wide labeling
    ("any window inside the anomaly's 14-day lifetime") was an oracle bug: it labeled
    93% of recurring_threat windows anomalous even though the recurrence occupies a
    handful of closure moments, drowning the signal and making every evaluator disagree.

    Analyst-level GT (workload imbalance, KPI groups) keeps interval semantics: the
    imbalance IS the window property being measured, so overlap on the analyst's own
    windows is the correct label.
    """
    if scenario == "healthy" and not any(
        gt.entity_type == "incident" for gt in bundle.ground_truth
    ):
        return 0

    w_start = normalize_timestamp(w_start_str)
    w_end = normalize_timestamp(w_end_str)
    aid_clean = analyst_id.replace("ANA-", "")
    is_soc_total = analyst_id == "SOC_TOTAL"

    def _moment(inc) -> Any:
        """The timestamp at which this incident's workflow outcome is observable."""
        return inc.closed_at or inc.created_at

    def _in_window(ts) -> bool:
        return ts is not None and w_start <= ts <= w_end

    for gt in bundle.ground_truth:
        gt_ids = {p.strip() for p in str(gt.entity_id).split(",") if p.strip()}
        gt_ids_clean = {p.replace("INC-", "").replace("ANA-", "").replace("THR-", "")
                        for p in gt_ids}
        has_time_bounds = gt.start_time is not None and gt.end_time is not None
        overlaps = True
        if has_time_bounds:
            overlaps = not (w_end < gt.start_time or w_start > gt.end_time)
        if not overlaps:
            continue

        entity_type = gt.entity_type

        # 1. Analyst-entity GT (e.g. analyst_overload): interval semantics on the
        #    flagged analyst's own windows.
        if not is_soc_total and (aid_clean in gt_ids_clean or analyst_id in gt_ids):
            return 1

        # 2. Session GT (identity_anomaly — excluded from VIKĀRA eval, kept for completeness).
        if entity_type == "session":
            return 1

        # 3. Incident GT (investigation_gap, negative_space): the window must contain
        #    the incident's closure/creation moment, for the assigned analyst or SOC.
        if entity_type == "incident":
            for inc in bundle.observations.incidents:
                inc_clean = inc.incident_id.replace("INC-", "")
                if inc.incident_id in gt_ids or inc_clean in gt_ids_clean:
                    if _in_window(_moment(inc)):
                        if is_soc_total or inc.assigned_analyst_id in (analyst_id, f"ANA-{aid_clean}"):
                            return 1

        # 4. Threat GT (recurring_threat): windows where an incident carrying the
        #    recurring threat_id is closed — the observable recurrence moment.
        if entity_type == "threat":
            for inc in bundle.observations.incidents:
                if any(
                    t in gt_ids or t.replace("THR-", "") in gt_ids_clean
                    for t in inc.threat_ids
                ):
                    if _in_window(_moment(inc)):
                        return 1

        # 5. Analyst-group GT (kpi_manipulation): windows where a member analyst's
        #    incident reaches its (gamed) closure moment.
        if entity_type == "analyst_group":
            for inc in bundle.observations.incidents:
                assignee_clean = str(inc.assigned_analyst_id).replace("ANA-", "")
                if assignee_clean in gt_ids_clean:
                    if _in_window(_moment(inc)):
                        if is_soc_total or assignee_clean == aid_clean:
                            return 1

    return 0


def generate_all_datasets(
    simulator_dir: Path,
    output_dir: Path,
    window_size: str = "1h",
) -> None:
    adapter = MayaAdapter()
    feature_pipeline = FeaturePipeline(window_size=window_size)

    features_dir = output_dir / "features"
    gt_dir = output_dir / "simulator" / "ground_truth"
    features_dir.mkdir(parents=True, exist_ok=True)
    gt_dir.mkdir(parents=True, exist_ok=True)

    # 1. Healthy Scenario -> healthy_v1.parquet
    healthy_path = simulator_dir / "healthy"
    if healthy_path.exists():
        print(f"[DATASET] Loading healthy baseline from {healthy_path}...")
        bundle_healthy = adapter.load_from_directory(healthy_path)
        df_healthy = feature_pipeline.extract_features(bundle_healthy.observations, active_only=True)
        healthy_out = features_dir / "healthy_v1.parquet"
        FeaturePipeline.save_parquet(df_healthy, healthy_out)
        print(f"[DATASET] Generated healthy baseline: {healthy_out} ({len(df_healthy)} active window samples)")

        # Benign-baseline oracle (REMEDIATION.md P0-1): with --soc-profiles the healthy
        # dataset contains REAL profile-gap windows (e.g. closure-gaming SOC). They must
        # be labeled so training can exclude them from the benign fit — otherwise the
        # model learns dysfunction as normal and recall collapses.
        healthy_gt_records: List[Dict[str, Any]] = []
        for _, row in df_healthy.iterrows():
            aid = str(row["analyst_id"])
            healthy_gt_records.append({
                "window_id": row["window_id"],
                "analyst_id": aid,
                "start_time": str(row["start_time"]),
                "end_time": str(row["end_time"]),
                "scenario": "healthy",
                "is_anomalous": is_window_anomalous(
                    str(row["start_time"]), str(row["end_time"]), aid, "healthy", bundle_healthy
                ),
            })
        healthy_gt_out = gt_dir / "healthy_v1.parquet"
        FeaturePipeline.save_parquet(pd.DataFrame(healthy_gt_records), healthy_gt_out)
        healthy_anom = sum(r["is_anomalous"] for r in healthy_gt_records)
        print(f"[DATASET] Generated healthy baseline oracle: {healthy_gt_out} "
              f"({len(healthy_gt_records)} records, {healthy_anom} anomalous)")

    # 2. Test Scenarios -> test_v1.parquet + ground_truth/test_v1.parquet
    test_scenarios = [
        "healthy",
        "investigation_gap",
        "negative_space",
        "kpi_manipulation",
        "analyst_overload",
        "recurring_threat",
        "identity_anomaly",
    ]

    all_test_dfs: List[pd.DataFrame] = []
    all_gt_records: List[Dict[str, Any]] = []

    for scen in test_scenarios:
        scen_path = simulator_dir / scen
        if not scen_path.exists():
            continue

        print(f"[DATASET] Processing scenario: {scen}...")
        bundle = adapter.load_from_directory(scen_path)
        df_scen = feature_pipeline.extract_features(bundle.observations, active_only=True)

        if len(df_scen) == 0:
            continue

        # Prefix window_id with scenario name for unambiguous indexing
        df_scen["window_id"] = df_scen["window_id"].astype(str).apply(lambda wid: f"{scen}__{wid}")
        all_test_dfs.append(df_scen)

        for _, row in df_scen.iterrows():
            aid = str(row["analyst_id"])
            w_start = str(row["start_time"])
            w_end = str(row["end_time"])
            is_anom = is_window_anomalous(w_start, w_end, aid, scen, bundle)

            all_gt_records.append({
                "window_id": row["window_id"],
                "analyst_id": aid,
                "start_time": w_start,
                "end_time": w_end,
                "scenario": scen,
                "is_anomalous": is_anom,
            })

    if all_test_dfs:
        df_test = pd.concat(all_test_dfs, ignore_index=True)
        test_out = features_dir / "test_v1.parquet"
        FeaturePipeline.save_parquet(df_test, test_out)
        print(f"[DATASET] Generated test feature set: {test_out} ({len(df_test)} window samples)")

        df_gt = pd.DataFrame(all_gt_records)
        gt_out = gt_dir / "test_v1.parquet"
        FeaturePipeline.save_parquet(df_gt, gt_out)
        anom_sum = int(df_gt['is_anomalous'].sum())
        print(f"[DATASET] Generated ground truth oracle: {gt_out} ({len(df_gt)} records, {anom_sum} anomalous)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate ANVĪKṢA feature sets from MĀYĀ simulator")
    parser.add_argument("--simulator-dir", type=Path, default=Path("soc-simulator/datasets"))
    parser.add_argument("--output-dir", type=Path, default=Path("data"))
    parser.add_argument("--window", type=str, default="1h")
    args = parser.parse_args()

    generate_all_datasets(args.simulator_dir, args.output_dir, args.window)
