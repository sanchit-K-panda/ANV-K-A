"""Authentication and Session Management Service."""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import (
    DeviceResponse,
    LoginRequest,
    LoginResponse,
    SessionResponse,
    UserResponse,
    VerifySessionResponse,
)
from app.auth.security import (
    create_access_token,
    generate_session_credential,
    get_password_hash,
    verify_password,
)
from app.core.config import settings
from app.models.identity import Session, User, UserDevice, UserRole

logger = logging.getLogger(__name__)

# Default permissions by role
ROLE_PERMISSIONS: dict[str, list[str]] = {
    UserRole.SUPERVISOR.value: ["read:all", "write:all", "admin:all", "audit:view", "findings:manage"],
    UserRole.ADMIN.value: ["read:all", "write:all", "admin:all", "audit:view"],
    UserRole.ANALYST.value: ["read:soc", "write:investigations", "read:findings"],
}


async def seed_default_users(db: AsyncSession) -> list[str]:
    """Seed initial system users if they do not exist."""
    defaults = [
        ("Supervisor", "supervisor@anviksa.local", "anviksa_supervisor", UserRole.SUPERVISOR),
        ("Admin", "admin@anviksa.local", "anviksa_admin", UserRole.ADMIN),
        ("Lead Analyst", "analyst@anviksa.local", "anviksa_analyst", UserRole.ANALYST),
    ]

    created = []
    for name, email, raw_pwd, role in defaults:
        res = await db.execute(select(User).where(User.email == email))
        existing = res.scalar_one_or_none()
        if not existing:
            u = User(
                id=uuid.uuid4(),
                name=name,
                email=email,
                role=role.value,
                status="ACTIVE",
                password_hash=get_password_hash(raw_pwd),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(u)
            created.append(email)
            logger.info("Seeded default user: %s (%s)", email, role.value)

    if created:
        await db.commit()
    return created


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    """Validate user credentials."""
    res = await db.execute(select(User).where(User.email == email.lower().strip()))
    user = res.scalar_one_or_none()
    if not user:
        return None
    if user.status != "ACTIVE":
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def get_or_create_device(
    db: AsyncSession, user_id: uuid.UUID, device_identifier: str
) -> UserDevice:
    """Get or register a user device."""
    res = await db.execute(
        select(UserDevice).where(UserDevice.device_identifier == device_identifier)
    )
    device = res.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if not device:
        device = UserDevice(
            id=uuid.uuid4(),
            device_identifier=device_identifier,
            user_id=user_id,
            trust_status="TRUSTED",
            last_seen=now,
            created_at=now,
        )
        db.add(device)
        await db.flush()
    else:
        device.last_seen = now
        # If device belongs to another user, associate with current user or keep trust check
        device.user_id = user_id
        await db.flush()
    return device


async def create_session(
    db: AsyncSession, user: User, device_identifier: str
) -> tuple[Session, str]:
    """Create a new user session with rotating credential and access token."""
    device = await get_or_create_device(db, user.id, device_identifier)
    
    session_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    permissions = ROLE_PERMISSIONS.get(user.role, ["read:basic"])
    perm_json = json.dumps(permissions)

    credential = generate_session_credential(
        user_id=user.id,
        device_id=device.id,
        session_id=session_id,
        role=user.role,
        timestamp=now,
        permissions=perm_json,
    )

    session = Session(
        id=session_id,
        user_id=user.id,
        device_id=device.id,
        session_status="ACTIVE",
        issued_at=now,
        expires_at=expires_at,
        last_verified_at=now,
        session_credential=credential,
        permissions=perm_json,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # JWT Access Token payload
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "session_id": str(session.id),
        "device_id": str(device.id),
    }
    access_token = create_access_token(token_payload)

    return session, access_token


async def verify_and_rotate_session(
    db: AsyncSession, session_id: uuid.UUID, client_credential: str | None = None
) -> VerifySessionResponse:
    """Verify session validity and rotate credential."""
    session = await db.get(Session, session_id)
    if not session:
        return VerifySessionResponse(
            valid=False,
            session_status="INVALID",
            message="Session not found",
        )

    now = datetime.now(timezone.utc)
    if session.session_status != "ACTIVE":
        return VerifySessionResponse(
            valid=False,
            session_status=session.session_status,
            message=f"Session is {session.session_status}",
        )

    # Ensure tz-aware comparison
    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        session.session_status = "EXPIRED"
        await db.commit()
        return VerifySessionResponse(
            valid=False,
            session_status="EXPIRED",
            message="Session has expired",
        )

    # Rotate credential
    user = await db.get(User, session.user_id)
    role_str = user.role if user else "UNKNOWN"

    new_credential = generate_session_credential(
        user_id=session.user_id,
        device_id=session.device_id,
        session_id=session.id,
        role=role_str,
        timestamp=now,
        permissions=session.permissions,
    )

    session.session_credential = new_credential
    session.last_verified_at = now
    # Extend expiration
    new_expires = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    session.expires_at = new_expires
    await db.commit()

    return VerifySessionResponse(
        valid=True,
        session_status="ACTIVE",
        new_credential=new_credential,
        expires_at=new_expires,
        message="Session verified and credential rotated",
    )


async def lock_session(
    db: AsyncSession, session_id: uuid.UUID, reason: str = ""
) -> bool:
    """Lock session immediately (e.g. on identity anomaly)."""
    session = await db.get(Session, session_id)
    if not session:
        return False
    session.session_status = "LOCKED"
    session.last_verified_at = datetime.now(timezone.utc)
    await db.commit()
    logger.warning("Locked session %s: %s", session_id, reason)
    return True


async def invalidate_session(db: AsyncSession, session_id: uuid.UUID) -> bool:
    """Terminate / logout a session."""
    session = await db.get(Session, session_id)
    if not session:
        return False
    session.session_status = "REVOKED"
    await db.commit()
    return True
