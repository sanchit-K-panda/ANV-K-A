"""Frozen Pydantic schemas for all SOC simulator entities (data contract v1)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from simulator.schemas.enums import (
    AlertStatus, AnalystRole, AssetType, Criticality, DeviceType, EscalationStatus,
    IncidentStatus, InvestigationStatus, Severity, Shift,
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


class _Base(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Soc(_Base):
    soc_id: str
    name: str
    environment: Literal["PRODUCTION", "STAGING"]
    location: str
    timezone: str
    status: Literal["ACTIVE", "INACTIVE"] = "ACTIVE"
    created_at: datetime


class Analyst(_Base):
    analyst_id: str
    soc_id: str
    name: str
    role: AnalystRole
    skill_level: int = Field(ge=1, le=5)
    shift: Shift
    status: Literal["ACTIVE", "ON_LEAVE"] = "ACTIVE"
    created_at: datetime


class Device(_Base):
    device_id: str
    soc_id: str
    hostname: str
    device_type: DeviceType
    ip_address: str
    os: str
    criticality: Criticality
    status: Literal["ONLINE", "OFFLINE", "DEGRADED"] = "ONLINE"


class Asset(_Base):
    asset_id: str
    soc_id: str
    hostname: str
    asset_type: AssetType
    ip_address: str
    criticality: Criticality
    business_unit: str
    owner: str
    status: Literal["ACTIVE", "QUARANTINED", "RETIRED"] = "ACTIVE"


class Threat(_Base):
    threat_id: str
    name: str
    category: str
    severity: Severity
    mitre_techniques: list[str]
    first_seen: datetime
    last_seen: datetime
    status: Literal["ACTIVE", "MITIGATED", "UNRESOLVED"]


class Event(_Base):
    event_id: str
    soc_id: str
    timestamp: datetime
    event_type: str
    source: str
    asset_id: str | None = None
    device_id: str | None = None
    analyst_id: str | None = None
    severity: Severity
    description: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class Alert(_Base):
    alert_id: str
    soc_id: str
    timestamp: datetime
    source: str
    severity: Severity
    alert_type: str
    asset_id: str
    event_ids: list[str]
    analyst_id: str
    status: AlertStatus
    priority: int = Field(ge=1, le=5)
    created_at: datetime
    closed_at: datetime | None = None


class Incident(_Base):
    incident_id: str
    soc_id: str
    alert_ids: list[str]
    threat_ids: list[str] = Field(default_factory=list)
    asset_ids: list[str]
    severity: Severity
    status: IncidentStatus
    created_at: datetime
    closed_at: datetime | None = None
    assigned_analyst_id: str


class Investigation(_Base):
    investigation_id: str
    incident_id: str
    analyst_id: str
    started_at: datetime
    completed_at: datetime | None = None
    status: InvestigationStatus
    evidence_count: int = Field(ge=0)
    notes: str = ""


class Escalation(_Base):
    escalation_id: str
    incident_id: str
    analyst_id: str
    escalated_to: str  # analyst_id or team name
    reason: str
    timestamp: datetime
    status: EscalationStatus


class AnalystAction(_Base):
    action_id: str
    analyst_id: str
    soc_id: str
    incident_id: str | None = None
    action_type: str
    timestamp: datetime
    duration_seconds: int = Field(ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)


class GroundTruthEntry(_Base):
    truth_id: str
    scenario_id: str
    entity_type: str
    entity_id: str
    expected_behaviour: dict[str, Any]
    actual_behaviour: dict[str, Any]
    expected_findings: list[str]
    severity: Severity
    injected: bool = True
    start_time: datetime | None = None
    end_time: datetime | None = None


class DatasetMetadata(_Base):
    dataset_id: str
    scenario: str
    seed: int
    generated_at: datetime
    config: dict[str, Any]
    soc_count: int
    analyst_count: int
    asset_count: int
    event_count: int
    alert_count: int
    incident_count: int
    investigation_count: int
    escalation_count: int
    action_count: int
    ground_truth_count: int


class Dataset(_Base):
    """A complete generated dataset in memory."""
    socs: list[Soc]
    analysts: list[Analyst]
    devices: list[Device]
    assets: list[Asset]
    threats: list[Threat]
    events: list[Event]
    alerts: list[Alert]
    incidents: list[Incident]
    investigations: list[Investigation]
    escalations: list[Escalation]
    actions: list[AnalystAction]
    ground_truth: list[GroundTruthEntry]
    metadata: DatasetMetadata
