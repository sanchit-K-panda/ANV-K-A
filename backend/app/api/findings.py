"""API endpoints for Findings and Supervisory Analytics evaluation."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from ml.schemas import FindingOutput, FindingSeverity, FindingStatus, FindingType

from app.analytics.service import AnalyticsService

router = APIRouter(tags=["findings"])
analytics_service = AnalyticsService()

# In-memory cached findings store for active session
_CACHED_FINDINGS: dict[str, FindingOutput] = {}


@router.post("/analytics/evaluate-scenario/{scenario_name}", response_model=list[FindingOutput])
async def evaluate_scenario_endpoint(scenario_name: str):
    """Executes the complete Supervisory Analytics Pipeline against a simulator scenario dataset."""
    candidates = [
        Path("soc-simulator/datasets") / scenario_name,
        Path("../soc-simulator/datasets") / scenario_name,
        Path(__file__).resolve().parent.parent.parent.parent / "soc-simulator" / "datasets" / scenario_name,
    ]
    dataset_path = None
    for p in candidates:
        if p.exists():
            dataset_path = p
            break
    
    if not dataset_path:
        raise HTTPException(status_code=404, detail=f"Scenario dataset '{scenario_name}' not found.")

    findings = analytics_service.evaluate_dataset_dir(dataset_path)
    
    # Update cache
    _CACHED_FINDINGS.clear()
    for f in findings:
        _CACHED_FINDINGS[f.id] = f

    return findings


@router.get("/findings", response_model=list[FindingOutput])
async def list_findings(
    severity: FindingSeverity | None = None,
    type: FindingType | None = None,
    status: FindingStatus | None = None,
):
    """Returns all current supervisory findings matching optional filters."""
    findings = list(_CACHED_FINDINGS.values())
    if not findings:
        # Default load investigation_gap scenario if cache empty
        default_path = Path("soc-simulator/datasets/investigation_gap")
        if default_path.exists():
            findings = analytics_service.evaluate_dataset_dir(default_path)
            for f in findings:
                _CACHED_FINDINGS[f.id] = f

    if severity:
        findings = [f for f in findings if f.severity == severity]
    if type:
        findings = [f for f in findings if f.type == type]
    if status:
        findings = [f for f in findings if f.status == status]

    return findings


@router.get("/findings/{finding_id}", response_model=FindingOutput)
async def get_finding_detail(finding_id: str):
    """Returns the full 7-part explainability card and risk factor breakdown for a specific finding."""
    if finding_id in _CACHED_FINDINGS:
        return _CACHED_FINDINGS[finding_id]
    
    # Try finding across all default scenarios
    for s_name in ("investigation_gap", "negative_space", "kpi_manipulation", "analyst_overload", "recurring_threat", "identity_anomaly"):
        p = Path("soc-simulator/datasets") / s_name
        if p.exists():
            for f in analytics_service.evaluate_dataset_dir(p):
                _CACHED_FINDINGS[f.id] = f
                if f.id == finding_id:
                    return f

    raise HTTPException(status_code=404, detail=f"Finding '{finding_id}' not found.")
