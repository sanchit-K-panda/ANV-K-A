"""Ingest router for fast live stream and batch ingestion with instant analytics."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.analytics.service import AnalyticsService
from app.ingestion.normalize import IngestionNormalizer

router = APIRouter(prefix="/ingest", tags=["ingest"])
analytics_service = AnalyticsService()

# In-memory working buffer for live ingested records
_LIVE_BUFFER: dict[str, list[dict[str, Any]]] = {
    "events": [],
    "alerts": [],
    "incidents": [],
    "investigations": [],
    "escalations": [],
    "analyst_actions": [],
}


class BatchIngestionPayload(BaseModel):
    scenario: str | None = "live_stream"
    socs: list[dict[str, Any]] | None = Field(default_factory=list)
    analysts: list[dict[str, Any]] | None = Field(default_factory=list)
    devices: list[dict[str, Any]] | None = Field(default_factory=list)
    assets: list[dict[str, Any]] | None = Field(default_factory=list)
    threats: list[dict[str, Any]] | None = Field(default_factory=list)
    events: list[dict[str, Any]] | None = Field(default_factory=list)
    alerts: list[dict[str, Any]] | None = Field(default_factory=list)
    incidents: list[dict[str, Any]] | None = Field(default_factory=list)
    investigations: list[dict[str, Any]] | None = Field(default_factory=list)
    escalations: list[dict[str, Any]] | None = Field(default_factory=list)
    analyst_actions: list[dict[str, Any]] | None = Field(default_factory=list)


class IngestResponse(BaseModel):
    status: str
    ingested_count: int
    record_type: str
    message: str


@router.post("/events", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(event: dict[str, Any]):
    norm = IngestionNormalizer.normalize_event(event)
    _LIVE_BUFFER["events"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="event",
        message=f"Event {norm['event_id']} normalized and ingested.",
    )


@router.post("/alerts", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_alert(alert: dict[str, Any]):
    norm = IngestionNormalizer.normalize_alert(alert)
    _LIVE_BUFFER["alerts"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="alert",
        message=f"Alert {norm['alert_id']} normalized and ingested.",
    )


@router.post("/incidents", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_incident(incident: dict[str, Any]):
    norm = IngestionNormalizer.normalize_incident(incident)
    _LIVE_BUFFER["incidents"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="incident",
        message=f"Incident {norm['incident_id']} normalized and ingested.",
    )


@router.post("/investigations", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_investigation(investigation: dict[str, Any]):
    norm = IngestionNormalizer.normalize_investigation(investigation)
    _LIVE_BUFFER["investigations"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="investigation",
        message=f"Investigation {norm['investigation_id']} normalized and ingested.",
    )


@router.post("/escalations", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_escalation(escalation: dict[str, Any]):
    norm = IngestionNormalizer.normalize_escalation(escalation)
    _LIVE_BUFFER["escalations"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="escalation",
        message=f"Escalation {norm['escalation_id']} normalized and ingested.",
    )


@router.post("/batch", status_code=status.HTTP_200_OK)
async def ingest_batch(payload: BatchIngestionPayload):
    norm_events = [IngestionNormalizer.normalize_event(e) for e in (payload.events or [])]
    norm_alerts = [IngestionNormalizer.normalize_alert(a) for a in (payload.alerts or [])]
    norm_incidents = [IngestionNormalizer.normalize_incident(i) for i in (payload.incidents or [])]
    norm_investigations = [IngestionNormalizer.normalize_investigation(iv) for iv in (payload.investigations or [])]
    norm_escalations = [IngestionNormalizer.normalize_escalation(e) for e in (payload.escalations or [])]

    dataset_dict = {
        "scenario": payload.scenario or "batch_ingest",
        "socs": payload.socs or [],
        "analysts": payload.analysts or [],
        "devices": payload.devices or [],
        "assets": payload.assets or [],
        "threats": payload.threats or [],
        "events": norm_events,
        "alerts": norm_alerts,
        "incidents": norm_incidents,
        "investigations": norm_investigations,
        "escalations": norm_escalations,
        "analyst_actions": payload.analyst_actions or [],
        "ground_truth": [],
        "metadata": {},
    }

    findings = analytics_service.evaluate_in_memory_dataset(dataset_dict)

    return {
        "status": "success",
        "ingested_counts": {
            "events": len(norm_events),
            "alerts": len(norm_alerts),
            "incidents": len(norm_incidents),
            "investigations": len(norm_investigations),
            "escalations": len(norm_escalations),
        },
        "findings_generated": len(findings),
        "findings": findings,
    }
