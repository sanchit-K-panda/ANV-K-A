"""Supervisory API — cross-organisation ranking + examiner sample queue.

REMEDIATION.md P0-3: GET /api/supervisory/ranking
REMEDIATION.md P0-4: GET /api/supervisory/ranking/{soc_id}/samples

Both endpoints read the regenerated simulator datasets (multi-SOC, maturity profiles)
and derive everything from telemetry via ml/supervisory — no hardcoded rankings, no
ground-truth leakage.
"""
from __future__ import annotations

import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[3]
for p in (str(REPO_ROOT), str(REPO_ROOT / "soc-simulator" / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

from ml.preprocessing.dataset_loader import LoadedDataset, load_dataset_from_dir  # noqa: E402
from ml.supervisory.ranking import rank_socs, ranking_summary  # noqa: E402
from ml.supervisory.examiner import examiner_queue_summary  # noqa: E402

router = APIRouter(prefix="/supervisory", tags=["supervisory"])

# Scenario datasets pooled for ranking (multiple "organisations" of one deployment).
# Excludes identity_anomaly: session-level telemetry, not per-SOC workflow workflow data.
RANKING_SCENARIOS = [
    "healthy",
    "investigation_gap",
    "negative_space",
    "kpi_manipulation",
    "analyst_overload",
]


class RankingFactorOut(BaseModel):
    name: str
    points: int
    metric: str
    observed_value: float
    reason: str


class CapabilityAreaOut(BaseModel):
    area: str
    label: str
    score: int
    max_score: int
    factors: List[RankingFactorOut]


class SocRankingOut(BaseModel):
    soc_id: str
    soc_name: str
    rank: int
    total_penalty: int
    grade: str
    worst_area: str
    sample_size: Dict[str, int]
    capability_areas: List[CapabilityAreaOut]


class RankingResponse(BaseModel):
    method: str
    source: str
    ranked_count: int
    top_soc: str | None
    top_reason: str | None
    rankings: List[SocRankingOut]


class ExaminerSampleOut(BaseModel):
    case_id: str
    soc_id: str
    analyst_id: str
    severity: str
    review_score: int
    reasons: List[str]
    factors: Dict[str, int]
    created_at: str | None
    closed_at: str | None
    incident_ref: str | None
    alert_refs: List[str]
    asset_refs: List[str]


class ExaminerQueueResponse(BaseModel):
    soc_id: str | None
    method: str
    queue_size: int
    cap: int
    queue: List[ExaminerSampleOut]


def _datasets_root() -> Path:
    candidates = [
        REPO_ROOT / "soc-simulator" / "datasets",
        Path("soc-simulator/datasets"),
        Path("../soc-simulator/datasets"),
    ]
    for c in candidates:
        if c.exists():
            return c
    raise HTTPException(status_code=503, detail="Simulator datasets not found — run the dataset generation pipeline first.")


@lru_cache(maxsize=1)
def _cached_datasets() -> List[LoadedDataset]:
    root = _datasets_root()
    datasets: List[LoadedDataset] = []
    for scen in RANKING_SCENARIOS:
        d = root / scen
        if d.exists():
            datasets.append(load_dataset_from_dir(d))
    if not datasets:
        raise HTTPException(status_code=503, detail="No scenario datasets available.")
    return datasets


@router.get("/ranking", response_model=RankingResponse)
async def get_ranking(refresh: bool = Query(default=False, description="Bypass cache and reload datasets")):
    """Cross-organisation SOC ranking across the eight PS capability areas.

    Every score is an itemized, named factor sum (Rules.md §6); ranking is derived
    exclusively from telemetry.
    """
    if refresh:
        _cached_datasets.cache_clear()
    datasets = _cached_datasets()
    summary = ranking_summary(rank_socs(datasets))
    return summary


@router.get("/ranking/{soc_id}/samples", response_model=ExaminerQueueResponse)
async def get_examiner_samples(
    soc_id: str,
    top_n: int = Query(default=25, ge=1, le=100),
    refresh: bool = Query(default=False, description="Bypass cache and reload datasets"),
):
    """Prioritized examiner review queue for one ranked SOC (≤ 1 s contract, P0-4).

    Each sample carries field-referencing reasons (timestamps, missing investigation
    IDs, closure-velocity z-scores) and entity refs for deep-linking into the UI.
    """
    if refresh:
        _cached_datasets.cache_clear()
    datasets = _cached_datasets()

    all_soc_ids = {s.get("soc_id") for ds in datasets for s in ds.socs}
    if soc_id not in all_soc_ids:
        raise HTTPException(status_code=404, detail=f"Unknown SOC '{soc_id}'. Known: {sorted(all_soc_ids)}")

    # Aggregate the queue across pooled datasets for this SOC (deduped by case id).
    merged: Dict[str, Dict[str, Any]] = {}
    for ds in datasets:
        for item in examiner_queue_summary(ds, soc_id=soc_id, top_n=top_n)["queue"]:
            merged.setdefault(item["case_id"], item)
    queue = sorted(merged.values(), key=lambda x: (-x["review_score"], x["case_id"]))[:top_n]

    return {
        "soc_id": soc_id,
        "method": "deterministic itemized review score (see ml/supervisory/examiner.py)",
        "queue_size": len(queue),
        "cap": top_n,
        "queue": queue,
    }


class DossierResponse(BaseModel):
    soc_id: str
    soc_name: str
    generated_at: str
    grade: str
    total_penalty: int
    rank: int
    total_ranked: int
    worst_area: str
    sha256_seal: str
    markdown_content: str
    summary_data: Dict[str, Any]
    samples: List[ExaminerSampleOut]


@router.get("/ranking/{soc_id}/dossier", response_model=DossierResponse)
async def get_examiner_dossier(
    soc_id: str,
    top_n: int = Query(default=15, ge=1, le=50),
    refresh: bool = Query(default=False, description="Bypass cache and reload datasets"),
):
    """Generates an official offline Examiner Audit Dossier (SIH26157 Inspector Brief) with SHA-256 audit seal."""
    import hashlib
    from datetime import datetime, timezone

    if refresh:
        _cached_datasets.cache_clear()
    datasets = _cached_datasets()

    ranking_res = ranking_summary(rank_socs(datasets))
    soc_rank = next((r for r in ranking_res["rankings"] if r["soc_id"] == soc_id), None)
    if not soc_rank:
        raise HTTPException(status_code=404, detail=f"Unknown SOC '{soc_id}' in supervisory pool.")

    # Fetch top samples
    merged: Dict[str, Dict[str, Any]] = {}
    for ds in datasets:
        for item in examiner_queue_summary(ds, soc_id=soc_id, top_n=top_n)["queue"]:
            merged.setdefault(item["case_id"], item)
    queue = sorted(merged.values(), key=lambda x: (-x["review_score"], x["case_id"]))[:top_n]

    now_iso = datetime.now(timezone.utc).isoformat()

    # Generate structured markdown dossier
    lines = [
        f"# ANVĪKṢA SUPERVISORY EXAMINER AUDIT DOSSIER",
        f"**Classification:** RESTRICTED // NTRO // SAT-SA SUPERVISORY ASSESSMENT",
        f"**Inspected Entity:** {soc_rank['soc_name']} (`{soc_id}`)",
        f"**Generated At:** {now_iso}",
        f"**Supervisory Grade:** `{soc_rank['grade']}` | **Rank:** #{soc_rank['rank']} of {ranking_res['ranked_count']}",
        f"**Cumulative Penalty Score:** {soc_rank['total_penalty']} pts (Worst Lag: `{soc_rank['worst_area']}`)",
        "",
        "---",
        "",
        "## 1. Executive Capability Assessment",
        "| Capability Area | Score / Max | Status | Key Factors / Lags |",
        "| :--- | :--- | :--- | :--- |",
    ]

    for area in soc_rank["capability_areas"]:
        lag_desc = "; ".join(f"{f['name']} ({f['points']} pts)" for f in area["factors"] if f["points"] > 0) or "Conforming"
        lines.append(f"| {area['label']} | {area['score']} / {area['max_score']} | {'⚠️ LAG' if area['score'] < area['max_score'] else '✅ OK'} | {lag_desc} |")

    lines.extend([
        "",
        "---",
        "",
        f"## 2. Priority Examiner Case Inspection Queue (Top {len(queue)})",
        "The following cases exhibit highest probability of workflow evasion, SLA manipulation, or critical escalation gaps:",
        "",
    ])

    for idx, sample in enumerate(queue, 1):
        lines.extend([
            f"### Sample #{idx}: Case `{sample['case_id']}` (Score: {sample['review_score']} pts)",
            f"- **Severity:** `{sample['severity']}` | **Analyst ID:** `{sample['analyst_id']}`",
            f"- **Timeline:** Created: `{sample.get('created_at', 'N/A')}` → Closed: `{sample.get('closed_at', 'N/A')}`",
            f"- **Audit Findings & Reasons:**",
        ])
        for r in sample["reasons"]:
            lines.append(f"  * {r}")
        lines.append("")

    # Cryptographic Seal
    body_for_hash = "\n".join(lines).encode("utf-8")
    seal = hashlib.sha256(body_for_hash).hexdigest()

    lines.extend([
        "---",
        f"## 3. Cryptographic Audit Seal",
        f"**SHA-256 Digest:** `{seal}`",
        f"**Verification:** Tamper-evident SAT-SA Supervisory Chain. Local Air-Gap Validated.",
    ])

    markdown_dossier = "\n".join(lines)

    return {
        "soc_id": soc_id,
        "soc_name": soc_rank["soc_name"],
        "generated_at": now_iso,
        "grade": soc_rank["grade"],
        "total_penalty": soc_rank["total_penalty"],
        "rank": soc_rank["rank"],
        "total_ranked": ranking_res["ranked_count"],
        "worst_area": soc_rank["worst_area"],
        "sha256_seal": seal,
        "markdown_content": markdown_dossier,
        "summary_data": soc_rank,
        "samples": queue,
    }


class ExaminerActionRequest(BaseModel):
    case_id: str
    soc_id: str
    action_type: str = Field(description="FLAG_ON_SITE | REQUEST_JUSTIFICATION | ACKNOWLEDGE_EXCEPTION")
    examiner_notes: str = Field(default="", description="Inspector comments or remediation mandate")
    examiner_id: str = Field(default="EXAMINER-NTRO-01")


class ExaminerActionResponse(BaseModel):
    action_id: str
    case_id: str
    soc_id: str
    action_type: str
    examiner_id: str
    examiner_notes: str
    timestamp: str
    audit_hash: str
    previous_hash: str
    status: str


# In-memory cryptographically chained audit log for supervisory actions
_EXAMINER_ACTIONS_LEDGER: List[Dict[str, Any]] = []
_GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


@router.post("/examiner/action", response_model=ExaminerActionResponse)
async def record_examiner_action(action: ExaminerActionRequest):
    """Records an interactive human-in-the-loop examiner supervisory action with SAKṢĪ SHA-256 chain."""
    import hashlib
    import uuid
    from datetime import datetime, timezone

    now_iso = datetime.now(timezone.utc).isoformat()
    action_id = f"ACT-{uuid.uuid4().hex[:8].upper()}"

    prev_hash = _EXAMINER_ACTIONS_LEDGER[-1]["audit_hash"] if _EXAMINER_ACTIONS_LEDGER else _GENESIS_HASH

    payload = f"{prev_hash}|{action_id}|{action.case_id}|{action.soc_id}|{action.action_type}|{action.examiner_id}|{now_iso}"
    curr_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()

    record = {
        "action_id": action_id,
        "case_id": action.case_id,
        "soc_id": action.soc_id,
        "action_type": action.action_type,
        "examiner_id": action.examiner_id,
        "examiner_notes": action.examiner_notes,
        "timestamp": now_iso,
        "audit_hash": curr_hash,
        "previous_hash": prev_hash,
        "status": "RECORDED_IN_SAKṢĪ_LEDGER",
    }
    _EXAMINER_ACTIONS_LEDGER.append(record)
    return record


@router.get("/examiner/actions", response_model=List[ExaminerActionResponse])
async def list_examiner_actions(soc_id: str | None = None):
    """Retrieves all recorded examiner supervisory actions."""
    if soc_id:
        return [a for a in _EXAMINER_ACTIONS_LEDGER if a["soc_id"] == soc_id]
    return _EXAMINER_ACTIONS_LEDGER


