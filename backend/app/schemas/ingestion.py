"""Pydantic schemas for Phase 3 ingestion — validation + normalization.

Accepts simulator string IDs (e.g. "SOC-001", "AL-00001") and normalizes
before persistence via deterministic UUID mapping.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Fixed namespace for deterministic string→UUID mapping (preserves FK integrity)
ANVIKSA_NAMESPACE = uuid.UUID("6f1d5a8e-4b5c-4a1e-9d8e-7f6a5b4c3d2e")


def to_uuid(s: str) -> uuid.UUID:
    """Deterministic string ID → UUID (preserves referential integrity)."""
    return uuid.uuid5(ANVIKSA_NAMESPACE, s)


def normalize_timestamp(v: Any) -> datetime:
    """Normalize timestamp to UTC aware datetime."""
    if isinstance(v, datetime):
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)
    if isinstance(v, str):
        # Handle "Z" suffix
        if v.endswith("Z"):
            v = v[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(v)
        except ValueError as e:
            raise ValueError(f"Invalid timestamp: {v}") from e
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    raise ValueError(f"Invalid timestamp type: {type(v)}")


def normalize_severity(v: Any) -> str:
    if isinstance(v, str):
        return v.upper()
    return v


class _IngestBase(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


# === SOC ===

class SocIngest(_IngestBase):
    soc_id: str
    name: str
    environment: Literal["PRODUCTION", "STAGING"] = "PRODUCTION"
    location: str
    timezone: str = "Asia/Kolkata"
    status: str = "ACTIVE"
    created_at: datetime

    @field_validator("created_at", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        return normalize_timestamp(v)

    @field_validator("severity", mode="before", check_fields=False)
    @classmethod
    def _norm_sev(cls, v):
        return normalize_severity(v) if v else v


class AnalystIngest(_IngestBase):
    analyst_id: str
    soc_id: str
    name: str
    role: str
    skill_level: int = Field(ge=1, le=5)
    shift: str
    status: str = "ACTIVE"
    created_at: datetime

    @field_validator("created_at", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        return normalize_timestamp(v)


class DeviceIngest(_IngestBase):
    device_id: str
    soc_id: str
    hostname: str
    device_type: str
    ip_address: str
    os: str
    criticality: str
    status: str = "ONLINE"


class AssetIngest(_IngestBase):
    asset_id: str
    soc_id: str
    hostname: str
    asset_type: str
    ip_address: str
    criticality: str
    business_unit: str
    owner: str
    status: str = "ACTIVE"


class ThreatIngest(_IngestBase):
    threat_id: str
    name: str
    category: str
    severity: str
    mitre_techniques: list[str] = Field(default_factory=list)
    first_seen: datetime
    last_seen: datetime
    status: str = "ACTIVE"

    @field_validator("first_seen", "last_seen", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        return normalize_timestamp(v)


class EventIngest(_IngestBase):
    event_id: str
    soc_id: str
    timestamp: datetime
    event_type: str
    source: str
    asset_id: str | None = None
    device_id: str | None = None
    analyst_id: str | None = None
    severity: str
    description: str
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("timestamp", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        return normalize_timestamp(v)

    @field_validator("severity", mode="before")
    @classmethod
    def _norm_sev(cls, v):
        return normalize_severity(v)


class AlertIngest(_IngestBase):
    alert_id: str
    soc_id: str
    timestamp: datetime
    source: str
    severity: str
    alert_type: str
    asset_id: str
    event_ids: list[str] = Field(default_factory=list)
    analyst_id: str
    status: str = "NEW"
    priority: int = Field(ge=1, le=5, default=3)
    created_at: datetime
    closed_at: datetime | None = None

    @field_validator("timestamp", "created_at", "closed_at", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        if v is None:
            return v
        return normalize_timestamp(v)

    @field_validator("severity", mode="before")
    @classmethod
    def _norm_sev(cls, v):
        return normalize_severity(v)


class IncidentIngest(_IngestBase):
    incident_id: str
    soc_id: str
    alert_ids: list[str] = Field(default_factory=list)
    threat_ids: list[str] = Field(default_factory=list)
    asset_ids: list[str] = Field(default_factory=list)
    severity: str
    status: str = "OPEN"
    created_at: datetime
    closed_at: datetime | None = None
    assigned_analyst_id: str

    @field_validator("created_at", "closed_at", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        if v is None:
            return v
        return normalize_timestamp(v)

    @field_validator("severity", mode="before")
    @classmethod
    def _norm_sev(cls, v):
        return normalize_severity(v)


class InvestigationIngest(_IngestBase):
    investigation_id: str
    incident_id: str
    analyst_id: str
    started_at: datetime
    completed_at: datetime | None = None
    status: str = "IN_PROGRESS"
    evidence_count: int = Field(ge=0, default=0)
    notes: str = ""

    @field_validator("started_at", "completed_at", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        if v is None:
            return v
        return normalize_timestamp(v)


class EscalationIngest(_IngestBase):
    escalation_id: str
    incident_id: str
    analyst_id: str
    escalated_to: str
    reason: str
    timestamp: datetime
    status: str = "OPEN"

    @field_validator("timestamp", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        return normalize_timestamp(v)


class AnalystActionIngest(_IngestBase):
    action_id: str
    analyst_id: str
    soc_id: str
    incident_id: str | None = None
    action_type: str
    timestamp: datetime
    duration_seconds: int = Field(ge=0, default=0)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("timestamp", mode="before")
    @classmethod
    def _norm_ts(cls, v):
        return normalize_timestamp(v)


# === Batch payload ===

class BatchIngestRequest(_IngestBase):
    """Full dataset batch — all entity arrays optional but validated if present."""
    socs: list[SocIngest] = Field(default_factory=list)
    analysts: list[AnalystIngest] = Field(default_factory=list)
    devices: list[DeviceIngest] = Field(default_factory=list)
    assets: list[AssetIngest] = Field(default_factory=list)
    threats: list[ThreatIngest] = Field(default_factory=list)
    events: list[EventIngest] = Field(default_factory=list)
    alerts: list[AlertIngest] = Field(default_factory=list)
    incidents: list[IncidentIngest] = Field(default_factory=list)
    investigations: list[InvestigationIngest] = Field(default_factory=list)
    escalations: list[EscalationIngest] = Field(default_factory=list)
    analyst_actions: list[AnalystActionIngest] = Field(default_factory=list)


class IngestResponse(BaseModel):
    """Response for single-type ingest."""
    status: str = "ok"
    ingested: int
    skipped: int = 0
    errors: list[dict[str, Any]] = Field(default_factory=list)


class BatchIngestResponse(BaseModel):
    status: str = "ok"
    counts: dict[str, int] = Field(default_factory=dict)
    total_ingested: int = 0
    errors: list[dict[str, Any]] = Field(default_factory=list)


class IngestStatsResponse(BaseModel):
    socs: int = 0
    analysts: int = 0
    devices: int = 0
    assets: int = 0
    threats: int = 0
    events: int = 0
    alerts: int = 0
    incidents: int = 0
    investigations: int = 0
    escalations: int = 0
    analyst_actions: int = 0
