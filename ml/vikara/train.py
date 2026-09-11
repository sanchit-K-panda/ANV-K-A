"""Training script for VIKĀRA v1 Behavioural Anomaly Detection (prompt §20-22).

Usage:
    python -m ml.vikara.train --dataset data/features/healthy_v1.parquet --config configs/vikara.yaml
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import sys
from typing import Any, Dict
import numpy as np
import pandas as pd
import sklearn
import yaml

from ml.common.features.schema import FEATURE_NAMES, export_feature_schema_dict
from ml.vikara.model import VikaraIsolationForest


def train_vikara(
    dataset_path: Path,
    config_path: Path,
    output_dir: Path,
    oracle_path: Path | None = None,
) -> None:
    print(f"[VIKĀRA] Loading configuration from {config_path}...")
    with open(config_path, "r", encoding="utf-8") as f:
        config_data = yaml.safe_load(f)

    model_cfg = config_data.get("model", {})
    features_list = config_data.get("features", FEATURE_NAMES)

    print(f"[VIKĀRA] Loading training baseline from {dataset_path}...")
    df = pd.read_parquet(dataset_path)

    # Check that required features exist
    for f in features_list:
        if f not in df.columns:
            raise ValueError(f"Feature '{f}' not present in training dataset {dataset_path}")

    # Exclude oracle-labeled anomalous windows from the benign fit (REMEDIATION.md
    # P0-1): with multi-SOC maturity profiles the healthy dataset contains REAL
    # profile-gap windows. Fitting on them teaches the model that skipped
    # investigations/escalations are normal — recall on exactly that pattern then
    # collapses. The measured exclusion rate is the training prior.
    n_total = len(df)
    if oracle_path is not None and oracle_path.exists():
        oracle = pd.read_parquet(oracle_path)
        key = [c for c in ("window_id", "analyst_id", "start_time", "end_time")
               if c in df.columns and c in oracle.columns]
        if key and "is_anomalous" in oracle.columns:
            labeled_anom = oracle.loc[oracle["is_anomalous"] == 1, key]
            df = df.merge(labeled_anom.drop_duplicates(subset=key), on=key, how="left", indicator=True)
            excluded = int((df["_merge"] == "both").sum())
            df = df[df["_merge"] == "left_only"].drop(columns=["_merge"])
            print(f"[VIKĀRA] Benign-fit exclusions: {excluded}/{n_total} labeled-anomalous windows "
                  f"removed; training prior = {excluded / max(n_total, 1):.4f}")

    X = df[features_list].to_numpy(dtype=np.float32)
    X = np.nan_to_num(X, nan=0.0, posinf=100.0, neginf=0.0)

    n_rows, n_cols = X.shape
    print(f"[VIKĀRA] Baseline shape: {n_rows} windows, {n_cols} features.")

    version = model_cfg.get("version", "vikara-v1")
    n_estimators = int(model_cfg.get("n_estimators", 200))
    contamination = float(model_cfg.get("contamination", 0.01))
    max_samples = float(model_cfg.get("max_samples", 1.0))
    max_features = float(model_cfg.get("max_features", 1.0))
    random_state = int(model_cfg.get("random_state", 42))
    decision_threshold = float(model_cfg.get("decision_threshold", 0.99))
    calibrate_threshold = bool(model_cfg.get("calibrate_threshold", True))
    threshold_quantile = float(model_cfg.get("threshold_quantile", 0.99))
    # Deterministic rule-overlay features (REMEDIATION.md P0-1): count features that
    # are zero on every benign window. "fires → anomalous" preserves the healthy-FPR
    # bound and surfaces precision-1.0 workflow violations the iForest under-ranks.
    default_rules = [
        "closures_without_investigation",
        "closures_without_response",
        "critical_without_escalation",
    ]
    rule_features = [f for f in model_cfg.get("rule_features", default_rules) if f in features_list]

    vikara = VikaraIsolationForest(
        n_estimators=n_estimators,
        contamination=contamination,
        max_samples=max_samples,
        max_features=max_features,
        random_state=random_state,
        decision_threshold=decision_threshold,
        version=version,
        feature_names=features_list,
        calibrate_threshold=calibrate_threshold,
        threshold_quantile=threshold_quantile,
        rule_feature_names=rule_features,
    )

    print(f"[VIKĀRA] Fitting Isolation Forest on {n_rows} benign baseline windows...")
    vikara.fit(X, features_list)

    # Self-evaluation on baseline
    raw_scores, scores, preds = vikara.score_samples(X)
    baseline_fp_rate = float(np.mean(preds))
    mean_score = float(np.mean(scores))
    mean_raw = float(np.mean(raw_scores))
    print(
        f"[VIKĀRA] Training complete. Baseline flagged rate: {baseline_fp_rate:.4f}, "
        f"mean anomaly score: {mean_score:.4f}, mean raw score: {mean_raw:.4f}"
    )

    # Prepare output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    model_file = output_dir / "model.joblib"
    vikara.save(model_file)
    print(f"[VIKĀRA] Saved model artifact: {model_file}")

    # Write metadata.json per prompt §22
    metadata: Dict[str, Any] = {
        "model_name": "IsolationForest",
        "model_version": version,
        "feature_schema_version": model_cfg.get("feature_schema_version", "1.0"),
        "training_dataset": dataset_path.stem,
        "training_rows": n_rows,
        "benign_fit_exclusions": n_total - n_rows,
        "rule_overlay_features": rule_features,
        "features": features_list,
        "random_state": random_state,
        "contamination": contamination,
        "n_estimators": n_estimators,
        "decision_threshold": decision_threshold,
        "threshold_calibration": vikara.threshold_calibration,
        "training_summary": {
            "baseline_flagged_rate": round(baseline_fp_rate, 4),
            "mean_anomaly_score": round(mean_score, 4),
            "mean_raw_decision_function": round(mean_raw, 4),
        },
        "library_versions": {
            "python": sys.version.split()[0],
            "scikit-learn": sklearn.__version__,
            "numpy": np.__version__,
            "pandas": pd.__version__,
        },
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }

    metadata_file = output_dir / "metadata.json"
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[VIKĀRA] Saved metadata: {metadata_file}")

    # Copy config.yaml
    config_dest = output_dir / "config.yaml"
    shutil.copyfile(config_path, config_dest)

    # Write feature_schema.json
    schema_file = output_dir / "feature_schema.json"
    with open(schema_file, "w", encoding="utf-8") as f:
        json.dump(export_feature_schema_dict(), f, indent=2)
    print(f"[VIKĀRA] Saved feature schema: {schema_file}")

    # NOTE (REMEDIATION.md P0-1): no evaluation.json is written here. The canonical
    # evaluation location is data/evaluation/vikara/, regenerated by
    # `python -m ml.vikara.evaluate` — one location, one set of numbers, one command.


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train VIKĀRA Behavioural Anomaly Detection Model")
    parser.add_argument("--dataset", type=Path, default=Path("data/features/healthy_v1.parquet"))
    parser.add_argument("--config", type=Path, default=Path("configs/vikara.yaml"))
    parser.add_argument("--output", type=Path, default=Path("models/vikara/v1"))
    parser.add_argument("--oracle", type=Path, default=Path("data/simulator/ground_truth/healthy_v1.parquet"))
    args = parser.parse_args()

    train_vikara(args.dataset, args.config, args.output, oracle_path=args.oracle)
