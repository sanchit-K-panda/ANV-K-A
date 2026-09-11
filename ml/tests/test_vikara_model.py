"""Unit tests for VIKĀRA v1 Isolation Forest Model, Inference, and Explainability."""
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from ml.common.features.schema import FEATURE_NAMES
from ml.vikara.explain import FeatureExplainer
from ml.vikara.inference import predict
from ml.vikara.model import AnomalyResult, VikaraIsolationForest


@pytest.fixture
def dummy_feature_matrix():
    np.random.seed(42)
    # Generate 100 normal samples
    X = np.random.normal(loc=10.0, scale=2.0, size=(100, len(FEATURE_NAMES))).astype(np.float32)
    return X


def test_vikara_fit_score_save_load(tmp_path: Path, dummy_feature_matrix):
    model = VikaraIsolationForest(
        n_estimators=50,
        contamination=0.05,
        random_state=42,
        decision_threshold=0.5,
    )
    model.fit(dummy_feature_matrix, FEATURE_NAMES)
    assert model.is_fitted
    assert len(model.baseline_stats) == len(FEATURE_NAMES)

    # Score samples
    raw_scores, anomaly_scores, preds = model.score_samples(dummy_feature_matrix)
    assert len(raw_scores) == 100
    assert len(anomaly_scores) == 100
    assert (anomaly_scores >= 0.0).all() and (anomaly_scores <= 1.0).all()

    # Save and reload
    save_file = tmp_path / "test_model.joblib"
    model.save(save_file)
    assert save_file.exists()

    loaded = VikaraIsolationForest.load(save_file)
    assert loaded.is_fitted
    _, loaded_scores, _ = loaded.score_samples(dummy_feature_matrix)
    np.testing.assert_allclose(anomaly_scores, loaded_scores, rtol=1e-5)


def test_vikara_predict_contract(tmp_path: Path, dummy_feature_matrix):
    model = VikaraIsolationForest(n_estimators=50, contamination=0.05, random_state=42)
    model.fit(dummy_feature_matrix, FEATURE_NAMES)
    save_file = tmp_path / "model.joblib"
    model.save(save_file)

    # Test single dictionary input
    sample_dict = {f: 10.0 for f in FEATURE_NAMES}
    res = predict(sample_dict, model_path=save_file)
    assert isinstance(res, AnomalyResult)
    assert res.prediction in ("NORMAL", "ANOMALOUS")
    assert 0.0 <= res.anomaly_score <= 1.0
    assert res.model_version == "vikara-v1"

    # Test DataFrame input
    df_samples = pd.DataFrame([sample_dict, sample_dict])
    res_list = predict(df_samples, model_path=save_file)
    assert isinstance(res_list, list)
    assert len(res_list) == 2
    assert isinstance(res_list[0], AnomalyResult)


def test_vikara_feature_explainability():
    baseline_stats = {
        "median_investigation_duration": {"median": 15.0, "std": 3.0, "iqr": 2.5},
        "closure_rate": {"median": 0.70, "std": 0.10, "iqr": 0.08},
    }
    explainer = FeatureExplainer(baseline_stats)

    # Injected extreme anomaly: duration is 1.0 min (unusually low), closure_rate is 1.0 (unusually high)
    obs = {
        "median_investigation_duration": 1.0,
        "closure_rate": 0.99,
    }
    top_devs = explainer.explain_vector(obs, top_k=2)
    assert len(top_devs) == 2
    assert top_devs[0]["feature"] == "median_investigation_duration"
    assert top_devs[0]["direction"] == "unusually_low"
    assert top_devs[0]["deviation"] == "highly_unusual"

    assert top_devs[1]["feature"] == "closure_rate"
    assert top_devs[1]["direction"] == "unusually_high"


def test_vikara_reproducibility(dummy_feature_matrix):
    m1 = VikaraIsolationForest(n_estimators=50, random_state=42)
    m1.fit(dummy_feature_matrix, FEATURE_NAMES)
    _, sc1, _ = m1.score_samples(dummy_feature_matrix)

    m2 = VikaraIsolationForest(n_estimators=50, random_state=42)
    m2.fit(dummy_feature_matrix, FEATURE_NAMES)
    _, sc2, _ = m2.score_samples(dummy_feature_matrix)

    np.testing.assert_allclose(sc1, sc2, rtol=1e-6)
