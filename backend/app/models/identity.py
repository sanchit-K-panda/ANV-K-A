"""SQLAlchemy models for ANVĪKṢA — Core Identity & Access tables."""
from __future__ import annotations

import enum

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, GUID


if TYPE_CHECKING:
    from app.models.soc import Analyst


class UserRole(str, enum.Enum):
    SUPERVISOR = "SUPERVISOR"
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(
        SQLEnum(UserRole, name="user_role"), nullable=False, default=UserRole.ANALYST
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="ACTIVE"
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    biometric_profile: Mapped["BiometricProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    user_devices: Mapped[list["UserDevice"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    sessions: Mapped[list["Session"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_role", "role"),
    )


class BiometricProfile(Base):
    __tablename__ = "biometric_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    protected_template: Mapped[bytes] = mapped_column(nullable=False)
    encryption_key_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="biometric_profile")

    __table_args__ = (
        Index("ix_biometric_profiles_user_id", "user_id"),
    )


class UserDevice(Base):
    __tablename__ = "user_devices"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    device_identifier: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    trust_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="UNVERIFIED"
    )
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="user_devices")
    sessions: Mapped[list["Session"]] = relationship(
        back_populates="device", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_user_devices_user_id", "user_id"),
        Index("ix_user_devices_trust_status", "trust_status"),
    )


# Backwards compat alias
Device = UserDevice


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    device_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("user_devices.id", ondelete="CASCADE"),
        nullable=False,
    )
    session_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="ACTIVE"
    )
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    session_credential: Mapped[str] = mapped_column(String(512), nullable=False)
    permissions: Mapped[str] = mapped_column(Text, nullable=False, default="{}")

    user: Mapped["User"] = relationship(back_populates="sessions")
    device: Mapped["UserDevice"] = relationship(back_populates="sessions")
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_sessions_user_id", "user_id"),
        Index("ix_sessions_device_id", "device_id"),
        Index("ix_sessions_status", "session_status"),
        Index("ix_sessions_credential", "session_credential", mysql_length=255),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("sessions.id", ondelete="SET NULL"),
        nullable=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    device_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("user_devices.id", ondelete="SET NULL"),
        nullable=True,
    )
    identity_status: Mapped[str] = mapped_column(String(50), nullable=False, default="UNKNOWN")
    previous_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    current_hash: Mapped[str] = mapped_column(String(64), nullable=False)

    user: Mapped["User | None"] = relationship(back_populates="audit_logs")
    session: Mapped["Session | None"] = relationship(back_populates="audit_logs")
    device: Mapped["UserDevice | None"] = relationship()

    __table_args__ = (
        Index("ix_audit_logs_user_id", "user_id"),
        Index("ix_audit_logs_session_id", "session_id"),
        Index("ix_audit_logs_timestamp", "timestamp"),
        Index("ix_audit_logs_action", "action"),
    )