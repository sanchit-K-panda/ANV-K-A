"""Core data schemas for ANVĪKṢA ML / Analytics Engines.

Follows the frozen data contracts from Architecture.md, PRD.md, and Rules.md.
"""
from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import Any, Literal
import uuid

from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class BaseSchema(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)


class FindingType(str, enum.Enum):
    EXECUTION_GAP = "EXECUTION_GAP"
    NEGATIVE_SPACE = "NEGATIVE_SPACE"
    BEHAVIOURAL_ANOMALY = "BEHAVIOURAL_ANOMALY"
    RECURRING_THREAT = "RECURRING_THREAT"
    WORKLOAD_IMBALANCE = "WORKLOAD_IMBALANCE"
    KPI_MANIPULATION = "KPI_MANIPULATION"
    IDENTITY_ANOMALY = "IDENTITY_ANOMALY"
    CLOSURE_WITHOUT_INVESTIGATION = "CLOSURE_WITHOUT_INVESTIGATION"
    ANALYST_BOTTLENECK = "ANALYST_BOTTLENECK"
    CLOSURE_ANOMALY = "CLOSURE_ANOMALY"
    REPEATED_UNRESOLVED_THREAT = "REPEATED_UNRESOLVED_THREAT"


class FindingSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class FindingStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class RiskFactor(BaseSchema):
    """An individual named, weighted risk factor contributing to the composite score."""
    name: str
    weight: int = Field(ge=0, le=100)
    category: str
    description: str


class RiskAssessmentResult(BaseSchema):
    """Additive, itemized risk score per Architecture.md §5."""
    score: int = Field(ge=0, le=100)
    severity: FindingSeverity
    factors: list[RiskFactor]
    breakdown: dict[str, int] = Field(default_factory=dict)
    calculated_at: datetime = Field(default_factory=utc_now)


class ExplainabilityCard(BaseSchema):
    """Non-negotiable 7-part explainability contract (Architecture.md §6, Rules.md §6)."""
    what: str
    why: str
    when: datetime
    where: str
    evidence: dict[str, Any] | list[Any] | str
    confidence: float = Field(ge=0.0, le=1.0)
    recommendation: str


class RawFinding(BaseSchema):
    """Engine-level detection before correlation and final scoring."""
    engine_name: str
    finding_type: FindingType
    severity: FindingSeverity
    confidence: float = Field(ge=0.0, le=1.0)
    title: str
    description: str
    entity_type: str  # incident, analyst, asset, threat, session
    entity_id: str
    affected_ids: list[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=utc_now)
    evidence: dict[str, Any] = Field(default_factory=dict)
    baseline_metrics: dict[str, Any] = Field(default_factory=dict)
    observed_metrics: dict[str, Any] = Field(default_factory=dict)
    recommended_action: str = ""


class FindingOutput(BaseSchema):
    """Fully correlated, explainable finding ready for API / Command Centre."""
    id: str = Field(default_factory=lambda: f"FND-{uuid.uuid4().hex[:8].upper()}")
    type: FindingType
    severity: FindingSeverity
    status: FindingStatus = FindingStatus.OPEN
    confidence: float = Field(ge=0.0, le=1.0)
    title: str
    description: str
    entity_type: str
    entity_id: str
    affected_ids: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=utc_now)
    
    # 7-Part Explainability contract
    explainability: ExplainabilityCard
    
    # Composite Risk Assessment
    risk: RiskAssessmentResult
    
    # Correlated raw detections
    raw_detections: list[RawFinding] = Field(default_factory=list)
