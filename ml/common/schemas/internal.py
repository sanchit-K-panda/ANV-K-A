"""ANVĪKṢA Unified Internal Data Model.

Defines the stable, source-agnostic internal representations for all cyber entities,
operational events, and supervisory references, preserving full data provenance.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
import uuid

from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class IndicatorType(str, Enum):
    IPV4 = "ipv4"
    IPV6 = "ipv6"
    DOMAIN = "domain"
    URL = "url"
    SHA256 = "sha256"
    MD5 = "md5"
    CVE = "cve"
    UNKNOWN = "unknown"


class Provenance(BaseModel):
    """Source provenance tracking contract per prompt §8."""
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    source: str = "maya_soc_simulator"
    source_record_id: Optional[str] = None
    retrieved_at: datetime = Field(default_factory=utc_now)
    event_timestamp: Optional[datetime] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    source_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    dataset_version: str = "1.0"
    normalization_version: str = "1.0"
    license: str = "MIT"


class BaseEntity(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)
    provenance: Provenance = Field(default_factory=Provenance)


# 1. Indicator
class Indicator(BaseEntity):
    indicator_id: str = Field(default_factory=lambda: f"IOC-{uuid.uuid4().hex[:8].upper()}")
    value: str
    indicator_type: IndicatorType
    threat_ids: List[str] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)


# 2. Threat
class Threat(BaseEntity):
    threat_id: str
    name: str
    category: str
    severity: SeverityLevel
    mitre_techniques: List[str] = Field(default_factory=list)
    first_seen: datetime
    last_seen: datetime
    status: str = "ACTIVE"  # ACTIVE, MITIGATED, UNRESOLVED


# 3. Attack
class Attack(BaseEntity):
    attack_id: str
    technique_id: str  # e.g., T1059.001
    tactic: str        # e.g., Execution, Initial Access
    name: str
    description: str = ""
    external_reference: Optional[str] = None


# 4. Infrastructure
class Infrastructure(BaseEntity):
    infra_id: str
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    asn: Optional[str] = None
    country: Optional[str] = None
    category: str = "UNKNOWN"  # C2, PHISHING_HOST, SCANNER, LEGITIMATE


# 5. Organization
class Organization(BaseEntity):
    org_id: str
    name: str
    industry: str
    region: str
    criticality: SeverityLevel = SeverityLevel.MEDIUM


# 6. Asset
class Asset(BaseEntity):
    asset_id: str
    soc_id: str
    hostname: str
    asset_type: str  # WORKSTATION, SERVER, DC, FIREWALL, CLOUD_INSTANCE
    ip_address: str
    criticality: SeverityLevel
    business_unit: str = "SECURITY"
    owner: str = "IT_OPS"
    status: str = "ACTIVE"  # ACTIVE, QUARANTINED, RETIRED


# 7. Event
class Event(BaseEntity):
    event_id: str
    soc_id: str
    timestamp: datetime
    event_type: str
    source: str
    asset_id: Optional[str] = None
    device_id: Optional[str] = None
    analyst_id: Optional[str] = None
    severity: SeverityLevel
    description: str = ""
    raw_payload: Dict[str, Any] = Field(default_factory=dict)


# 8. Alert
class Alert(BaseEntity):
    alert_id: str
    soc_id: str
    timestamp: datetime
    source: str
    severity: SeverityLevel
    alert_type: str
    asset_id: str
    event_ids: List[str] = Field(default_factory=list)
    analyst_id: Optional[str] = None
    status: str = "NEW"  # NEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
    priority: int = Field(default=3, ge=1, le=5)
    created_at: datetime
    closed_at: Optional[datetime] = None


# 9. Incident
class Incident(BaseEntity):
    incident_id: str
    soc_id: str
    alert_ids: List[str] = Field(default_factory=list)
    threat_ids: List[str] = Field(default_factory=list)
    asset_ids: List[str] = Field(default_factory=list)
    severity: SeverityLevel
    status: str = "OPEN"  # OPEN, INVESTIGATING, ESCALATED, RESOLVED, CLOSED
    created_at: datetime
    closed_at: Optional[datetime] = None
    assigned_analyst_id: str


# 10. Investigation
class Investigation(BaseEntity):
    investigation_id: str
    incident_id: str
    analyst_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str = "IN_PROGRESS"  # IN_PROGRESS, COMPLETED, SUSPENDED
    evidence_count: int = Field(default=0, ge=0)
    notes: str = ""


# 11. AnalystAction
class AnalystAction(BaseEntity):
    action_id: str
    analyst_id: str
    soc_id: str
    incident_id: Optional[str] = None
    action_type: str
    timestamp: datetime
    duration_seconds: int = Field(default=0, ge=0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


# 12. Escalation
class Escalation(BaseEntity):
    escalation_id: str
    incident_id: str
    analyst_id: str
    escalated_to: str
    reason: str
    timestamp: datetime
    status: str = "PENDING"  # PENDING, ACCEPTED, REJECTED


# 13. Vulnerability
class Vulnerability(BaseEntity):
    cve_id: str
    cvss_score: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    epss_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    known_exploited: bool = False
    description: str = ""
    published_at: Optional[datetime] = None


# 14. GroundTruthReference (Strictly for evaluation oracle, never in ML feature vector)
class GroundTruthReference(BaseEntity):
    truth_id: str
    scenario_id: str
    entity_type: str  # analyst, incident, asset, threat, analyst_group
    entity_id: str
    expected_behaviour: Dict[str, Any] = Field(default_factory=dict)
    actual_behaviour: Dict[str, Any] = Field(default_factory=dict)
    expected_findings: List[str] = Field(default_factory=list)
    severity: SeverityLevel = SeverityLevel.HIGH
    injected: bool = True
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
