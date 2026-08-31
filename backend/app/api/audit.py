"""Audit Chain API endpoints — query audit logs and verify cryptographic chain integrity."""
from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.schemas import (
    AuditChainVerificationResponse,
    AuditLogListResponse,
    AuditLogRecordResponse,
    RecordAuditEventRequest,
)
from app.audit.service import (
    list_audit_logs,
    record_audit_action,
    verify_audit_chain,
)
from app.auth.dependencies import (
    get_current_session,
    get_current_user,
    require_role,
)
from app.models.base import get_db
from app.models.identity import Session, User, UserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    action: str | None = Query(default=None),
    user_id: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(UserRole.SUPERVISOR, UserRole.ADMIN)),
):
    """Retrieve paginated audit logs (Privileged: Supervisor / Admin only)."""
    return await list_audit_logs(
        db, limit=limit, offset=offset, action=action, user_id=user_id
    )


@router.get("/verify", response_model=AuditChainVerificationResponse)
async def verify_chain(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(UserRole.SUPERVISOR, UserRole.ADMIN)),
):
    """Verify cryptographic integrity of the audit hash chain (Rules.md §7)."""
    return await verify_audit_chain(db)


@router.post("/record", response_model=AuditLogRecordResponse)
async def record_event(
    payload: RecordAuditEventRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_current_session),
):
    """Record an audit event associated with current authenticated user and session."""
    log_rec = await record_audit_action(
        db=db,
        action=payload.action,
        resource=payload.resource,
        resource_id=payload.resource_id,
        user_id=user.id,
        session_id=session.id,
        device_id=session.device_id,
        identity_status=payload.identity_status,
    )
    return AuditLogRecordResponse.model_validate(log_rec)
