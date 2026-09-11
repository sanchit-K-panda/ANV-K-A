"""SOC Blockchain Telemetry Webhook & Event Ingestion API.

Allows bank ledger services to emit high-severity security events directly to ANVĪKṢA.
Supports instant SSE broadcast via new_data_event for zero-latency dashboard alerts.
"""
from __future__ import annotations

import logging
from collections import deque
from datetime import UTC, datetime
from typing import Any, Dict, List, Union

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.stream import new_data_event
from app.models.base import get_db

logger = logging.getLogger("SocEventsAPI")

router = APIRouter(prefix="/soc", tags=["soc-events"])

# In-memory buffer for ultra-fast access by the dashboard
_RECENT_EVENTS: deque[Dict[str, Any]] = deque(maxlen=300)


class SocEventPayload(BaseModel):
    event_id: str | None = None
    soc_id: str = "SOC-BANK-01"
    timestamp: str | None = None
    event_type: str = "BLOCKCHAIN_EVENT"
    source: str = "CoreBankingLedger"
    severity: str = "INFO"
    description: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)


@router.post("/events", status_code=status.HTTP_200_OK)
async def receive_soc_event(
    payload: Union[SocEventPayload, List[SocEventPayload], Dict[str, Any], List[Dict[str, Any]]],
    request: Request,
):
    """Receive blockchain telemetry events directly via webhook.
    
    Accepts single event or batch of events.
    Triggers instant SSE update to all connected SOC analysts.
    """
    raw_items = payload if isinstance(payload, list) else [payload]
    processed_count = 0

    for item in raw_items:
        if isinstance(item, SocEventPayload):
            data = item.model_dump()
        elif isinstance(item, dict):
            data = item.copy()
        else:
            continue

        # Fill defaults
        if not data.get("event_id"):
            data["event_id"] = f"soc_{datetime.now(UTC).strftime('%Y%m%d%H%M%S%f')}"
        if not data.get("soc_id"):
            data["soc_id"] = "SOC-BANK-01"
        if not data.get("timestamp"):
            data["timestamp"] = datetime.now(UTC).isoformat()
        if not data.get("source"):
            data["source"] = "CoreBankingLedger"
        if not data.get("metadata"):
            data["metadata"] = {}

        # Prepend to buffer so newest is first
        _RECENT_EVENTS.appendleft(data)
        processed_count += 1

        if data.get("severity") in ("DANGER", "CRITICAL") or "SIPHON" in str(data):
            logger.warning(
                "🚨 CRITICAL TELEMETRY INGESTED: %s | %s | %s",
                data.get("event_type"),
                data.get("severity"),
                data.get("description"),
            )

    # Trigger live SSE broadcast to frontend dashboard
    new_data_event.set()

    return {
        "success": True,
        "received": processed_count,
        "message": f"Successfully ingested {processed_count} telemetry event(s) and broadcast to SOC.",
    }


@router.get("/events")
async def list_soc_events(limit: int = 100):
    """List recently ingested blockchain telemetry events from memory buffer."""
    events = list(_RECENT_EVENTS)[:limit]
    return {
        "success": True,
        "count": len(events),
        "events": events,
    }


@router.delete("/events")
async def clear_soc_events():
    """Clear in-memory telemetry buffer."""
    _RECENT_EVENTS.clear()
    new_data_event.set()
    return {"success": True, "message": "Buffer cleared"}
