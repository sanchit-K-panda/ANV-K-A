"""Tests: determinism, integrity, scenarios, exporters, CLI."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from simulator.config import SimConfig
from simulator.scenarios.registry import build_scenario
from simulator.schemas.enums import ScenarioName, Severity
from simulator.validation.integrity import validate_dataset


@pytest.fixture(scope="module")
def small_cfg():
    cfg = SimConfig()
    cfg.soc_count = 1
    cfg.analysts_per_soc_min = 5
    cfg.analysts_per_soc_max = 8
    cfg.assets_per_soc_min = 30
    cfg.assets_per_soc_max = 40
    cfg.events = 800
    cfg.seed = 7
    return cfg


ALL = [s.value for s in ScenarioName]


@pytest.mark.parametrize("scen", ALL)
def test_generation_runs(scen, small_cfg):
    ds = build_scenario(scen, small_cfg)
    assert len(ds.events) >= 800
    assert ds.alerts and ds.incidents or scen == "healthy"


def test_deterministic(small_cfg):
    a = build_scenario("healthy", small_cfg)
    b = build_scenario("healthy", small_cfg)
    assert [e.event_id for e in a.events] == [e.event_id for e in b.events]
    assert [i.incident_id for i in a.incidents] == [i.incident_id for i in b.incidents]
    assert a.metadata.ground_truth_count == b.metadata.ground_truth_count


@pytest.mark.parametrize("scen", ALL)
def test_referential_integrity_in_memory(scen, small_cfg):
    ds = build_scenario(scen, small_cfg)
    analyst_ids = {a.analyst_id for a in ds.analysts}
    asset_ids = {a.asset_id for a in ds.assets}
    event_ids = {e.event_id for e in ds.events}
    alert_ids = {a.alert_id for a in ds.alerts}
    incident_ids = {i.incident_id for i in ds.incidents}
    for al in ds.alerts:
        assert al.asset_id in asset_ids
        assert al.analyst_id in analyst_ids
        assert set(al.event_ids) <= event_ids
    for inc in ds.incidents:
        assert set(inc.alert_ids) <= alert_ids
        assert inc.assigned_analyst_id in analyst_ids
        assert set(inc.asset_ids) <= asset_ids
    for iv in ds.investigations:
        assert iv.incident_id in incident_ids
        assert iv.analyst_id in analyst_ids
    for es in ds.escalations:
        assert es.incident_id in incident_ids


def test_temporal_integrity(small_cfg):
    from datetime import timedelta
    ds = build_scenario("healthy", small_cfg)
    inc_by_id = {i.incident_id: i for i in ds.incidents}
    for iv in ds.investigations:
        assert iv.started_at >= inc_by_id[iv.incident_id].created_at - timedelta(seconds=1)
        if iv.completed_at:
            assert iv.completed_at >= iv.started_at


def test_healthy_has_empty_ground_truth(small_cfg):
    ds = build_scenario("healthy", small_cfg)
    assert ds.ground_truth == []


def test_healthy_criticals_all_investigated(small_cfg):
    ds = build_scenario("healthy", small_cfg)
    inv_incidents = {iv.incident_id for iv in ds.investigations}
    criticals = [i for i in ds.incidents if i.severity == Severity.CRITICAL]
    assert all(i.incident_id in inv_incidents for i in criticals)


def test_investigation_gap_injected(small_cfg):
    ds = build_scenario("investigation_gap", small_cfg)
    assert ds.ground_truth, "investigation_gap must produce ground truth"
    findings = {f for g in ds.ground_truth for f in g.expected_findings}
    assert {"EXECUTION_GAP", "CLOSURE_WITHOUT_INVESTIGATION"} <= findings
    # the labelled incidents really lack investigations
    inv_incidents = {iv.incident_id for iv in ds.investigations}
    for g in ds.ground_truth:
        if g.entity_type == "incident":
            assert g.entity_id not in inv_incidents


def test_kpi_manipulation_not_labelled_malicious(small_cfg):
    ds = build_scenario("kpi_manipulation", small_cfg)
    findings = {f for g in ds.ground_truth for f in g.expected_findings}
    assert "POTENTIAL_KPI_MANIPULATION" in findings
    assert not any("MALICIOUS" in f for f in findings)


def test_analyst_overload_concentration(small_cfg):
    cfg = small_cfg
    cfg.events = 3000  # need enough incidents to see concentration
    ds = build_scenario("analyst_overload", cfg)
    gt = [g for g in ds.ground_truth if g.entity_type == "analyst"]
    assert gt
    share = gt[0].actual_behaviour["dominant_share"]
    assert share > 0.3  # dominant analyst must visibly exceed a uniform share


def test_recurring_threat_same_identity(small_cfg):
    ds = build_scenario("recurring_threat", small_cfg)
    gt = [g for g in ds.ground_truth if g.entity_type == "threat"]
    assert gt
    threat_id = gt[0].entity_id
    linked = [i for i in ds.incidents if threat_id in i.threat_ids]
    assert len(linked) >= 2


def test_identity_anomaly_session_lock(small_cfg):
    ds = build_scenario("identity_anomaly", small_cfg)
    locks = [a for a in ds.actions if a.action_type == "SESSION_LOCK"]
    assert locks
    findings = {f for g in ds.ground_truth for f in g.expected_findings}
    assert "IDENTITY_ANOMALY" in findings


@pytest.mark.parametrize("scen", ALL)
def test_export_and_validate_roundtrip(scen, small_cfg, tmp_path):
    ds = build_scenario(scen, small_cfg)
    from simulator.exporters.io import export_json
    out = tmp_path / scen
    export_json(ds, out)
    rep = validate_dataset(out)
    assert rep.valid, rep.render()


def test_cli_generate_validate(tmp_path, small_cfg):
    from simulator.cli import main
    rc = main(["generate", "--scenario", "negative_space", "--events", "600",
               "--seed", "3", "--out", str(tmp_path)])
    assert rc == 0
    rc = main(["validate", str(tmp_path / "negative_space")])
    assert rc == 0


def test_cli_summary(tmp_path):
    from simulator.cli import main
    main(["generate", "--scenario", "healthy", "--events", "400",
          "--seed", "5", "--out", str(tmp_path)])
    rc = main(["summary", str(tmp_path / "healthy")])
    assert rc == 0
