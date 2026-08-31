"""Supervisory Analytics API Endpoints for Dashboard & Deep-Dive Analytics."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from ml.preprocessing.dataset_loader import load_dataset_from_dir
from ml.preprocessing.feature_extraction import FeatureExtractor
from ml.schemas import FindingSeverity, FindingType
from pydantic import BaseModel, Field

from app.analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])
analytics_service = AnalyticsService()


class SocHealthOverview(BaseModel):
    health_score: int = Field(ge=0, le=100, description="Overall SOC operational health score")
    status: str
    total_findings: int
    critical_findings: int
    high_findings: int
    execution_gap_count: int
    negative_space_count: int
    behavioural_anomaly_count: int
    threat_recurrence_count: int
    workload_imbalance_count: int
    kpi_manipulation_count: int
    identity_anomaly_count: int
    last_evaluated_scenario: str


class QuadrantScore(BaseModel):
    detection_score: int = Field(ge=0, le=100)
    investigation_score: int = Field(ge=0, le=100)
    escalation_score: int = Field(ge=0, le=100)
    response_score: int = Field(ge=0, le=100)
    composite_grade: str


class AnalystWorkloadItem(BaseModel):
    analyst_id: str
    name: str
    role: str
    total_incidents: int
    critical_incidents: int
    critical_case_share: float
    mean_closure_minutes: float
    investigation_rate: float
    is_bottleneck: bool


class ThreatRecurrenceItem(BaseModel):
    threat_id: str
    name: str
    category: str
    incident_count: int
    affected_assets: list[str]
    all_closed: bool
    remediation_applied: bool


def _get_active_dataset(scenario: str = "investigation_gap"):
    candidates = [
        Path("soc-simulator/datasets") / scenario,
        Path("../soc-simulator/datasets") / scenario,
        Path(__file__).resolve().parent.parent.parent.parent / "soc-simulator" / "datasets" / scenario,
    ]
    for p in candidates:
        if p.exists():
            return load_dataset_from_dir(p)
    raise HTTPException(status_code=404, detail=f"Dataset scenario '{scenario}' not found.")


@router.get("/overview", response_model=SocHealthOverview)
async def get_soc_overview(scenario: str = "investigation_gap"):
    """Returns top-level SOC Health Score and supervisory anomaly counters."""
    dataset = _get_active_dataset(scenario)
    findings = analytics_service.pipeline.run(dataset)

    crit_count = sum(1 for f in findings if f.severity == FindingSeverity.CRITICAL)
    high_count = sum(1 for f in findings if f.severity == FindingSeverity.HIGH)
    
    # Calculate health score: 100 minus penalty for critical/high findings
    penalty = (crit_count * 25) + (high_count * 12)
    health = max(10, 100 - penalty)
    
    status_label = "HEALTHY" if health >= 85 else ("DEGRADED" if health >= 55 else "CRITICAL_ATTENTION_REQUIRED")

    return SocHealthOverview(
        health_score=health,
        status=status_label,
        total_findings=len(findings),
        critical_findings=crit_count,
        high_findings=high_count,
        execution_gap_count=sum(1 for f in findings if f.type == FindingType.EXECUTION_GAP),
        negative_space_count=sum(1 for f in findings if f.type == FindingType.NEGATIVE_SPACE),
        behavioural_anomaly_count=sum(1 for f in findings if f.type == FindingType.BEHAVIOURAL_ANOMALY),
        threat_recurrence_count=sum(1 for f in findings if f.type == FindingType.RECURRING_THREAT),
        workload_imbalance_count=sum(1 for f in findings if f.type == FindingType.WORKLOAD_IMBALANCE),
        kpi_manipulation_count=sum(1 for f in findings if f.type == FindingType.KPI_MANIPULATION),
        identity_anomaly_count=sum(1 for f in findings if f.type == FindingType.IDENTITY_ANOMALY),
        last_evaluated_scenario=scenario,
    )


@router.get("/quadrants", response_model=QuadrantScore)
async def get_quadrant_scores(scenario: str = "investigation_gap"):
    """Returns 4-quadrant operational effectiveness scores (Detection, Investigation, Escalation, Response)."""
    dataset = _get_active_dataset(scenario)
    traces = FeatureExtractor.extract_incident_traces(dataset)

    total_incidents = max(1, len(traces))
    investigated = sum(1 for t in traces.values() if t.has_investigation)
    inv_score = int(round((investigated / total_incidents) * 100))

    criticals = [t for t in traces.values() if t.severity == "CRITICAL"]
    if criticals:
        escalated_crit = sum(1 for t in criticals if t.has_escalation)
        esc_score = int(round((escalated_crit / len(criticals)) * 100))
    else:
        esc_score = 100

    closed = [t for t in traces.values() if t.has_closure]
    resp_score = int(round((sum(1 for t in closed if t.has_response) / max(1, len(closed))) * 100))
    det_score = 92  # Baseline telemetry ingestion coverage

    mean_score = (det_score + inv_score + esc_score + resp_score) // 4
    grade = "A" if mean_score >= 85 else ("B" if mean_score >= 70 else ("C" if mean_score >= 50 else "F"))

    return QuadrantScore(
        detection_score=det_score,
        investigation_score=inv_score,
        escalation_score=esc_score,
        response_score=resp_score,
        composite_grade=grade,
    )


@router.get("/workload", response_model=list[AnalystWorkloadItem])
async def get_workload_matrix(scenario: str = "analyst_overload"):
    """Returns per-analyst operational queue distribution and bottleneck flags."""
    dataset = _get_active_dataset(scenario)
    traces = FeatureExtractor.extract_incident_traces(dataset)
    analysts = FeatureExtractor.extract_analyst_features(dataset, traces)

    items = []
    for af in analysts.values():
        if af.role == "SUPERVISOR":
            continue
        items.append(
            AnalystWorkloadItem(
                analyst_id=af.analyst_id,
                name=af.name,
                role=af.role,
                total_incidents=af.total_incidents,
                critical_incidents=af.critical_incidents,
                critical_case_share=af.critical_case_share,
                mean_closure_minutes=af.mean_closure_minutes,
                investigation_rate=af.investigation_rate,
                is_bottleneck=af.critical_case_share >= 0.50 and af.critical_incidents >= 2,
            )
        )

    items.sort(key=lambda x: x.critical_incidents, reverse=True)
    return items


@router.get("/threats", response_model=list[ThreatRecurrenceItem])
async def get_threat_recurrence_matrix(scenario: str = "recurring_threat"):
    """Returns threat persistence and remediation adherence tracking."""
    dataset = _get_active_dataset(scenario)
    items = []

    for threat in dataset.threats:
        tid = threat.get("threat_id", "")
        associated = dataset.incidents_by_threat.get(tid, [])
        if not associated:
            continue

        assets = set()
        for inc in associated:
            assets.update(inc.get("asset_ids", []))

        closed = [i for i in associated if i.get("status") in ("RESOLVED", "CLOSED")]
        
        remediation_flags = []
        inc_ids = {i["incident_id"] for i in associated}
        for act in dataset.analyst_actions:
            if act.get("incident_id") in inc_ids and act.get("action_type") == "CLOSURE":
                meta = act.get("metadata", {})
                if "remediation_applied" in meta:
                    remediation_flags.append(meta.get("remediation_applied", True))

        any_remediated = any(r is True for r in remediation_flags) if remediation_flags else (threat.get("status") != "UNRESOLVED")

        items.append(
            ThreatRecurrenceItem(
                threat_id=tid,
                name=threat.get("name", tid),
                category=threat.get("category", "UNKNOWN"),
                incident_count=len(associated),
                affected_assets=list(assets),
                all_closed=len(closed) == len(associated) and len(closed) > 0,
                remediation_applied=any_remediated,
            )
        )

    items.sort(key=lambda t: t.incident_count, reverse=True)
    return items
