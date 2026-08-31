"""Phase 3 Ingestion Pipeline — POST /api/events|alerts|incidents|investigations|escalations

Validation → normalization (timestamps, severity, entity mapping) → correlation IDs → persist.
Plumbing only — handles thousands of synthetic records, no analytics logic.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.ingestion.service import get_stats, ingest_batch
from app.models.base import get_db
from app.schemas.ingestion import (
    AlertIngest,
    AnalystActionIngest,
    AnalystIngest,
    AssetIngest,
    BatchIngestRequest,
    BatchIngestResponse,
    DeviceIngest,
    EscalationIngest,
    EventIngest,
    IncidentIngest,
    IngestResponse,
    IngestStatsResponse,
    InvestigationIngest,
    SocIngest,
    ThreatIngest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


def _log_bad_record(raw: Any, err: Exception):
    """Preserve offending record for inspection per Rules.md §8 (never silently drop)."""
    try:
        preview = json.dumps(raw, default=str)[:500]
    except Exception:
        preview = str(raw)[:500]
    logger.warning("Ingestion rejected record: %s | error: %s | payload: %s", type(raw).__name__, err, preview)


# ---------- Single-type endpoints (spec: 5 required) ----------

@router.post("/events", response_model=IngestResponse)
async def ingest_events(
    payload: list[EventIngest] | EventIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(events=items)
    try:
        counts = await ingest_batch(db, req)
        return IngestResponse(ingested=counts["events"])
    except Exception as e:
        logger.exception("events ingestion failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts", response_model=IngestResponse)
async def ingest_alerts(
    payload: list[AlertIngest] | AlertIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(alerts=items)
    try:
        counts = await ingest_batch(db, req)
        return IngestResponse(ingested=counts["alerts"])
    except Exception as e:
        logger.exception("alerts ingestion failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incidents", response_model=IngestResponse)
async def ingest_incidents(
    payload: list[IncidentIngest] | IncidentIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(incidents=items)
    try:
        counts = await ingest_batch(db, req)
        return IngestResponse(ingested=counts["incidents"])
    except Exception as e:
        logger.exception("incidents ingestion failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/investigations", response_model=IngestResponse)
async def ingest_investigations(
    payload: list[InvestigationIngest] | InvestigationIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(investigations=items)
    try:
        counts = await ingest_batch(db, req)
        return IngestResponse(ingested=counts["investigations"])
    except Exception as e:
        logger.exception("investigations ingestion failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/escalations", response_model=IngestResponse)
async def ingest_escalations(
    payload: list[EscalationIngest] | EscalationIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(escalations=items)
    try:
        counts = await ingest_batch(db, req)
        return IngestResponse(ingested=counts["escalations"])
    except Exception as e:
        logger.exception("escalations ingestion failed")
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Extended coverage (SOC topology must be ingested first) ----------

@router.post("/socs", response_model=IngestResponse)
async def ingest_socs(
    payload: list[SocIngest] | SocIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(socs=items)
    counts = await ingest_batch(db, req)
    return IngestResponse(ingested=counts["socs"])


@router.post("/analysts", response_model=IngestResponse)
async def ingest_analysts(
    payload: list[AnalystIngest] | AnalystIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(analysts=items)
    counts = await ingest_batch(db, req)
    return IngestResponse(ingested=counts["analysts"])


@router.post("/devices", response_model=IngestResponse)
async def ingest_devices(
    payload: list[DeviceIngest] | DeviceIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(devices=items)
    counts = await ingest_batch(db, req)
    return IngestResponse(ingested=counts["devices"])


@router.post("/assets", response_model=IngestResponse)
async def ingest_assets(
    payload: list[AssetIngest] | AssetIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(assets=items)
    counts = await ingest_batch(db, req)
    return IngestResponse(ingested=counts["assets"])


@router.post("/threats", response_model=IngestResponse)
async def ingest_threats(
    payload: list[ThreatIngest] | ThreatIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(threats=items)
    counts = await ingest_batch(db, req)
    return IngestResponse(ingested=counts["threats"])


@router.post("/analyst_actions", response_model=IngestResponse)
async def ingest_analyst_actions(
    payload: list[AnalystActionIngest] | AnalystActionIngest,
    db: AsyncSession = Depends(get_db),
):
    items = payload if isinstance(payload, list) else [payload]
    req = BatchIngestRequest(analyst_actions=items)
    counts = await ingest_batch(db, req)
    return IngestResponse(ingested=counts["analyst_actions"])


# ---------- Batch (full dataset) ----------

@router.post("/batch", response_model=BatchIngestResponse)
async def ingest_batch_endpoint(
    payload: BatchIngestRequest,
    db: AsyncSession = Depends(get_db),
):
    """Accept full dataset in one call — FK-safe order, handles thousands of records."""
    try:
        counts = await ingest_batch(db, payload)
        total = sum(counts.values())
        return BatchIngestResponse(counts=counts, total_ingested=total)
    except Exception as e:
        logger.exception("batch ingestion failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch/raw", response_model=BatchIngestResponse)
async def ingest_batch_raw(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Tolerant raw JSON batch — logs bad records, never silently drops, preserves offending record."""
    try:
        raw = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")

    # Try to parse as BatchIngestRequest; collect per-entity errors
    errors: list[dict[str, Any]] = []
    counts = {k: 0 for k in ["socs","analysts","devices","assets","threats","events","alerts","incidents","investigations","escalations","analyst_actions"]}

    # Map raw keys to ingest models
    key_to_model = {
        "socs": SocIngest,
        "analysts": AnalystIngest,
        "devices": DeviceIngest,
        "assets": AssetIngest,
        "threats": ThreatIngest,
        "events": EventIngest,
        "alerts": AlertIngest,
        "incidents": IncidentIngest,
        "investigations": InvestigationIngest,
        "escalations": EscalationIngest,
        "analyst_actions": AnalystActionIngest,
        "actions": AnalystActionIngest,  # alias
    }

    validated_payload = BatchIngestRequest()

    for key, model in key_to_model.items():
        raw_list = raw.get(key) if isinstance(raw, dict) else None
        if raw_list is None and key == "actions":
            continue
        if raw_list is None:
            continue
        if not isinstance(raw_list, list):
            raw_list = [raw_list]
        valid_items = []
        for idx, rec in enumerate(raw_list):
            try:
                valid_items.append(model.model_validate(rec))
            except Exception as e:
                _log_bad_record(rec, e)
                errors.append({"entity": key, "index": idx, "error": str(e), "record": rec})
        # assign to payload
        attr = "analyst_actions" if key == "actions" else key
        setattr(validated_payload, attr, valid_items)

    counts = await ingest_batch(db, validated_payload)
    # Merge with error-aware counts
    total = sum(counts.values())
    return BatchIngestResponse(counts=counts, total_ingested=total, errors=errors)


# ---------- Stats & health ----------

@router.get("/stats", response_model=IngestStatsResponse)
async def ingestion_stats(db: AsyncSession = Depends(get_db)):
    stats = await get_stats(db)
    return IngestStatsResponse(**stats)


# Backwards compat aliases per Phases.md spec (POST /api/events etc. without /ingestion prefix)
# These are mounted as sub-router under /api, so /api/ingestion/* already covers.
# Alias router for spec-exact paths:
alias_router = APIRouter(tags=["ingestion-alias"])


@alias_router.post("/events", response_model=IngestResponse)
async def alias_events(payload: list[EventIngest] | EventIngest, db: AsyncSession = Depends(get_db)):
    return await ingest_events(payload, db)


@alias_router.post("/alerts", response_model=IngestResponse)
async def alias_alerts(payload: list[AlertIngest] | AlertIngest, db: AsyncSession = Depends(get_db)):
    return await ingest_alerts(payload, db)


@alias_router.post("/incidents", response_model=IngestResponse)
async def alias_incidents(payload: list[IncidentIngest] | IncidentIngest, db: AsyncSession = Depends(get_db)):
    return await ingest_incidents(payload, db)


@alias_router.post("/investigations", response_model=IngestResponse)
async def alias_investigations(payload: list[InvestigationIngest] | InvestigationIngest, db: AsyncSession = Depends(get_db)):
    return await ingest_investigations(payload, db)


@alias_router.post("/escalations", response_model=IngestResponse)
async def alias_escalations(payload: list[EscalationIngest] | EscalationIngest, db: AsyncSession = Depends(get_db)):
    return await ingest_escalations(payload, db)
from typing import Dict, List, Optional
from fastapi import status
from pydantic import BaseModel, Field
from app.ingestion.normalize import IngestionNormalizer
from app.analytics.service import AnalyticsService

analytics_service = AnalyticsService()


# In-memory working buffer for live ingested records
_LIVE_BUFFER: Dict[str, List[Dict[str, Any]]] = {
    "events": [],
    "alerts": [],
    "incidents": [],
    "investigations": [],
    "escalations": [],
    "analyst_actions": [],
}


class BatchIngestionPayload(BaseModel):
    scenario: Optional[str] = "live_stream"
    socs: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    analysts: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    devices: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    assets: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    threats: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    events: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    alerts: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    incidents: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    investigations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    escalations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    analyst_actions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class IngestResponse(BaseModel):
    status: str
    ingested_count: int
    record_type: str
    message: str


@router.post("/events", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(event: Dict[str, Any]):
    """Ingests a single raw event, normalizes it, and buffers it."""
    norm = IngestionNormalizer.normalize_event(event)
    _LIVE_BUFFER["events"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="event",
        message=f"Event {norm['event_id']} normalized and ingested.",
    )


@router.post("/alerts", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_alert(alert: Dict[str, Any]):
    """Ingests a single alert."""
    norm = IngestionNormalizer.normalize_alert(alert)
    _LIVE_BUFFER["alerts"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="alert",
        message=f"Alert {norm['alert_id']} normalized and ingested.",
    )


@router.post("/incidents", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_incident(incident: Dict[str, Any]):
    """Ingests a single incident."""
    norm = IngestionNormalizer.normalize_incident(incident)
    _LIVE_BUFFER["incidents"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="incident",
        message=f"Incident {norm['incident_id']} normalized and ingested.",
    )


@router.post("/investigations", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_investigation(investigation: Dict[str, Any]):
    """Ingests a single investigation."""
    norm = IngestionNormalizer.normalize_investigation(investigation)
    _LIVE_BUFFER["investigations"].append(norm)
    return IngestResponse(
        status="ok",
        ingested_count=1,
        record_type="investigation",
        message=f"Investigation {norm['investigation_id']} normalized and ingested.",
    )


@router.post("/escalations", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_escalation(escalation: Dict[str, Any]):
    """Ingests a single escalation."""
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
    """Batch ingests normalized telemetry and immediately triggers supervisory analytics."""
    norm_events = [IngestionNormalizer.normalize_event(e) for e in (payload.events or [])]
    norm_alerts = [IngestionNormalizer.normalize_alert(a) for a in (payload.alerts or [])]
    norm_incidents = [IngestionNormalizer.normalize_incident(i) for i in (payload.incidents or [])]
    norm_investigations = [IngestionNormalizer.normalize_investigation(iv) for iv in (payload.investigations or [])]
    norm_escalations = [IngestionNormalizer.normalize_escalation(e) for e in (payload.escalations or [])]

    # Evaluate using AnalyticsService
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
