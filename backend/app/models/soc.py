"""SQLAlchemy models for ANVĪKṢA — SOC Telemetry & Analytics tables."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.identity import User


class Severity(str):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class AlertStatus(str):
    NEW = "NEW"
    TRIAGED = "TRIAGED"
    CLOSED = "CLOSED"


class IncidentStatus(str):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class InvestigationStatus(str):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class EscalationStatus(str):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class AnalystRole(str):
    TIER1 = "TIER1"
    TIER2 = "TIER2"
    TIER3 = "TIER3"
    SUPERVISOR = "SUPERVISOR"


class Shift(str):
    MORNING = "MORNING"
    EVENING = "EVENING"
    NIGHT = "NIGHT"


class DeviceType(str):
    SIEM = "SIEM"
    EDR = "EDR"
    IDS = "IDS"
    FIREWALL = "FIREWALL"
    CASE_MANAGEMENT = "CASE_MANAGEMENT"


class AssetType(str):
    SERVER = "SERVER"
    WORKSTATION = "WORKSTATION"
    DATABASE = "DATABASE"
    NETWORK_DEVICE = "NETWORK_DEVICE"
    CLOUD_INSTANCE = "CLOUD_INSTANCE"
    IOT = "IOT"


class Criticality(str):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class FindingType(str):
    EXECUTION_GAP = "EXECUTION_GAP"
    NEGATIVE_SPACE = "NEGATIVE_SPACE"
    BEHAVIOURAL_ANOMALY = "BEHAVIOURAL_ANOMALY"
    RECURRING_THREAT = "RECURRING_THREAT"
    WORKLOAD_IMBALANCE = "WORKLOAD_IMBALANCE"
    KPI_MANIPULATION = "KPI_MANIPULATION"
    IDENTITY_ANOMALY = "IDENTITY_ANOMALY"


class FindingSeverity(str):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class FindingStatus(str):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class Soc(Base):
    __tablename__ = "socs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    environment: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    timezone: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    analysts: Mapped[list["Analyst"]] = relationship(
        back_populates="soc", cascade="all, delete-orphan"
    )
    devices: Mapped[list["Device"]] = relationship(
        back_populates="soc", cascade="all, delete-orphan"
    )
    assets: Mapped[list["Asset"]] = relationship(
        back_populates="soc", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="soc", cascade="all, delete-orphan"
    )
    incidents: Mapped[list["Incident"]] = relationship(
        back_populates="soc", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_socs_status", "status"),
    )


class Analyst(Base):
    __tablename__ = "analysts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        SQLEnum(AnalystRole, name="analyst_role"), nullable=False
    )
    skill_level: Mapped[int] = mapped_column(Integer, nullable=False)
    shift: Mapped[str] = mapped_column(
        SQLEnum(Shift, name="shift"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    soc: Mapped["Soc"] = relationship(back_populates="analysts")
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="analyst", foreign_keys="Alert.analyst_id"
    )
    incidents: Mapped[list["Incident"]] = relationship(
        back_populates="assigned_analyst", foreign_keys="Incident.assigned_analyst_id"
    )
    investigations: Mapped[list["Investigation"]] = relationship(
        back_populates="analyst", foreign_keys="Investigation.analyst_id"
    )
    escalations: Mapped[list["Escalation"]] = relationship(
        back_populates="analyst", foreign_keys="Escalation.analyst_id"
    )
    actions: Mapped[list["AnalystAction"]] = relationship(
        back_populates="analyst", foreign_keys="AnalystAction.analyst_id"
    )

    __table_args__ = (
        Index("ix_analysts_soc_id", "soc_id"),
        Index("ix_analysts_role", "role"),
    )


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    device_type: Mapped[str] = mapped_column(
        SQLEnum(DeviceType, name="device_type"), nullable=False
    )
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    os: Mapped[str] = mapped_column(String(100), nullable=False)
    criticality: Mapped[str] = mapped_column(
        SQLEnum(Criticality, name="criticality"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ONLINE")

    soc: Mapped["Soc"] = relationship(back_populates="devices")
    events: Mapped[list["Event"]] = relationship(
        back_populates="device", foreign_keys="Event.device_id"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="source_device", foreign_keys="Alert.source_device_id"
    )

    __table_args__ = (
        Index("ix_devices_soc_id", "soc_id"),
        Index("ix_devices_type", "device_type"),
    )


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[str] = mapped_column(
        SQLEnum(AssetType, name="asset_type"), nullable=False
    )
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    criticality: Mapped[str] = mapped_column(
        SQLEnum(Criticality, name="criticality"), nullable=False
    )
    business_unit: Mapped[str] = mapped_column(String(255), nullable=False)
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")

    soc: Mapped["Soc"] = relationship(back_populates="assets")
    events: Mapped[list["Event"]] = relationship(
        back_populates="asset", foreign_keys="Event.asset_id"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="asset", foreign_keys="Alert.asset_id"
    )
    incidents: Mapped[list["Incident"]] = relationship(
        back_populates="assets", secondary="incident_assets"
    )

    __table_args__ = (
        Index("ix_assets_soc_id", "soc_id"),
        Index("ix_assets_type", "asset_type"),
        Index("ix_assets_criticality", "criticality"),
    )


class Threat(Base):
    __tablename__ = "threats"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(
        SQLEnum(Severity, name="severity"), nullable=False
    )
    mitre_techniques: Mapped[list[str]] = mapped_column(
        Text, nullable=False, default="[]"
    )
    first_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")

    incidents: Mapped[list["Incident"]] = relationship(
        back_populates="threats", secondary="incident_threats"
    )

    __table_args__ = (
        Index("ix_threats_severity", "severity"),
        Index("ix_threats_status", "status"),
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="SET NULL"),
        nullable=True,
    )
    device_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="SET NULL"),
        nullable=True,
    )
    analyst_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysts.id", ondelete="SET NULL"),
        nullable=True,
    )
    severity: Mapped[str] = mapped_column(
        SQLEnum(Severity, name="severity"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    metadata: Mapped[str] = mapped_column(Text, nullable=False, default="{}")

    soc: Mapped["Soc"] = relationship(back_populates="events")
    asset: Mapped["Asset | None"] = relationship(
        back_populates="events", foreign_keys=[asset_id]
    )
    device: Mapped["Device | None"] = relationship(
        back_populates="events", foreign_keys=[device_id]
    )
    analyst: Mapped["Analyst | None"] = relationship(
        foreign_keys=[analyst_id]
    )

    __table_args__ = (
        Index("ix_events_soc_id", "soc_id"),
        Index("ix_events_timestamp", "timestamp"),
        Index("ix_events_severity", "severity"),
        Index("ix_events_type", "event_type"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(
        SQLEnum(Severity, name="severity"), nullable=False
    )
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False)
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="CASCADE"),
        nullable=False,
    )
    source_device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
    )
    event_ids: Mapped[list[uuid.UUID]] = mapped_column(
        Text, nullable=False, default="[]"
    )
    analyst_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysts.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        SQLEnum(AlertStatus, name="alert_status"), nullable=False, default=AlertStatus.NEW
    )
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    soc: Mapped["Soc"] = relationship(back_populates="alerts")
    asset: Mapped["Asset"] = relationship(
        back_populates="alerts", foreign_keys=[asset_id]
    )
    source_device: Mapped["Device"] = relationship(
        back_populates="alerts", foreign_keys=[source_device_id]
    )
    analyst: Mapped["Analyst"] = relationship(
        back_populates="alerts", foreign_keys=[analyst_id]
    )
    incidents: Mapped[list["Incident"]] = relationship(
        back_populates="alerts", secondary="incident_alerts"
    )

    __table_args__ = (
        Index("ix_alerts_soc_id", "soc_id"),
        Index("ix_alerts_timestamp", "timestamp"),
        Index("ix_alerts_severity", "severity"),
        Index("ix_alerts_status", "status"),
        Index("ix_alerts_analyst_id", "analyst_id"),
    )


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    severity: Mapped[str] = mapped_column(
        SQLEnum(Severity, name="severity"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        SQLEnum(IncidentStatus, name="incident_status"),
        nullable=False,
        default=IncidentStatus.OPEN,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    assigned_analyst_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysts.id", ondelete="CASCADE"),
        nullable=False,
    )

    soc: Mapped["Soc"] = relationship(back_populates="incidents")
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="incidents", secondary="incident_alerts"
    )
    threats: Mapped[list["Threat"]] = relationship(
        back_populates="incidents", secondary="incident_threats"
    )
    assets: Mapped[list["Asset"]] = relationship(
        back_populates="incidents", secondary="incident_assets"
    )
    assigned_analyst: Mapped["Analyst"] = relationship(
        back_populates="incidents", foreign_keys=[assigned_analyst_id]
    )
    investigations: Mapped[list["Investigation"]] = relationship(
        back_populates="incident", cascade="all, delete-orphan"
    )
    escalations: Mapped[list["Escalation"]] = relationship(
        back_populates="incident", cascade="all, delete-orphan"
    )
    findings: Mapped[list["Finding"]] = relationship(
        back_populates="incident", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_incidents_soc_id", "soc_id"),
        Index("ix_incidents_severity", "severity"),
        Index("ix_incidents_status", "status"),
        Index("ix_incidents_assigned_analyst_id", "assigned_analyst_id"),
        Index("ix_incidents_created_at", "created_at"),
    )


class IncidentAlert(Base):
    __tablename__ = "incident_alerts"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    alert_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("alerts.id", ondelete="CASCADE"),
        primary_key=True,
    )


class IncidentThreat(Base):
    __tablename__ = "incident_threats"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    threat_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("threats.id", ondelete="CASCADE"),
        primary_key=True,
    )


class IncidentAsset(Base):
    __tablename__ = "incident_assets"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="CASCADE"),
        primary_key=True,
    )


class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    analyst_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysts.id", ondelete="CASCADE"),
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        SQLEnum(InvestigationStatus, name="investigation_status"),
        nullable=False,
        default=InvestigationStatus.IN_PROGRESS,
    )
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")

    incident: Mapped["Incident"] = relationship(back_populates="investigations")
    analyst: Mapped["Analyst"] = relationship(
        back_populates="investigations", foreign_keys=[analyst_id]
    )

    __table_args__ = (
        Index("ix_investigations_incident_id", "incident_id"),
        Index("ix_investigations_analyst_id", "analyst_id"),
        Index("ix_investigations_status", "status"),
    )


class Escalation(Base):
    __tablename__ = "escalations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    analyst_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysts.id", ondelete="CASCADE"),
        nullable=False,
    )
    escalated_to: Mapped[str] = mapped_column(String(255), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    status: Mapped[str] = mapped_column(
        SQLEnum(EscalationStatus, name="escalation_status"),
        nullable=False,
        default=EscalationStatus.OPEN,
    )

    incident: Mapped["Incident"] = relationship(back_populates="escalations")
    analyst: Mapped["Analyst"] = relationship(
        back_populates="escalations", foreign_keys=[analyst_id]
    )

    __table_args__ = (
        Index("ix_escalations_incident_id", "incident_id"),
        Index("ix_escalations_analyst_id", "analyst_id"),
        Index("ix_escalations_timestamp", "timestamp"),
    )


class AnalystAction(Base):
    __tablename__ = "analyst_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analyst_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysts.id", ondelete="CASCADE"),
        nullable=False,
    )
    soc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("socs.id", ondelete="CASCADE"),
        nullable=False,
    )
    incident_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    metadata: Mapped[str] = mapped_column(Text, nullable=False, default="{}")

    analyst: Mapped["Analyst"] = relationship(
        back_populates="actions", foreign_keys=[analyst_id]
    )
    soc: Mapped["Soc"] = relationship()
    incident: Mapped["Incident | None"] = relationship(foreign_keys=[incident_id])

    __table_args__ = (
        Index("ix_analyst_actions_analyst_id", "analyst_id"),
        Index("ix_analyst_actions_soc_id", "soc_id"),
        Index("ix_analyst_actions_incident_id", "incident_id"),
        Index("ix_analyst_actions_timestamp", "timestamp"),
        Index("ix_analyst_actions_type", "action_type"),
    )