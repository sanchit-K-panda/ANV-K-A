"""API tests for /api/supervisory (P0-3 cross-organisation ranking + P0-4 examiner queue)."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_ranking_endpoint_returns_ranked_socs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/supervisory/ranking")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ranked_count"] >= 2, "P0-3 requires at least two organisations"
    assert data["rankings"], "no rankings returned"
    assert data["rankings"][0]["rank"] == 1
    top = data["rankings"][0]
    assert top["capability_areas"], "top SOC must expose capability-area breakdown"
    # Itemized factor-sum invariant: area scores must sum to total penalty
    assert sum(a["score"] for a in top["capability_areas"]) == top["total_penalty"]
    # Every factor must carry metric + reason (explainability contract)
    for area in top["capability_areas"]:
        for factor in area["factors"]:
            assert factor["metric"]
            assert factor["reason"]


@pytest.mark.asyncio
async def test_ranking_top_soc_has_factors_for_worst_area():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/supervisory/ranking")
    top = resp.json()["rankings"][0]
    worst = next(a for a in top["capability_areas"] if a["area"] == top["worst_area"])
    assert worst["score"] > 0, "worst area of the #1 SOC must have nonzero penalty"


@pytest.mark.asyncio
async def test_examiner_samples_for_top_soc():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rank_resp = await client.get("/api/supervisory/ranking")
        top_soc = rank_resp.json()["rankings"][0]["soc_id"]
        resp = await client.get(f"/api/supervisory/ranking/{top_soc}/samples?top_n=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["queue_size"] == len(data["queue"]) <= 5
    for item in data["queue"]:
        assert item["reasons"], "every sample must carry a reason (P0-4 contract)"
        assert item["incident_ref"], "samples must deep-link to incidents"
        assert any(
            kw in " ".join(item["reasons"]).lower()
            for kw in ("no investigation record", "sign-off", "critical severity",
                       "baseline", "recurs", "without written notes")
        ), "reasons must reference concrete fields, not vibes"


@pytest.mark.asyncio
async def test_examiner_samples_unknown_soc_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/supervisory/ranking/SOC-999/samples")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_examiner_dossier_generation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rank_resp = await client.get("/api/supervisory/ranking")
        top_soc = rank_resp.json()["rankings"][0]["soc_id"]
        resp = await client.get(f"/api/supervisory/ranking/{top_soc}/dossier?top_n=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["soc_id"] == top_soc
    assert len(data["sha256_seal"]) == 64, "SHA-256 seal must be 64 hex characters"
    assert "ANVĪKṢA SUPERVISORY EXAMINER AUDIT DOSSIER" in data["markdown_content"]
    assert "Cryptographic Audit Seal" in data["markdown_content"]
    assert len(data["samples"]) <= 5


@pytest.mark.asyncio
async def test_record_and_list_examiner_action():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        action_payload = {
            "case_id": "CASE-TEST-001",
            "soc_id": "SOC-001",
            "action_type": "FLAG_ON_SITE",
            "examiner_notes": "Immediate on-site verification required for anomalous closure velocity.",
            "examiner_id": "EXAMINER-NTRO-01",
        }
        post_resp = await client.post("/api/supervisory/examiner/action", json=action_payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["action_id"].startswith("ACT-")
        assert len(post_data["audit_hash"]) == 64
        assert post_data["status"] == "RECORDED_IN_SAKṢĪ_LEDGER"

        list_resp = await client.get("/api/supervisory/examiner/actions?soc_id=SOC-001")
        assert list_resp.status_code == 200
        items = list_resp.json()
        assert any(it["case_id"] == "CASE-TEST-001" for it in items)


