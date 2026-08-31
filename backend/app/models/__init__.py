"""Models package — exports all SQLAlchemy models."""
from __future__ import annotations

from app.models.analytics import (
    Finding,
    FindingSeverity,
    FindingStatus,
    FindingType,
    Recommendation,
    RiskAssessment,
)
from app.models.base import GUID, AsyncSessionLocal, Base, engine, get_db, init_db
from app.models.identity import (
    AuditLog,
    BiometricProfile,
    Session,
    User,
    UserDevice,
    UserRole,
)
from app.models.identity import (
    UserDevice as IdentityDevice,
)
from app.models.soc import (
    Alert,
    AlertStatus,
    Analyst,
    AnalystAction,
    AnalystRole,
    Asset,
    AssetType,
    Criticality,
    DeviceType,
    Escalation,
    EscalationStatus,
    Event,
    Incident,
    IncidentAlert,
    IncidentAsset,
    IncidentStatus,
    IncidentThreat,
    Investigation,
    InvestigationStatus,
    Severity,
    Shift,
    Soc,
    Threat,
)
from app.models.soc import (
    Device as SocDevice,
)

__all__ = [
    # Base
    "Base",
    "AsyncSessionLocal",
    "engine",
    "get_db",
    "init_db",
    # Identity
    "User",
    "BiometricProfile",
    "IdentityDevice",
    "Session",
    "AuditLog",
    "UserRole",
    # SOC
    "Soc",
    "Analyst",
    "SocDevice",
    "Asset",
    "Threat",
    "Event",
    "Alert",
    "Incident",
    "IncidentAlert",
    "IncidentThreat",
    "IncidentAsset",
    "Investigation",
    "Escalation",
    "AnalystAction",
    "Severity",
    "AlertStatus",
    "IncidentStatus",
    "InvestigationStatus",
    "EscalationStatus",
    "AnalystRole",
    "Shift",
    "DeviceType",
    "AssetType",
    "Criticality",
    # Analytics
    "Finding",
    "RiskAssessment",
    "Recommendation",
    "FindingType",
    "FindingSeverity",
    "FindingStatus",
]