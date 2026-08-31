"""SQLAlchemy models for ANVĪKṢA — Findings, Risk & Recommendations tables."""
from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import GUID, Base

if TYPE_CHECKING:
    from app.models.soc import Analyst, Incident


class FindingType(str, enum.Enum):
    EXECUTION_GAP = "EXECUTION_GAP"
    NEGATIVE_SPACE = "NEGATIVE_SPACE"
    BEHAVIOURAL_ANOMALY = "BEHAVIOURAL_ANOMALY"
    RECURRING_THREAT = "RECURRING_THREAT"
    WORKLOAD_IMBALANCE = "WORKLOAD_IMBALANCE"
    KPI_MANIPULATION = "KPI_MANIPULATION"
    IDENTITY_ANOMALY = "IDENTITY_ANOMALY"


class FindingSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class FindingStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    type: Mapped[str] = mapped_column(
        SQLEnum(FindingType, name="finding_type"), nullable=False
    )
    severity: Mapped[str] = mapped_column(
        SQLEnum(FindingSeverity, name="finding_severity"), nullable=False
    )
    confidence: Mapped[float] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    incident_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    status: Mapped[str] = mapped_column(
        SQLEnum(FindingStatus, name="finding_status"),
        nullable=False,
        default=FindingStatus.OPEN,
    )
    assigned_analyst_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("analysts.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Explainability fields (Architecture.md §6)
    what: Mapped[str] = mapped_column(Text, nullable=False)
    why: Mapped[str] = mapped_column(Text, nullable=False)
    when: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    where: Mapped[str] = mapped_column(String(500), nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)

    incident: Mapped[Incident | None] = relationship(
        back_populates="findings", foreign_keys=[incident_id]
    )
    assigned_analyst: Mapped[Analyst | None] = relationship(
        foreign_keys=[assigned_analyst_id]
    )
    risk_assessment: Mapped[RiskAssessment | None] = relationship(
        back_populates="finding", uselist=False, cascade="all, delete-orphan"
    )
    recommendations: Mapped[list[Recommendation]] = relationship(
        back_populates="finding", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_findings_type", "type"),
        Index("ix_findings_severity", "severity"),
        Index("ix_findings_status", "status"),
        Index("ix_findings_incident_id", "incident_id"),
        Index("ix_findings_created_at", "created_at"),
    )


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    finding_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("findings.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    severity: Mapped[str] = mapped_column(
        SQLEnum(FindingSeverity, name="risk_severity"), nullable=False
    )
    factors: Mapped[str] = mapped_column(Text, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    finding: Mapped[Finding] = relationship(back_populates="risk_assessment")

    __table_args__ = (
        Index("ix_risk_assessments_finding_id", "finding_id"),
        Index("ix_risk_assessments_score", "score"),
    )


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    finding_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("findings.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDING")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    finding: Mapped[Finding] = relationship(back_populates="recommendations")

    __table_args__ = (
        Index("ix_recommendations_finding_id", "finding_id"),
        Index("ix_recommendations_status", "status"),
    )