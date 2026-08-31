"""Integration test for Findings API and Supervisory Analytics evaluation routes."""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure backend and root paths are available
backend_root = Path(__file__).resolve().parent.parent
workspace_root = backend_root.parent
for p in [str(workspace_root), str(backend_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_evaluate_scenario_api():
    r = client.post("/api/analytics/evaluate-scenario/investigation_gap")
    assert r.status_code == 200
    findings = r.json()
    assert len(findings) >= 2
    for f in findings:
        assert "explainability" in f
        assert "risk" in f
        assert f["explainability"]["what"]
        assert f["explainability"]["why"]
        assert f["explainability"]["where"]
        assert f["risk"]["score"] > 0
        assert len(f["risk"]["factors"]) >= 2


def test_list_findings_api():
    # Pre-populate with evaluation
    client.post("/api/analytics/evaluate-scenario/investigation_gap")
    
    r = client.get("/api/findings")
    assert r.status_code == 200
    findings = r.json()
    assert len(findings) >= 2

    # Test severity filtering
    r_crit = client.get("/api/findings?severity=CRITICAL")
    assert r_crit.status_code == 200
    for f in r_crit.json():
        assert f["severity"] == "CRITICAL"


def test_get_finding_detail_api():
    r = client.post("/api/analytics/evaluate-scenario/recurring_threat")
    assert r.status_code == 200
    findings = r.json()
    assert len(findings) >= 1
    target_id = findings[0]["id"]

    r_detail = client.get(f"/api/findings/{target_id}")
    assert r_detail.status_code == 200
    f = r_detail.json()
    assert f["id"] == target_id
    assert f["type"] == "RECURRING_THREAT"
    assert f["entity_id"] == "THR-00006"
    assert "Repeated Unresolved Threats" in f["risk"]["breakdown"]
