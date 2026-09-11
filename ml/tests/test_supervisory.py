"""Tests for cross-organisation supervisory ranking + examiner queue (P0-3/P0-4).

Key acceptance test (REMEDIATION.md P0-3): ranking must be derived from DATA, not
hardcoded — verified by building two synthetic datasets with swapped behavioural
profiles and asserting the ranking follows the behaviour.
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "soc-simulator" / "src"))

from ml.preprocessing.dataset_loader import LoadedDataset  # noqa: E402
from ml.supervisory.ranking import CAPABILITY_AREAS, rank_socs, ranking_summary  # noqa: E402
from ml.supervisory.examiner import examiner_queue, examiner_queue_summary  # noqa: E402


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _make_dataset(soc_specs: list[dict]) -> LoadedDataset:
    """soc_specs: [{soc_id, name, escalate: bool, close_fast: bool, skip_investigation: bool}]"""
    t0 = datetime(2026, 8, 1, tzinfo=timezone.utc)
    ds = LoadedDataset(scenario="ranking_test")
    for spec in soc_specs:
        sid = spec["soc_id"]
        ds.socs.append({"soc_id": sid, "name": spec.get("name", sid)})
        for k in range(10):
            created = t0 + timedelta(hours=k)
            closed = created + (timedelta(minutes=8) if spec.get("close_fast") else timedelta(hours=30))
            iid = f"{sid}-INC-{k:03d}"
            inc = {
                "incident_id": iid, "soc_id": sid, "severity": "CRITICAL",
                "status": "CLOSED", "created_at": _iso(created), "closed_at": _iso(closed),
                "assigned_analyst_id": f"{sid}-AN-1", "alert_ids": [], "asset_ids": [],
                "threat_ids": [],
            }
            ds.incidents.append(inc)
            ds.incidents_by_id[iid] = inc
            if not spec.get("skip_investigation"):
                ds.investigations.append({
                    "investigation_id": f"{sid}-INV-{k:03d}", "incident_id": iid,
                    "analyst_id": f"{sid}-AN-1", "started_at": _iso(created),
                    "completed_at": _iso(created + timedelta(minutes=30)),
                    "status": "COMPLETED", "evidence_count": 3,
                    "notes": "investigated" if not spec.get("no_notes") else "",
                })
            if spec.get("escalate"):
                ds.escalations.append({
                    "escalation_id": f"{sid}-ESC-{k:03d}", "incident_id": iid,
                    "analyst_id": f"{sid}-AN-1", "escalated_to": f"{sid}-AN-9",
                    "reason": "senior review", "timestamp": _iso(created),
                    "status": "RESOLVED",
                })
    ds.build_indexes()
    return ds


def test_ranking_follows_behaviour_not_labels():
    """P0-3 acceptance: the closure-gaming SOC must rank #1 (worst) on data alone."""
    good = _make_dataset([{
        "soc_id": "SOC-G", "name": "Disciplined SOC", "escalate": True,
        "close_fast": False, "skip_investigation": False,
    }])
    bad = _make_dataset([{
        "soc_id": "SOC-B", "name": "Gaming SOC", "escalate": False,
        "close_fast": True, "skip_investigation": True,
    }])
    summary = ranking_summary(rank_socs([good, bad]))
    assert summary["ranked_count"] == 2
    assert summary["rankings"][0]["soc_id"] == "SOC-B", (
        "closure-gaming SOC must rank worst: "
        f"{[(r['soc_id'], r['total_penalty']) for r in summary['rankings']]}"
    )
    top = summary["rankings"][0]
    # Every point must be itemized into named factors
    assert top["capability_areas"], "ranking must expose capability areas"
    all_factors = [f for a in top["capability_areas"] for f in a["factors"]]
    assert all_factors, "top SOC must carry named factors"
    assert sum(a["score"] for a in top["capability_areas"]) == top["total_penalty"]
    assert top["sample_size"]["incidents"] == 10


def test_ranking_is_itemized_factor_sum():
    ds = _make_dataset([{"soc_id": "SOC-X", "escalate": True, "close_fast": False}])
    rankings = rank_socs([ds])
    r = rankings[0]
    assert {a.area for a in r.capability_areas} == set(CAPABILITY_AREAS)
    for area in r.capability_areas:
        assert area.score == sum(f.points for f in area.factors)


def test_ranking_invariant_to_soc_order():
    a = _make_dataset([{"soc_id": "SOC-A", "escalate": False, "close_fast": True, "skip_investigation": True}])
    b = _make_dataset([{"soc_id": "SOC-B", "escalate": True, "close_fast": False}])
    r1 = [r.soc_id for r in rank_socs([a, b])]
    r2 = [r.soc_id for r in rank_socs([b, a])]
    assert r1 == r2


def test_examiner_queue_flags_and_reasons():
    ds = _make_dataset([
        {"soc_id": "SOC-G", "escalate": True, "close_fast": False},
        {"soc_id": "SOC-B", "escalate": False, "close_fast": True, "skip_investigation": True, "no_notes": True},
    ])
    queue = examiner_queue(ds, soc_id="SOC-B")
    assert queue, "examiner queue must not be empty for a gaming SOC"
    assert len(queue) <= 25
    top = queue[0]
    assert top.factors.get("closure_without_investigation") == 25
    assert top.reasons, "every sample must carry reasons"
    assert any("no investigation record" in r.lower() for r in top.reasons)
    # Deterministic ordering
    again = examiner_queue(ds, soc_id="SOC-B")
    assert [s.case_id for s in again] == [s.case_id for s in queue]


def test_examiner_queue_summary_contract():
    ds = _make_dataset([{"soc_id": "SOC-B", "escalate": False, "close_fast": True, "skip_investigation": True}])
    summary = examiner_queue_summary(ds, soc_id="SOC-B", top_n=5)
    assert summary["queue_size"] == len(summary["queue"]) <= 5
    assert all("reasons" in item and item["reasons"] for item in summary["queue"])
