"""Biometric Registration API — DARŚANA user enrollment."""
from __future__ import annotations

import base64
import logging
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_password_hash
from app.core.config import settings
from app.models.base import get_db
from app.models.identity import BiometricProfile, User, UserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/biometric", tags=["biometric"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class BiometricRegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    email: str
    role: str = Field(default="ANALYST")
    password: str = Field(default="anviksa_default")
    age: str | None = None
    height: str | None = None
    weight: str | None = None
    image_base64: str  # live webcam frame


class BiometricRegisterResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    status: str = "ok"
    user_id: str
    name: str
    email: str
    message: str


class RegisteredUserInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str
    age: str | None = None
    height: str | None = None
    weight: str | None = None
    has_biometric: bool
    registered_at: str | None = None


class RegisteredUsersResponse(BaseModel):
    users: list[RegisteredUserInfo]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=BiometricRegisterResponse)
async def register_biometric_user(
    payload: BiometricRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user with biometric face encoding from a webcam capture."""
    from app.ml.biometrics import encrypt_encoding, get_single_face_encoding

    # 1. Check if user already exists
    res = await db.execute(
        select(User).where(User.email == payload.email.lower().strip())
    )
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {payload.email} already exists",
        )

    # 2. Decode the webcam image
    try:
        image_data = (
            payload.image_base64.split(",")[1]
            if "," in payload.image_base64
            else payload.image_base64
        )
        image_bytes = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format",
        )

    # 3. Extract face encoding
    encoding, msg = get_single_face_encoding(image_bytes)
    if encoding is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Face detection failed: {msg}",
        )

    # 4. Encrypt the encoding
    encrypted_token = encrypt_encoding(encoding)

    # 5. Resolve role
    role_map = {
        "SUPERVISOR": UserRole.SUPERVISOR,
        "ADMIN": UserRole.ADMIN,
        "ANALYST": UserRole.ANALYST,
    }
    role = role_map.get(payload.role.upper(), UserRole.ANALYST)

    # 6. Create User
    now = datetime.now(UTC)
    user = User(
        id=uuid.uuid4(),
        name=payload.name,
        email=payload.email.lower().strip(),
        role=role.value,
        status="ACTIVE",
        password_hash=get_password_hash(payload.password),
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    await db.flush()

    # 7. Create BiometricProfile
    bp = BiometricProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        protected_template=encrypted_token.encode("utf-8"),
        encryption_key_reference="FERNET_v1",
        age=payload.age,
        height=payload.height,
        weight=payload.weight,
        biometric_registered_at=now,
        encoding_front=encrypted_token,
        created_at=now,
        updated_at=now,
    )
    db.add(bp)
    await db.commit()

    logger.info("Registered biometric user: %s (%s)", payload.name, payload.email)

    return BiometricRegisterResponse(
        user_id=str(user.id),
        name=user.name,
        email=user.email,
        message=f"User '{user.name}' registered with biometric profile",
    )


@router.get("/users", response_model=RegisteredUsersResponse)
async def list_biometric_users(
    db: AsyncSession = Depends(get_db),
):
    """List all users and their biometric registration status."""
    from sqlalchemy.orm import selectinload

    res = await db.execute(
        select(User).options(selectinload(User.biometric_profile)).order_by(User.created_at)
    )
    users = res.scalars().all()

    user_list = []
    for u in users:
        bp = u.biometric_profile
        user_list.append(
            RegisteredUserInfo(
                id=str(u.id),
                name=u.name,
                email=u.email,
                role=u.role,
                age=bp.age if bp else None,
                height=bp.height if bp else None,
                weight=bp.weight if bp else None,
                has_biometric=bp is not None,
                registered_at=(
                    bp.biometric_registered_at.isoformat()
                    if bp and bp.biometric_registered_at
                    else None
                ),
            )
        )

    return RegisteredUsersResponse(users=user_list)
