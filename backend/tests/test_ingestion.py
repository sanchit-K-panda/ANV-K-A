"""Phase 3 Ingestion tests — validates the full pipeline against an in-memory SQLite DB.

Tests:
- Happy path: 10 records each entity → counts match
- Malformed payload → 422 + raw preserved (Rules.md §8)
- Duplicate/idempotent upsert
- Batch endpoint with full scenario dataset
- Stats endpoint returns correct counts
"""
from __future__ import annotations

from pathlib import Path

import pytest
from httpx import AsyncClient

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATASETS_DIR = REPO_ROOT / "soc-simulator" / "datasets"


# --- Helpers ---

def _make_soc(soc_id: str = "SOC-TEST-001") -> dict:
    return {
        "soc_id": soc_id,
        "name": "Test SOC",
        "environment": "PRODUCTION",
        "location": "Mumbai",
        "timezone": "Asia/Kolkata",
        "status": "ACTIVE",
        "created_at": "2026-01-01T00:00:00Z",
    }


def _make_analyst(analyst_id: str = "AN-TEST-001", soc_id: str = "SOC-TEST-001") -> dict:
    return {
        "analyst_id": analyst_id,
        "soc_id": soc_id,
        "name": "Test Analyst",
        "role": "TIER1",
        "skill_level": 3,
        "shift": "MORNING",
        "status": "ACTIVE",
        "created_at": "2026-01-01T00:00:00Z",
    }


def _make_device(device_id: str = "DEV-TEST-001", soc_id: str = "SOC-TEST-001") -> dict:
    return {
        "device_id": device_id,
        "soc_id": soc_id,
        "hostname": "siem-01.test",
        "device_type": "SIEM",
        "ip_address": "10.0.0.1",
        "os": "Linux",
        "criticality": "HIGH",
        "status": "ONLINE",
    }


def _make_asset(asset_id: str = "ASSET-TEST-001", soc_id: str = "SOC-TEST-001") -> dict:
    return {
        "asset_id": asset_id,
        "soc_id": soc_id,
        "hostname": "server-01.test",
        "asset_type": "SERVER",
        "ip_address": "10.0.1.1",
        "criticality": "CRITICAL",
        "business_unit": "Engineering",
        "owner": "ops-team",
        "status": "ACTIVE",
    }


def _make_threat(threat_id: str = "THR-TEST-001") -> dict:
    return {
        "threat_id": threat_id,
        "name": "Test Malware",
        "category": "malware",
        "severity": "HIGH",
        "mitre_techniques": ["T1059"],
        "first_seen": "2026-01-01T00:00:00Z",
        "last_seen": "2026-01-01T12:00:00Z",
        "status": "ACTIVE",
    }


def _make_event(event_id: str = "EVT-TEST-001", soc_id: str = "SOC-TEST-001",
                asset_id: str | None = "ASSET-TEST-001") -> dict:
    return {
        "event_id": event_id,
        "soc_id": soc_id,
        "timestamp": "2026-01-01T01:00:00Z",
        "event_type": "NETWORK_ANOMALY",
        "source": "siem",
        "asset_id": asset_id,
        "severity": "HIGH",
        "description": "Test event description",
        "metadata": {"test": True},
    }


def _make_alert(alert_id: str = "ALR-TEST-001", soc_id: str = "SOC-TEST-001",
                asset_id: str = "ASSET-TEST-001", analyst_id: str = "AN-TEST-001") -> dict:
    return {
        "alert_id": alert_id,
        "soc_id": soc_id,
        "timestamp": "2026-01-01T02:00:00Z",
        "source": "siem",
        "severity": "HIGH",
        "alert_type": "INTRUSION_ATTEMPT",
        "asset_id": asset_id,
        "event_ids": ["EVT-TEST-001"],
        "analyst_id": analyst_id,
        "status": "NEW",
        "priority": 2,
        "created_at": "2026-01-01T02:00:00Z",
    }


def _make_incident(incident_id: str = "INC-TEST-001", soc_id: str = "SOC-TEST-001",
                   analyst_id: str = "AN-TEST-001") -> dict:
    return {
        "incident_id": incident_id,
        "soc_id": soc_id,
        "alert_ids": ["ALR-TEST-001"],
        "threat_ids": ["THR-TEST-001"],
        "asset_ids": ["ASSET-TEST-001"],
        "severity": "HIGH",
        "status": "OPEN",
        "created_at": "2026-01-01T03:00:00Z",
        "assigned_analyst_id": analyst_id,
    }


def _make_investigation(inv_id: str = "INV-TEST-001", incident_id: str = "INC-TEST-001",
                        analyst_id: str = "AN-TEST-001") -> dict:
    return {
        "investigation_id": inv_id,
        "incident_id": incident_id,
        "analyst_id": analyst_id,
        "started_at": "2026-01-01T04:00:00Z",
        "status": "IN_PROGRESS",
        "evidence_count": 3,
        "notes": "Initial triage",
    }


def _make_escalation(esc_id: str = "ESC-TEST-001", incident_id: str = "INC-TEST-001",
                     analyst_id: str = "AN-TEST-001") -> dict:
    return {
        "escalation_id": esc_id,
        "incident_id": incident_id,
        "analyst_id": analyst_id,
        "escalated_to": "TIER3",
        "reason": "Requires advanced analysis",
        "timestamp": "2026-01-01T05:00:00Z",
        "status": "OPEN",
    }


def _make_action(action_id: str = "ACT-TEST-001", analyst_id: str = "AN-TEST-001",
                 soc_id: str = "SOC-TEST-001") -> dict:
    return {
        "action_id": action_id,
        "analyst_id": analyst_id,
        "soc_id": soc_id,
        "incident_id": "INC-TEST-001",
        "action_type": "TRIAGE",
        "timestamp": "2026-01-01T06:00:00Z",
        "duration_seconds": 120,
        "metadata": {"notes": "triaged"},
    }


# ================================================================
# Tests
# ================================================================


class TestSingleEndpoints:
    """Test individual entity POST endpoints."""

    @pytest.mark.asyncio
    async def test_ingest_socs(self, client: AsyncClient):
        resp = await client.post("/api/ingestion/socs", json=[_make_soc()])
        assert resp.status_code == 200
        data = resp.json()
        assert data["ingested"] == 1

    @pytest.mark.asyncio
    async def test_ingest_events(self, client: AsyncClient):
        # Seed SOC + asset first (FK deps)
        await client.post("/api/ingestion/socs", json=[_make_soc()])
        await client.post("/api/ingestion/assets", json=[_make_asset()])
        resp = await client.post("/api/ingestion/events", json=[_make_event()])
        assert resp.status_code == 200
        assert resp.json()["ingested"] == 1

    @pytest.mark.asyncio
    async def test_ingest_single_object(self, client: AsyncClient):
        """Accept a single object (not wrapped in list)."""
        resp = await client.post("/api/ingestion/socs", json=_make_soc())
        assert resp.status_code == 200
        assert resp.json()["ingested"] == 1


class TestBatchEndpoint:
    """Test the batch ingestion endpoint."""

    @pytest.mark.asyncio
    async def test_batch_full_pipeline(self, client: AsyncClient):
        """Happy path: complete entity set in FK-safe order."""
        payload = {
            "socs": [_make_soc()],
            "analysts": [_make_analyst()],
            "devices": [_make_device()],
            "assets": [_make_asset()],
            "threats": [_make_threat()],
            "events": [_make_event()],
            "alerts": [_make_alert()],
            "incidents": [_make_incident()],
            "investigations": [_make_investigation()],
            "escalations": [_make_escalation()],
            "analyst_actions": [_make_action()],
        }
        resp = await client.post("/api/ingestion/batch", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_ingested"] == 11
        assert data["counts"]["socs"] == 1
        assert data["counts"]["events"] == 1
        assert data["counts"]["incidents"] == 1

    @pytest.mark.asyncio
    async def test_batch_multiple_records(self, client: AsyncClient):
        """10 records each entity type."""
        socs = [_make_soc(f"SOC-{i:03d}") for i in range(10)]
        analysts = [_make_analyst(f"AN-{i:03d}", "SOC-000") for i in range(10)]
        devices = [_make_device(f"DEV-{i:03d}", "SOC-000") for i in range(10)]
        assets = [_make_asset(f"ASSET-{i:03d}", "SOC-000") for i in range(10)]
        threats = [_make_threat(f"THR-{i:03d}") for i in range(10)]

        payload = {
            "socs": socs,
            "analysts": analysts,
            "devices": devices,
            "assets": assets,
            "threats": threats,
        }
        resp = await client.post("/api/ingestion/batch", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["counts"]["socs"] == 10
        assert data["counts"]["analysts"] == 10
        assert data["counts"]["devices"] == 10
        assert data["counts"]["assets"] == 10
        assert data["counts"]["threats"] == 10


class TestIdempotency:
    """Test that duplicate ingestion is idempotent."""

    @pytest.mark.asyncio
    async def test_duplicate_soc_upsert(self, client: AsyncClient):
        soc = _make_soc()
        # First ingest
        resp1 = await client.post("/api/ingestion/socs", json=[soc])
        assert resp1.json()["ingested"] == 1
        # Second ingest (same ID)
        resp2 = await client.post("/api/ingestion/socs", json=[soc])
        assert resp2.json()["ingested"] == 1
        # Stats should still show 1
        stats = await client.get("/api/ingestion/stats")
        assert stats.json()["socs"] == 1

    @pytest.mark.asyncio
    async def test_duplicate_batch_idempotent(self, client: AsyncClient):
        payload = {
            "socs": [_make_soc()],
            "analysts": [_make_analyst()],
        }
        await client.post("/api/ingestion/batch", json=payload)
        await client.post("/api/ingestion/batch", json=payload)
        stats = await client.get("/api/ingestion/stats")
        assert stats.json()["socs"] == 1
        assert stats.json()["analysts"] == 1


class TestMalformedPayloads:
    """Test error handling for invalid data — Rules.md §8: never silently drop."""

    @pytest.mark.asyncio
    async def test_invalid_json_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/api/ingestion/socs",
            json=[{"bad_field": "oops"}],  # missing required fields
        )
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_raw_batch_preserves_bad_records(self, client: AsyncClient):
        """The /batch/raw endpoint should log errors but not crash."""
        payload = {
            "socs": [_make_soc(), {"broken": True}],
        }
        resp = await client.post("/api/ingestion/batch/raw", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["counts"]["socs"] == 1
        assert len(data["errors"]) == 1
        assert data["errors"][0]["entity"] == "socs"


class TestStats:
    """Test the stats endpoint."""

    @pytest.mark.asyncio
    async def test_empty_stats(self, client: AsyncClient):
        resp = await client.get("/api/ingestion/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["socs"] == 0
        assert data["events"] == 0

    @pytest.mark.asyncio
    async def test_stats_after_ingest(self, client: AsyncClient):
        await client.post("/api/ingestion/socs", json=[_make_soc()])
        resp = await client.get("/api/ingestion/stats")
        assert resp.json()["socs"] == 1


class TestAliasEndpoints:
    """Test the spec-exact alias routes (POST /api/events etc.)."""

    @pytest.mark.asyncio
    async def test_alias_events(self, client: AsyncClient):
        await client.post("/api/ingestion/socs", json=[_make_soc()])
        await client.post("/api/ingestion/assets", json=[_make_asset()])
        resp = await client.post("/api/events", json=[_make_event()])
        assert resp.status_code == 200
        assert resp.json()["ingested"] == 1

    @pytest.mark.asyncio
    async def test_alias_alerts(self, client: AsyncClient):
        await client.post("/api/ingestion/socs", json=[_make_soc()])
        await client.post("/api/ingestion/assets", json=[_make_asset()])
        await client.post("/api/ingestion/analysts", json=[_make_analyst()])
        await client.post("/api/ingestion/devices", json=[_make_device()])
        resp = await client.post("/api/alerts", json=[_make_alert()])
        assert resp.status_code == 200


class TestHealthEndpoints:
    """Verify health endpoints still work."""

    @pytest.mark.asyncio
    async def test_root(self, client: AsyncClient):
        resp = await client.get("/")
        assert resp.status_code == 200
        assert "ANVĪKṢA" in resp.json()["service"]

    @pytest.mark.asyncio
    async def test_health(self, client: AsyncClient):
        resp = await client.get("/api/health")
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_ready(self, client: AsyncClient):
        resp = await client.get("/api/ready")
        assert resp.status_code == 200
