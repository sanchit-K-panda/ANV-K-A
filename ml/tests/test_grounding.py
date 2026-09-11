"""Tests for benchmark Grounding and zero-leakage verification."""
import pandas as pd
import pytest
from ml.external.parsers.grounding import GroundingAdapter


def test_grounding_translation():
    adapter = GroundingAdapter()
    params = adapter.translate_to_maya_parameters("analyst_overload", scale_factor=0.5)

    assert params["scenario"] == "analyst_overload"
    assert "event_volume_multiplier" in params
    assert params["burst_threshold_multiplier"] > 1.0
    assert "CIC-IDS2017" in params["grounding_source"]


def test_verify_no_grounding_leakage_clean():
    adapter = GroundingAdapter()
    clean_df = pd.DataFrame({
        "time_window_start": ["2024-01-01T00:00:00Z"],
        "analyst_id": ["ANA-001"],
        "events_count": [45],
        "investigation_rate": [0.85],
        "closure_rate": [0.90],
    })

    report = adapter.verify_no_grounding_leakage(clean_df)
    assert report["clean_and_uncontaminated"] is True
    assert report["violation_count"] == 0


def test_verify_no_grounding_leakage_contaminated():
    adapter = GroundingAdapter()
    contaminated_df = pd.DataFrame({
        "time_window_start": ["2024-01-01T00:00:00Z"],
        "flow_id_src": ["192.168.1.5-10.0.0.1-80"],
        "source_port": [443],
        "cic_ids_label": ["DoS"],
    })

    report = adapter.verify_no_grounding_leakage(contaminated_df)
    assert report["clean_and_uncontaminated"] is False
    assert report["violation_count"] == 3
    assert "source_port" in report["violating_columns"]
