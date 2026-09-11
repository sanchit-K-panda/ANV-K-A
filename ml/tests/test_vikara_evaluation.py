"""Unit tests for VIKĀRA Evaluation Engine against Ground Truth."""
from pathlib import Path
import json
import pandas as pd
import pytest

from ml.vikara.evaluate import evaluate_vikara


def test_vikara_evaluation_pipeline(tmp_path: Path):
    features_path = Path("data/features/test_v1.parquet")
    ground_truth_path = Path("data/simulator/ground_truth/test_v1.parquet")
    model_path = Path("models/vikara/v1/model.joblib")

    if not (features_path.exists() and ground_truth_path.exists() and model_path.exists()):
        pytest.skip("Test datasets or model not generated yet")

    out_dir = tmp_path / "evaluation"
    summary = evaluate_vikara(features_path, ground_truth_path, model_path, out_dir)

    assert "model_version" in summary
    assert "metrics" in summary
    assert "precision" in summary["metrics"]
    assert "recall" in summary["metrics"]
    assert "f1_score" in summary["metrics"]
    assert "false_positive_rate" in summary["metrics"]
    assert "false_negative_rate" in summary["metrics"]
    assert summary["total_windows"] > 0

    # Verify generated artifact files
    assert (out_dir / "summary.json").exists()
    assert (out_dir / "by_scenario.csv").exists()
    assert (out_dir / "confusion_matrix.json").exists()
    assert (out_dir / "latency.json").exists()

    df_by_scen = pd.read_csv(out_dir / "by_scenario.csv")
    assert "scenario" in df_by_scen.columns
    assert "f1_score" in df_by_scen.columns
