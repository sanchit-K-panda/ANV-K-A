"""Ingestion normalization, validation, and schema sanitization layer."""
from __future__ import annotations

import json
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

logger = logging.getLogger(__name__)


def dumps_json(v: Any) -> str:
    """Safe JSON dumps for Text columns."""
    if v is None:
        return "{}"
    if isinstance(v, str):
        try:
            json.loads(v)
            return v
        except Exception:
            return json.dumps(v)
    try:
        return json.dumps(v, default=str)
    except Exception as e:
        logger.warning("JSON dumps failed: %s value=%r", e, v)
        return "{}"


def normalize_severity(severity: str) -> str:
    return severity.strip().upper() if isinstance(severity, str) else severity


def ensure_list(v: Any) -> list:
    if v is None:
        return []
    if isinstance(v, list):
        return v
    return [v]


def parse_iso_timestamp(ts: Any) -> str:
    """Parses various timestamp inputs into standardized ISO8601 UTC string."""
    if not ts:
        return datetime.now(UTC).isoformat()
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=UTC)
        return ts.isoformat()
    if isinstance(ts, (int, float)):
        if ts > 1e11:
            ts = ts / 1000.0
        return datetime.fromtimestamp(ts, tz=UTC).isoformat()
    if isinstance(ts, str):
        try:
            clean_ts = ts.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_ts)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=UTC)
            return dt.isoformat()
        except Exception:
            return datetime.now(UTC).isoformat()
    return datetime.now(UTC).isoformat()


class IngestionNormalizer:
    """Normalizes raw incoming SOC telemetry records."""

    @staticmethod
    def normalize_event(raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "event_id": str(raw.get("event_id") or f"EVT-{uuid.uuid4().hex[:8].upper()}"),
            "timestamp": parse_iso_timestamp(raw.get("timestamp")),
            "event_type": str(raw.get("event_type", "GENERIC_EVENT")),
            "severity": str(raw.get("severity", "LOW")).upper(),
            "source_ip": raw.get("source_ip"),
            "destination_ip": raw.get("destination_ip"),
            "device_id": raw.get("device_id"),
            "user_id": raw.get("user_id"),
            "soc_id": raw.get("soc_id", "SOC-001"),
            "raw_payload": raw.get("raw_payload", {}),
        }

    @staticmethod
    def normalize_alert(raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "alert_id": str(raw.get("alert_id") or f"ALT-{uuid.uuid4().hex[:8].upper()}"),
            "timestamp": parse_iso_timestamp(raw.get("timestamp")),
            "title": str(raw.get("title", "Unnamed Alert")),
            "severity": str(raw.get("severity", "MEDIUM")).upper(),
            "category": str(raw.get("category", "UNKNOWN")),
            "source_event_ids": list(raw.get("source_event_ids", [])),
            "soc_id": raw.get("soc_id", "SOC-001"),
            "metadata": raw.get("metadata", {}),
        }

    @staticmethod
    def normalize_incident(raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "incident_id": str(raw.get("incident_id") or f"INC-{uuid.uuid4().hex[:8].upper()}"),
            "created_at": parse_iso_timestamp(raw.get("created_at") or raw.get("timestamp")),
            "closed_at": parse_iso_timestamp(raw.get("closed_at")) if raw.get("closed_at") else None,
            "title": str(raw.get("title", "SOC Incident")),
            "severity": str(raw.get("severity", "MEDIUM")).upper(),
            "status": str(raw.get("status", "OPEN")).upper(),
            "soc_id": str(raw.get("soc_id", "SOC-001")),
            "assigned_analyst_id": raw.get("assigned_analyst_id"),
            "alert_ids": list(raw.get("alert_ids", [])),
            "threat_ids": list(raw.get("threat_ids", [])),
            "asset_ids": list(raw.get("asset_ids", [])),
            "metadata": raw.get("metadata", {}),
        }

    @staticmethod
    def normalize_investigation(raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "investigation_id": str(raw.get("investigation_id") or f"INV-{uuid.uuid4().hex[:8].upper()}"),
            "incident_id": str(raw.get("incident_id", "")),
            "analyst_id": str(raw.get("analyst_id", "")),
            "started_at": parse_iso_timestamp(raw.get("started_at")),
            "completed_at": parse_iso_timestamp(raw.get("completed_at")) if raw.get("completed_at") else None,
            "findings_summary": str(raw.get("findings_summary", "")),
            "actions_taken": list(raw.get("actions_taken", [])),
            "notes": str(raw.get("notes", "")),
        }

    @staticmethod
    def normalize_escalation(raw: dict[str, Any]) -> dict[str, Any]:
        return {
            "escalation_id": str(raw.get("escalation_id") or f"ESC-{uuid.uuid4().hex[:8].upper()}"),
            "incident_id": str(raw.get("incident_id", "")),
            "escalated_by": str(raw.get("escalated_by", "")),
            "escalated_to": str(raw.get("escalated_to", "")),
            "timestamp": parse_iso_timestamp(raw.get("timestamp")),
            "reason": str(raw.get("reason", "")),
            "target_tier": str(raw.get("target_tier", "TIER_2")),
            "status": str(raw.get("status", "PENDING")).upper(),
        }
