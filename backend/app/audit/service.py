"""Audit Chain Service — cryptographic append-only hash chain for privileged SOC actions.

Follows Rules.md §7:
- Hash chain: hash_n = SHA-256(record_n_data + hash_{n-1})
- Append-only — strictly NO updates, NO deletes.
- verify_chain operation reports whether chain is intact and points to first broken link if tampered.
- Local hash chain only (no blockchain).
"""
from __future__ import annotations

import asyncio
import hashlib
import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.schemas import (
    AuditChainVerificationResponse,
    AuditLogListResponse,
    AuditLogRecordResponse,
)
from app.models.identity import AuditLog

logger = logging.getLogger(__name__)

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"
_AUDIT_LOCK = asyncio.Lock()


def compute_audit_hash(
    record_id: uuid.UUID | str,
    user_id: uuid.UUID | str | None,
    session_id: uuid.UUID | str | None,
    device_id: uuid.UUID | str | None,
    action: str,
    resource: str,
    resource_id: str | None,
    timestamp: datetime,
    identity_status: str,
    previous_hash: str | None,
) -> str:
    """Compute deterministic SHA-256 hash for an audit log entry chained to previous_hash."""
    prev = previous_hash if previous_hash else GENESIS_HASH
    ts_str = timestamp.isoformat()
    raw = (
        f"{record_id}|{user_id or 'NONE'}|{session_id or 'NONE'}|{device_id or 'NONE'}|"
        f"{action}|{resource}|{resource_id or 'NONE'}|{ts_str}|{identity_status}|{prev}"
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def get_latest_audit_record(db: AsyncSession) -> AuditLog | None:
    """Retrieve the most recent audit record in the chain."""
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc(), AuditLog.id.desc()).limit(1)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()


async def record_audit_action(
    db: AsyncSession,
    action: str,
    resource: str,
    resource_id: str | None = None,
    user_id: uuid.UUID | None = None,
    session_id: uuid.UUID | None = None,
    device_id: uuid.UUID | None = None,
    identity_status: str = "VERIFIED",
    timestamp: datetime | None = None,
) -> AuditLog:
    """Append a new action to the cryptographic audit hash chain."""
    async with _AUDIT_LOCK:
        now = timestamp or datetime.now(UTC)
        if now.tzinfo is None:
            now = now.replace(tzinfo=UTC)

        record_id = uuid.uuid4()

        latest = await get_latest_audit_record(db)
        prev_hash = latest.current_hash if latest else GENESIS_HASH

        curr_hash = compute_audit_hash(
            record_id=record_id,
            user_id=user_id,
            session_id=session_id,
            device_id=device_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            timestamp=now,
            identity_status=identity_status,
            previous_hash=prev_hash,
        )

        log_entry = AuditLog(
            id=record_id,
            user_id=user_id,
            session_id=session_id,
            device_id=device_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            timestamp=now,
            identity_status=identity_status,
            previous_hash=prev_hash,
            current_hash=curr_hash,
        )
        db.add(log_entry)
        await db.commit()
        await db.refresh(log_entry)

        logger.info("Audited action %s on %s by user %s (hash=%s)", action, resource, user_id, curr_hash[:12])
        return log_entry


async def verify_audit_chain(db: AsyncSession) -> AuditChainVerificationResponse:
    """Verify integrity of the entire cryptographic audit log chain."""
    # Order ascending to follow sequence
    stmt = select(AuditLog).order_by(AuditLog.timestamp.asc(), AuditLog.id.asc())
    res = await db.execute(stmt)
    records = list(res.scalars().all())

    verified_at = datetime.now(UTC)

    if not records:
        return AuditChainVerificationResponse(
            intact=True,
            total_records=0,
            verified_at=verified_at,
        )

    expected_prev = GENESIS_HASH

    for idx, rec in enumerate(records):
        # 1. Check previous_hash link
        actual_prev = rec.previous_hash or GENESIS_HASH
        if actual_prev != expected_prev:
            return AuditChainVerificationResponse(
                intact=False,
                total_records=len(records),
                broken_at_index=idx,
                broken_record_id=rec.id,
                reason=f"Previous hash mismatch at index {idx}: expected {expected_prev[:12]}..., got {actual_prev[:12]}...",
                verified_at=verified_at,
            )

        # 2. Recompute current_hash from record contents
        ts = rec.timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=UTC)

        recomputed = compute_audit_hash(
            record_id=rec.id,
            user_id=rec.user_id,
            session_id=rec.session_id,
            device_id=rec.device_id,
            action=rec.action,
            resource=rec.resource,
            resource_id=rec.resource_id,
            timestamp=ts,
            identity_status=rec.identity_status,
            previous_hash=actual_prev,
        )

        if recomputed != rec.current_hash:
            return AuditChainVerificationResponse(
                intact=False,
                total_records=len(records),
                broken_at_index=idx,
                broken_record_id=rec.id,
                reason=f"Hash computation mismatch at index {idx}: expected {recomputed[:12]}..., stored {rec.current_hash[:12]}...",
                verified_at=verified_at,
            )

        expected_prev = rec.current_hash

    return AuditChainVerificationResponse(
        intact=True,
        total_records=len(records),
        verified_at=verified_at,
    )


async def list_audit_logs(
    db: AsyncSession,
    limit: int = 100,
    offset: int = 0,
    action: str | None = None,
    user_id: uuid.UUID | None = None,
) -> AuditLogListResponse:
    """Query audit logs with optional filters."""
    query = select(AuditLog)
    count_query = select(func.count()).select_from(AuditLog)

    if action:
        query = query.where(AuditLog.action == action)
        count_query = count_query.where(AuditLog.action == action)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        count_query = count_query.where(AuditLog.user_id == user_id)

    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit)
    records = list((await db.execute(query)).scalars().all())

    return AuditLogListResponse(
        total=total,
        records=[AuditLogRecordResponse.model_validate(r) for r in records],
    )
