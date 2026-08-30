"""Pydantic schemas for Authentication and Identity Management."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class _BaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)


class LoginRequest(_BaseSchema):
    email: str
    password: str
    device_identifier: str = Field(default="DEFAULT_DESKTOP_CLIENT")


class UserResponse(_BaseSchema):
    id: uuid.UUID
    name: str
    email: str
    role: str
    status: str
    created_at: datetime


class SessionResponse(_BaseSchema):
    id: uuid.UUID
    user_id: uuid.UUID
    device_id: uuid.UUID
    session_status: str
    issued_at: datetime
    expires_at: datetime
    last_verified_at: datetime
    session_credential: str
    permissions: str


class LoginResponse(_BaseSchema):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse
    session: SessionResponse


class VerifySessionRequest(_BaseSchema):
    session_id: uuid.UUID
    credential: str | None = None


class VerifySessionResponse(_BaseSchema):
    valid: bool
    session_status: str
    new_credential: str | None = None
    expires_at: datetime | None = None
    message: str = "Session verified"


class LockSessionRequest(_BaseSchema):
    session_id: uuid.UUID
    reason: str = "Identity anomaly or security violation detected"


class DeviceRegisterRequest(_BaseSchema):
    device_identifier: str
    trust_status: Literal["UNVERIFIED", "TRUSTED", "REVOKED"] = "TRUSTED"


class DeviceResponse(_BaseSchema):
    id: uuid.UUID
    device_identifier: str
    user_id: uuid.UUID
    trust_status: str
    last_seen: datetime | None
    created_at: datetime


class SeedUsersResponse(_BaseSchema):
    status: str = "ok"
    created_users: list[str]
