"""Test suite validating all 7 SOC Simulator Ground Truth scenarios against the Supervisory Analytics Pipeline."""
from __future__ import annotations

import pytest
from pathlib import Path

from ml.evaluation.benchmark import evaluate_scenario
from ml.models.explainability_engine import SupervisoryAnalyticsPipeline


@pytest.fixture(scope="module")
def pipeline():
    return SupervisoryAnalyticsPipeline()


@pytest.mark.parametrize(
    "scenario_name,min_precision,min_recall,min_f1",
    [
        ("healthy", 1.0, 1.0, 1.0),
        ("investigation_gap", 0.90, 0.85, 0.87),
        ("negative_space", 0.90, 0.85, 0.85),
        ("kpi_manipulation", 0.90, 0.85, 0.85),
        ("analyst_overload", 0.90, 0.85, 0.85),
        ("recurring_threat", 0.90, 0.85, 0.85),
        ("identity_anomaly", 0.90, 0.85, 0.85),
    ],
)
def test_scenario_ground_truth(pipeline, scenario_name, min_precision, min_recall, min_f1):
    dataset_dir = Path("soc-simulator/datasets") / scenario_name
    assert dataset_dir.exists(), f"Dataset directory missing: {dataset_dir}"

    result = evaluate_scenario(dataset_dir, pipeline)

    assert result.recall >= min_recall, (
        f"Scenario {scenario_name} Recall {result.recall:.2f} below threshold {min_recall:.2f}. "
        f"Missed entities: {result.missed_entities}"
    )
    assert result.precision >= min_precision, (
        f"Scenario {scenario_name} Precision {result.precision:.2f} below threshold {min_precision:.2f}."
    )
    assert result.f1_score >= min_f1, (
        f"Scenario {scenario_name} F1-Score {result.f1_score:.2f} below threshold {min_f1:.2f}."
    )
