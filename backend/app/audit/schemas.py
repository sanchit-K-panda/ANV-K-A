"""Pydantic schemas for Audit Log & Hash Chain verification."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class _BaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)


class AuditLogRecordResponse(_BaseSchema):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    session_id: uuid.UUID | None = None
    device_id: uuid.UUID | None = None
    action: str
    resource: str
    resource_id: str | None = None
    timestamp: datetime
    identity_status: str
    previous_hash: str | None = None
    current_hash: str


class AuditLogListResponse(_BaseSchema):
    total: int
    records: list[AuditLogRecordResponse]


class AuditChainVerificationResponse(_BaseSchema):
    intact: bool
    total_records: int
    broken_at_index: int | None = None
    broken_record_id: uuid.UUID | None = None
    reason: str | None = None
    verified_at: datetime


class RecordAuditEventRequest(_BaseSchema):
    action: str
    resource: str
    resource_id: str | None = None
    identity_status: str = "VERIFIED"
