"""Unit tests for ANVĪKṢA Feature Engineering Engine."""
from datetime import datetime, timedelta, timezone
from pathlib import Path
import pandas as pd
import pytest

from ml.adapters.maya_adapter import MayaAdapter
from ml.common.features.pipeline import FeaturePipeline
from ml.common.features.schema import FEATURE_DEFINITIONS, FEATURE_NAMES, export_feature_schema_dict
from ml.common.features.windows import generate_time_windows, parse_window_duration


def test_schema_completeness():
    # Schema v1.1 (REMEDIATION.md P2-7): 31 operational + 8 governance/discipline/
    # resilience indicators = 39 features.
    assert len(FEATURE_DEFINITIONS) == 39
    assert len(FEATURE_NAMES) == 39

    schema_dict = export_feature_schema_dict()
    assert schema_dict["feature_count"] == 39
    assert schema_dict["version"] == "1.1"

    for feat in FEATURE_DEFINITIONS:
        assert feat.feature_name
        assert feat.type in ("int", "float")
        assert feat.definition
        assert len(feat.source_fields) > 0
        assert feat.aggregation
        assert feat.unit
        assert feat.missing_strategy


def test_window_parsing_and_generation():
    assert parse_window_duration("15m") == timedelta(minutes=15)
    assert parse_window_duration("1h") == timedelta(hours=1)
    assert parse_window_duration("6h") == timedelta(hours=6)
    assert parse_window_duration("24h") == timedelta(days=1)

    t0 = datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc)
    t1 = datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc)
    windows = generate_time_windows(t0, t1, window_size="1h")
    assert len(windows) == 6
    assert windows[0] == (t0, t0 + timedelta(hours=1))
    assert windows[-1] == (t0 + timedelta(hours=5), t1)


def test_feature_extraction_healthy_no_ground_truth_leakage(tmp_path: Path):
    adapter = MayaAdapter()
    dataset_dir = Path("soc-simulator/datasets/healthy")
    if not dataset_dir.exists():
        pytest.skip("soc-simulator/datasets/healthy not found")

    bundle = adapter.load_from_directory(dataset_dir)
    pipeline = FeaturePipeline(window_size="1h")
    df = pipeline.extract_features(bundle.observations)

    assert len(df) > 0
    # Verify all 35 features exist
    for f_name in FEATURE_NAMES:
        assert f_name in df.columns, f"Missing feature {f_name}"

    # Verify ZERO ground truth leakage
    forbidden_terms = ["ground_truth", "injected", "failure_injected", "expected_escalation", "scenario"]
    for col in df.columns:
        for term in forbidden_terms:
            assert term not in col.lower(), f"Ground truth leakage detected in column: {col}"

    # Verify values are finite numeric numbers
    for f_name in FEATURE_NAMES:
        assert not df[f_name].isna().any(), f"NaNs detected in feature {f_name}"
        assert not (df[f_name] == float("inf")).any(), f"Infs detected in feature {f_name}"

    # Test Parquet serialization roundtrip
    parquet_path = tmp_path / "healthy_test.parquet"
    FeaturePipeline.save_parquet(df, parquet_path)
    assert parquet_path.exists()

    df_loaded = FeaturePipeline.load_parquet(parquet_path)
    assert len(df_loaded) == len(df)
    assert list(df_loaded.columns) == list(df.columns)


def test_honest_absence_no_neutral_imputation():
    """REMEDIATION.md P0-1: a window with zero investigations/escalations/closures must
    measure 0.0 — never a fabricated healthy-looking neutral (0.85/0.90/0.75/20/45)."""
    from ml.common.features.aggregations import compute_duration_aggregations
    from ml.common.features.ratios import compute_operational_ratios
    from ml.common.features.temporal import compute_temporal_latencies

    empty_vol = {
        "alerts_received": 0, "critical_alerts": 0, "high_alerts": 0,
        "investigations_started": 0, "investigations_completed": 0,
        "investigations_reopened": 0, "escalations": 0, "closures": 0,
        "active_cases": 0, "queue_depth": 0,
    }
    ratios = compute_operational_ratios(empty_vol, prior_queue_depth=0)
    for name in ("investigation_rate", "completion_rate", "closure_rate"):
        assert ratios[name] == 0.0, f"{name} fabricated a neutral value"

    t0 = datetime(2026, 9, 1, tzinfo=timezone.utc)
    t1 = t0 + timedelta(hours=1)
    durs = compute_duration_aggregations([], t0, t1)
    assert durs["avg_investigation_duration"] == 0.0
    lat = compute_temporal_latencies([], [], t0, t1)
    assert lat["avg_time_to_escalation"] == 0.0
    assert lat["avg_time_to_closure"] == 0.0
