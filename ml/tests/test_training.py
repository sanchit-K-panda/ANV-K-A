"""Tests for the ANVĪKṢA offline ML training subsystem.

Uses a tiny smoke corpus (small event counts, deterministic seeds) so the
whole module runs in seconds while exercising the real path:
generate → label → train → persist → load → detect.
"""
from __future__ import annotations

import numpy as np
import pytest

from ml.behaviour.isolation_forest import BehavioralIsolationForest
from ml.models.explainability_engine import SupervisoryAnalyticsPipeline
from ml.models.registry import ModelRegistry, TrainedBehaviourModels
from ml.preprocessing.dataset_loader import LoadedDataset
from ml.schemas import FindingType
from ml.training import corpus as corpus_mod
from ml.training.sample_builder import (
    BEHAVIOUR_CLF_FEATURES,
    BEHAVIOUR_IF_FEATURES,
    build_samples,
    feature_matrix,
    ground_truth_analyst_ids,
)
from ml.training.train import train_models

SMOKE_SEEDS = (9101, 9102, 9103)


def _tiny_dataset(scenario: str, seed: int) -> LoadedDataset:
    return corpus_mod.generate_dataset(scenario, seed, events=8000, soc_count=1, dense=True)


@pytest.fixture(scope="module")
def smoke_corpus() -> dict:
    datasets = {}
    for seed in SMOKE_SEEDS:
        datasets[f"healthy_{seed}"] = _tiny_dataset("healthy", seed)
    for seed in SMOKE_SEEDS[:2]:
        datasets[f"kpi_manipulation_{seed}"] = _tiny_dataset("kpi_manipulation", seed)
    datasets["analyst_overload_9101"] = _tiny_dataset("analyst_overload", SMOKE_SEEDS[0])
    return datasets


@pytest.fixture(scope="module")
def smoke_samples(smoke_corpus) -> list:
    return build_samples(smoke_corpus.values())


@pytest.fixture(scope="module")
def smoke_trained(tmp_path_factory, smoke_samples) -> TrainedBehaviourModels:
    models, _metrics = train_models(smoke_samples, clf_estimators=100)
    registry = ModelRegistry(tmp_path_factory.mktemp("artifacts"))
    registry.save(models, metadata={"source": "pytest smoke corpus"})
    loaded = registry.load()
    assert loaded is not None
    return loaded


def test_corpus_generation_is_deterministic():
    a = _tiny_dataset("healthy", 9101)
    b = _tiny_dataset("healthy", 9101)
    assert [i["incident_id"] for i in a.incidents] == [i["incident_id"] for i in b.incidents]
    assert len(a.analysts) > 0 and len(a.ground_truth) == 0


def test_ground_truth_labels(smoke_corpus):
    healthy = smoke_corpus[f"healthy_{SMOKE_SEEDS[0]}"]
    kpi = smoke_corpus[f"kpi_manipulation_{SMOKE_SEEDS[0]}"]
    overload = smoke_corpus[f"analyst_overload_{SMOKE_SEEDS[0]}"]

    assert ground_truth_analyst_ids(healthy) == set()
    kpi_pos = ground_truth_analyst_ids(kpi)
    assert len(kpi_pos) > 0  # analyst_group entries
    assert len(ground_truth_analyst_ids(overload)) == 1  # single dominant analyst


def test_sample_builder(smoke_samples):
    assert smoke_samples, "expected active analysts in every smoke dataset"
    for s in smoke_samples:
        assert set(BEHAVIOUR_IF_FEATURES).issubset(s.features)
        assert set(BEHAVIOUR_CLF_FEATURES).issubset(s.features)
        assert s.label in (0, 1)
        assert all(np.isfinite(v) for v in s.features.values())
    by_scenario = {}
    for s in smoke_samples:
        by_scenario.setdefault(s.scenario, set()).add(s.label)
    assert by_scenario["healthy"] == {0}  # benign by construction
    assert 1 in by_scenario["kpi_manipulation"]
    assert 1 in by_scenario["analyst_overload"]


def test_feature_matrix_shape(smoke_samples):
    X = feature_matrix(smoke_samples, BEHAVIOUR_IF_FEATURES)
    assert X.shape == (len(smoke_samples), len(BEHAVIOUR_IF_FEATURES))
    assert X.dtype == np.float32


def test_train_and_registry_roundtrip(smoke_trained):
    assert smoke_trained.isolation_forest is not None
    assert smoke_trained.classifier is not None
    assert smoke_trained.if_features == list(BEHAVIOUR_IF_FEATURES)
    assert smoke_trained.clf_features == list(BEHAVIOUR_CLF_FEATURES)
    assert 0.0 <= smoke_trained.decision_threshold <= 1.0


def test_registry_missing_artifacts_returns_none(tmp_path):
    assert ModelRegistry(tmp_path).load() is None


def test_trained_isolation_forest_stays_quiet_on_benign_soc(smoke_trained):
    """Core guarantee: a forest trained on benign cohorts must not flag a
    fresh healthy SOC (zero behavioural false positives)."""
    fresh_healthy = _tiny_dataset("healthy", 9201)
    findings = BehavioralIsolationForest().analyze_analysts(fresh_healthy, trained=smoke_trained)
    assert all(f.finding_type == FindingType.BEHAVIOURAL_ANOMALY for f in findings)
    # Allow zero findings only — any flag here is a false positive on benign data.
    assert len(findings) == 0


def test_trained_mode_flags_injected_behaviour(smoke_trained):
    """The trained model set must surface the ground-truth KPI-manipulating
    analysts (behavioural divergence + supervised confirmation)."""
    kpi = _tiny_dataset("kpi_manipulation", 9101)
    findings = BehavioralIsolationForest().analyze_analysts(kpi, trained=smoke_trained)
    flagged = {f.entity_id for f in findings}
    truth = ground_truth_analyst_ids(kpi)
    assert flagged & truth, "trained detector missed every injected analyst"
    assert all(
        f.evidence["detection_mode"] == "trained_benign_isolation_forest" for f in findings
    )


def test_pipeline_fallback_mode_without_artifacts():
    """No artifacts → legacy per-cohort fit path still works end-to-end.

    Uses the committed eval dataset: a tiny smoke cohort is too concentrated
    (injected fraction ≈ contamination) for per-cohort isolation to fire.
    """
    from ml.preprocessing.dataset_loader import load_dataset_from_dir

    pipeline = SupervisoryAnalyticsPipeline(auto_load=False)
    assert pipeline.trained_models is None
    findings = pipeline.run(load_dataset_from_dir("soc-simulator/datasets/kpi_manipulation"))
    assert isinstance(findings, list)
    behavioural = [
        d
        for f in findings
        for d in f.raw_detections
        if d.evidence.get("detection_mode") == "per_cohort_fit"
    ]
    assert len(behavioural) > 0


def test_pipeline_uses_trained_models(smoke_trained, smoke_corpus):
    pipeline = SupervisoryAnalyticsPipeline(trained_models=smoke_trained, auto_load=False)
    assert pipeline.trained_models is smoke_trained
    findings = pipeline.run(smoke_corpus[f"kpi_manipulation_{SMOKE_SEEDS[0]}"])
    assert len(findings) > 0
    for f in findings:
        assert f.explainability.what
        assert f.explainability.recommendation
        assert 0.0 <= f.risk.score <= 100
