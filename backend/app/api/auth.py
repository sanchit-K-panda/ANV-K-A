"""Authentication and Identity Management API endpoints."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.service import record_audit_action
from app.auth.dependencies import (
    get_current_session,
    get_current_user,
    require_role,
)
from app.auth.schemas import (
    LockSessionRequest,
    LoginRequest,
    LoginResponse,
    SeedUsersResponse,
    SessionResponse,
    UserResponse,
    VerifySessionRequest,
    VerifySessionResponse,
)
from app.auth.service import (
    authenticate_user,
    create_session,
    invalidate_session,
    lock_session,
    seed_default_users,
    verify_and_rotate_session,
)
from app.core.config import settings
from app.models.base import get_db
from app.models.identity import Session, User, UserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user with email and password, creating a rotating session."""
    user = await authenticate_user(db, payload.email, payload.password)
    if not user:
        # Audit failed login attempt
        await record_audit_action(
            db=db,
            action="LOGIN_FAILED",
            resource="AUTH",
            resource_id=payload.email,
            identity_status="UNVERIFIED",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    session, token = await create_session(db, user, payload.device_identifier)

    # Audit successful login
    await record_audit_action(
        db=db,
        action="LOGIN",
        resource="AUTH",
        resource_id=str(user.id),
        user_id=user.id,
        session_id=session.id,
        device_id=session.device_id,
        identity_status="VERIFIED",
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user),
        session=SessionResponse.model_validate(session),
    )


@router.post("/logout")
async def logout(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    """Terminate the current active session."""
    await invalidate_session(db, session.id)
    await record_audit_action(
        db=db,
        action="LOGOUT",
        resource="AUTH",
        resource_id=str(session.id),
        user_id=user.id,
        session_id=session.id,
        device_id=session.device_id,
        identity_status="VERIFIED",
    )
    return {"status": "ok", "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def me(
    user: User = Depends(get_current_user),
):
    """Get current authenticated user profile."""
    return UserResponse.model_validate(user)


@router.get("/session", response_model=SessionResponse)
async def current_session_info(
    session: Session = Depends(get_current_session),
):
    """Get active session details."""
    return SessionResponse.model_validate(session)


@router.post("/verify", response_model=VerifySessionResponse)
async def verify_session(
    payload: VerifySessionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Continuous verification and rotating credential renewal."""
    return await verify_and_rotate_session(db, payload.session_id, payload.credential)


@router.post("/lock-session")
async def lock_user_session(
    payload: LockSessionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.SUPERVISOR, UserRole.ADMIN)),
    session: Session = Depends(get_current_session),
):
    """Lock a session immediately (privileged: Supervisor/Admin)."""
    ok = await lock_session(db, payload.session_id, payload.reason)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found")

    await record_audit_action(
        db=db,
        action="LOCK_SESSION",
        resource="SESSION",
        resource_id=str(payload.session_id),
        user_id=user.id,
        session_id=session.id,
        device_id=session.device_id,
        identity_status="ANOMALOUS",
    )
    return {"status": "ok", "message": f"Session {payload.session_id} locked"}


@router.post("/seed-users", response_model=SeedUsersResponse)
async def seed_users(
    db: AsyncSession = Depends(get_db),
):
    """Seed initial default supervisor/admin/analyst accounts."""
    created = await seed_default_users(db)
    return SeedUsersResponse(created_users=created)
