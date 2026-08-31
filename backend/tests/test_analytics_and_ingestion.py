"""Comprehensive test and benchmark suite for Analytics and Ingestion endpoints."""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure backend and root paths are available
backend_root = Path(__file__).resolve().parent.parent
workspace_root = backend_root.parent
for p in [str(workspace_root), str(backend_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

import time
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analytics_overview_endpoint():
    r = client.get("/api/analytics/overview?scenario=investigation_gap")
    assert r.status_code == 200
    data = r.json()
    assert "health_score" in data
    assert 0 <= data["health_score"] <= 100
    assert data["status"] in ("HEALTHY", "DEGRADED", "CRITICAL_ATTENTION_REQUIRED")
    assert data["total_findings"] >= 2
    assert data["execution_gap_count"] >= 2


def test_analytics_quadrants_endpoint():
    r = client.get("/api/analytics/quadrants?scenario=investigation_gap")
    assert r.status_code == 200
    data = r.json()
    assert "detection_score" in data
    assert "investigation_score" in data
    assert "escalation_score" in data
    assert "response_score" in data
    assert data["composite_grade"] in ("A", "B", "C", "F")


def test_analytics_workload_endpoint():
    r = client.get("/api/analytics/workload?scenario=analyst_overload")
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    bottlenecks = [i for i in items if i["is_bottleneck"]]
    assert len(bottlenecks) >= 1
    assert bottlenecks[0]["analyst_id"] == "AN-00024"


def test_analytics_threats_endpoint():
    r = client.get("/api/analytics/threats?scenario=recurring_threat")
    assert r.status_code == 200
    threats = r.json()
    assert len(threats) >= 1
    target = next((t for t in threats if t["threat_id"] == "THR-00006"), None)
    assert target is not None
    assert target["incident_count"] >= 2
    assert target["remediation_applied"] is False


def test_single_record_ingestion_pipeline():
    # Event
    r_evt = client.post(
        "/api/ingest/events",
        json={"event_type": "SUSPICIOUS_LOGIN", "severity": "HIGH", "source_ip": "192.168.1.50"},
    )
    assert r_evt.status_code == 201
    assert r_evt.json()["status"] == "ok"

    # Alert
    r_alt = client.post(
        "/api/ingest/alerts",
        json={"title": "Unauthorized Access Attempt", "severity": "HIGH", "category": "AUTH"},
    )
    assert r_alt.status_code == 201

    # Incident
    r_inc = client.post(
        "/api/ingest/incidents",
        json={"title": "Compromised Operator Session", "severity": "CRITICAL", "assigned_analyst_id": "AN-001"},
    )
    assert r_inc.status_code == 201

    # Investigation
    r_inv = client.post(
        "/api/ingest/investigations",
        json={"incident_id": "INC-001", "analyst_id": "AN-001", "findings_summary": "Investigated."},
    )
    assert r_inv.status_code == 201

    # Escalation
    r_esc = client.post(
        "/api/ingest/escalations",
        json={"incident_id": "INC-001", "escalated_by": "AN-001", "escalated_to": "AN-002", "reason": "Tier 2 required."},
    )
    assert r_esc.status_code == 201


def test_batch_ingestion_and_instant_analytics():
    payload = {
        "scenario": "live_batch_test",
        "incidents": [
            {
                "incident_id": "INC-99901",
                "title": "Critical Uninvestigated Breach",
                "severity": "CRITICAL",
                "status": "CLOSED",
                "assigned_analyst_id": "AN-001",
                "created_at": "2026-08-30T10:00:00Z",
                "closed_at": "2026-08-30T10:15:00Z",
            }
        ],
        "investigations": [],
        "escalations": [],
        "analyst_actions": [
            {
                "action_id": "ACT-001",
                "incident_id": "INC-99901",
                "analyst_id": "AN-001",
                "action_type": "CLOSURE",
                "timestamp": "2026-08-30T10:15:00Z",
            }
        ],
    }

    start = time.perf_counter()
    r = client.post("/api/ingest/batch", json=payload)
    elapsed_ms = (time.perf_counter() - start) * 1000

    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert data["findings_generated"] >= 1
    # Check that execution gap or negative space on critical incident without investigation was immediately flagged
    findings = data["findings"]
    assert any(
        (f["type"] in ("EXECUTION_GAP", "NEGATIVE_SPACE"))
        and (f["entity_id"] == "INC-99901" or "INC-99901" in f.get("affected_ids", []))
        for f in findings
    )
    assert elapsed_ms < 200, f"Batch analysis took {elapsed_ms:.1f}ms (>200ms budget)"
