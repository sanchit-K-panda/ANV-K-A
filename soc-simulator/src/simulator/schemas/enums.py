"""Shared enums and constants for the SOC Simulator data contract.

These are part of the frozen data contract (see docs/SCHEMAS.md).
Do not change casually after generators are implemented.
"""
from __future__ import annotations

from enum import StrEnum


class Severity(StrEnum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class AlertStatus(StrEnum):
    NEW = "NEW"
    TRIAGED = "TRIAGED"
    CLOSED = "CLOSED"


class IncidentStatus(StrEnum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class InvestigationStatus(StrEnum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class EscalationStatus(StrEnum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class AnalystRole(StrEnum):
    TIER1 = "TIER1"
    TIER2 = "TIER2"
    TIER3 = "TIER3"
    SUPERVISOR = "SUPERVISOR"


class Shift(StrEnum):
    MORNING = "MORNING"
    EVENING = "EVENING"
    NIGHT = "NIGHT"


class DeviceType(StrEnum):
    SIEM = "SIEM"
    EDR = "EDR"
    IDS = "IDS"
    FIREWALL = "FIREWALL"
    CASE_MANAGEMENT = "CASE_MANAGEMENT"


class AssetType(StrEnum):
    SERVER = "SERVER"
    WORKSTATION = "WORKSTATION"
    DATABASE = "DATABASE"
    NETWORK_DEVICE = "NETWORK_DEVICE"
    CLOUD_INSTANCE = "CLOUD_INSTANCE"
    IOT = "IOT"


class Criticality(StrEnum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ActionType(StrEnum):
    TRIAGE = "TRIAGE"
    INVESTIGATION_START = "INVESTIGATION_START"
    EVIDENCE_COLLECTION = "EVIDENCE_COLLECTION"
    ESCALATION = "ESCALATION"
    RESPONSE = "RESPONSE"
    CLOSURE = "CLOSURE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    SESSION_LOCK = "SESSION_LOCK"
    ADMIN_ACTION = "ADMIN_ACTION"
    IDENTITY_VERIFICATION = "IDENTITY_VERIFICATION"


class ScenarioName(StrEnum):
    HEALTHY = "healthy"
    INVESTIGATION_GAP = "investigation_gap"
    NEGATIVE_SPACE = "negative_space"
    KPI_MANIPULATION = "kpi_manipulation"
    ANALYST_OVERLOAD = "analyst_overload"
    RECURRING_THREAT = "recurring_threat"
    IDENTITY_ANOMALY = "identity_anomaly"


# Workflow steps expected for critical incidents, in order.
CRITICAL_WORKFLOW = ["TRIAGE", "INVESTIGATION", "ESCALATION", "RESPONSE", "CLOSURE"]
# Workflow expected for non-critical incidents.
STANDARD_WORKFLOW = ["TRIAGE", "INVESTIGATION", "CLOSURE"]

SEVERITY_WEIGHTS = {Severity.INFO: 30, Severity.LOW: 30, Severity.MEDIUM: 25,
                    Severity.HIGH: 12, Severity.CRITICAL: 3}
