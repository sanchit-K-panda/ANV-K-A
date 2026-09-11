"""Evaluation Engine for VIKĀRA Behavioural Anomaly Detection (prompt §24-27, §52).

Evaluates VIKĀRA against MĀYĀ's hidden ground truth oracle.
Calculates: Precision, Recall, F1, FPR, FNR, ROC-AUC, PR-AUC, Latency, and produces
scenario-stratified machine-readable metrics.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import time
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
    precision_score,
    recall_score,
    roc_auc_score,
)

from ml.common.features.schema import FEATURE_NAMES
from ml.vikara.model import VikaraIsolationForest


def evaluate_vikara(
    features_path: Path,
    ground_truth_path: Path,
    model_path: Path,
    output_dir: Path,
    exclude_scenarios: Optional[List[str]] = None,
) -> Dict[str, Any]:
    print(f"[EVALUATION] Loading model from {model_path}...")
    model = VikaraIsolationForest.load(model_path)

    print(f"[EVALUATION] Loading test features from {features_path}...")
    df_features = pd.read_parquet(features_path)

    print(f"[EVALUATION] Loading ground truth oracle from {ground_truth_path}...")
    df_gt = pd.read_parquet(ground_truth_path)

    # Align features and ground truth on window_id and analyst_id
    merged = pd.merge(
        df_features,
        df_gt[["window_id", "analyst_id", "scenario", "is_anomalous"]],
        on=["window_id", "analyst_id"],
        how="inner",
    )

    if len(merged) == 0:
        raise ValueError("No matching records between features and ground truth oracle.")

    # Scenario scoping (REMEDIATION.md P0-1 fix #3): scenarios owned by other engines
    # (e.g. identity_anomaly → KAVACA identity layer) are excluded from the window-level
    # evaluation and reported separately, not silently scored as 0-recall failures.
    excluded: List[str] = list(exclude_scenarios or [])
    excluded_rows = merged[merged["scenario"].isin(excluded)] if excluded else merged.iloc[0:0]
    merged = merged[~merged["scenario"].isin(excluded)].reset_index(drop=True)
    if excluded:
        print(
            f"[EVALUATION] Excluded scenarios (out of VIKĀRA scope): "
            f"{', '.join(excluded)} ({len(excluded_rows)} windows)"
        )

    feature_cols = model.feature_names or [f for f in FEATURE_NAMES if f in merged.columns]
    X = merged[feature_cols].to_numpy(dtype=np.float32)
    X = np.nan_to_num(X, nan=0.0, posinf=100.0, neginf=0.0)
    y_true = merged["is_anomalous"].to_numpy(dtype=np.int8)

    print(f"[EVALUATION] Evaluating {len(merged)} windows across scenarios...")
    t0 = time.perf_counter()
    raw_scores, anomaly_scores, predictions = model.score_samples(X)
    eval_latency_ms = (time.perf_counter() - t0) * 1000.0
    avg_per_window_latency_ms = eval_latency_ms / len(merged)

    y_pred = predictions.astype(np.int8)

    # Overall Metrics
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    precision = float(precision_score(y_true, y_pred, zero_division=0.0))
    recall = float(recall_score(y_true, y_pred, zero_division=0.0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0.0))
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    try:
        roc_auc = float(roc_auc_score(y_true, -raw_scores))  # lower raw = more anomalous
    except Exception:
        roc_auc = 0.0

    try:
        pr_auc = float(average_precision_score(y_true, -raw_scores))
    except Exception:
        pr_auc = 0.0

    # Per-scenario Breakdown
    by_scenario_rows = []
    for scen, group in merged.groupby("scenario"):
        scen_mask = (merged["scenario"] == scen).to_numpy()
        y_scen_true = y_true[scen_mask]
        y_scen_pred = y_pred[scen_mask]
        scen_cm = confusion_matrix(y_scen_true, y_scen_pred, labels=[0, 1])
        s_tn, s_fp, s_fn, s_tp = scen_cm.ravel()

        s_prec = float(precision_score(y_scen_true, y_scen_pred, zero_division=0.0))
        s_rec = float(recall_score(y_scen_true, y_scen_pred, zero_division=0.0))
        s_f1 = float(f1_score(y_scen_true, y_scen_pred, zero_division=0.0))
        s_fpr = float(s_fp / (s_fp + s_tn)) if (s_fp + s_tn) > 0 else 0.0

        by_scenario_rows.append({
            "scenario": scen,
            "total_windows": len(y_scen_true),
            "anomalous_windows": int(np.sum(y_scen_true == 1)),
            "normal_windows": int(np.sum(y_scen_true == 0)),
            "tp": int(s_tp),
            "fp": int(s_fp),
            "fn": int(s_fn),
            "tn": int(s_tn),
            "precision": round(s_prec, 4),
            "recall": round(s_rec, 4),
            "f1_score": round(s_f1, 4),
            "fpr": round(s_fpr, 4),
        })

    df_by_scen = pd.DataFrame(by_scenario_rows)

    # Output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. summary.json
    summary: Dict[str, Any] = {
        "model_version": model.version,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "canonical": True,
        "note": "Canonical window-level VIKĀRA evaluation. data/evaluation/vikara/ is the single source of truth for model metrics.",
        "total_windows": int(len(merged)),
        "class_balance": {
            "normal_windows": int(tn + fp),
            "anomalous_windows": int(tp + fn),
            "anomaly_ratio": round(float((tp + fn) / len(merged)), 4),
        },
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "false_positive_rate": round(fpr, 4),
            "false_negative_rate": round(fnr, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
        },
        "decision_threshold": model.decision_threshold,
        "threshold_calibration": getattr(model, "threshold_calibration", None),
        "excluded_scenarios": excluded,
        "latency_profile": {
            "total_eval_time_ms": round(eval_latency_ms, 2),
            "avg_per_window_latency_ms": round(avg_per_window_latency_ms, 4),
        },
    }

    with open(output_dir / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    # 2. by_scenario.csv
    df_by_scen.to_csv(output_dir / "by_scenario.csv", index=False)

    # 3. confusion_matrix.json
    cm_dict = {
        "tp": int(tp),
        "fp": int(fp),
        "fn": int(fn),
        "tn": int(tn),
    }
    with open(output_dir / "confusion_matrix.json", "w", encoding="utf-8") as f:
        json.dump(cm_dict, f, indent=2)

    # 4. latency.json
    latency_dict = {
        "total_windows_scored": len(merged),
        "total_inference_time_ms": round(eval_latency_ms, 2),
        "avg_ms_per_window": round(avg_per_window_latency_ms, 4),
        "throughput_windows_per_sec": round(len(merged) / max(0.001, eval_latency_ms / 1000.0), 1),
    }
    with open(output_dir / "latency.json", "w", encoding="utf-8") as f:
        json.dump(latency_dict, f, indent=2)

    # Canonical-only policy (REMEDIATION.md P0-1 fix #4): data/evaluation/vikara/ is the
    # single evaluation home. The model dir keeps only a pointer — never a second copy of
    # metrics that can drift from the canonical set.
    model_eval_path = model_path.parent / "evaluation.json"
    pointer = {
        "status": "pointer",
        "canonical_location": "data/evaluation/vikara/summary.json",
        "model_version": model.version,
        "evaluated_at": summary["evaluated_at"],
    }
    if model_eval_path.parent.exists():
        with open(model_eval_path, "w", encoding="utf-8") as f:
            json.dump(pointer, f, indent=2)

    # Print Human-readable report
    print("\n" + "=" * 80)
    print(f"ANVĪKṢA VIKĀRA v1 EVALUATION REPORT — {model.version}")
    print("=" * 80)
    print(
        f"Total Windows: {len(merged)} | Normal: {tn + fp} | Anomalous: {tp + fn} "
        f"({summary['class_balance']['anomaly_ratio']:.2%})"
    )
    print(
        f"Overall: Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f} | "
        f"ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f}"
    )
    print(f"FPR: {fpr:.4f} | FNR: {fnr:.4f} | Latency: {avg_per_window_latency_ms:.4f} ms/window")
    print("-" * 80)
    print(f"{'Scenario':<25} {'Precision':<12} {'Recall':<12} {'F1':<12} {'Windows':<10}")
    print("-" * 80)
    for _, row in df_by_scen.iterrows():
        print(
            f"{row['scenario']:<25} {row['precision']:<12.4f} {row['recall']:<12.4f} "
            f"{row['f1_score']:<12.4f} {row['total_windows']:<10}"
        )
    print("=" * 80 + "\n")

    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate VIKĀRA against MĀYĀ Ground Truth")
    parser.add_argument("--dataset", type=Path, default=Path("data/features/test_v1.parquet"))
    parser.add_argument("--ground-truth", type=Path, default=Path("data/simulator/ground_truth/test_v1.parquet"))
    parser.add_argument("--model", type=Path, default=Path("models/vikara/v1/model.joblib"))
    parser.add_argument("--output", type=Path, default=Path("data/evaluation/vikara"))
    parser.add_argument(
        "--exclude-scenario", action="append", default=[],
        help="Scenario to exclude from window evaluation (repeatable). Default: identity_anomaly per configs/vikara.yaml.",
    )
    args = parser.parse_args()

    excluded = args.exclude_scenario or ["identity_anomaly"]
    evaluate_vikara(args.dataset, args.ground_truth, args.model, args.output, exclude_scenarios=excluded)
