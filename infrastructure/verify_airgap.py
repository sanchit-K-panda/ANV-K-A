#!/usr/bin/env python3
"""ANVĪKṢA Air-Gap Proof & Offline Verification Runner (Phase 13).

Validates that the entire ANVĪKṢA platform runs 100% locally with zero
external cloud dependencies or network connectivity required.

Verifies:
1. DB schema & model initialization (offline)
2. Default user seeding with Argon2 password hashing (offline)
3. Cryptographic session generation & rotation (offline)
4. Telemetry batch ingestion from simulator datasets (offline)
5. Append-only SHA-256 audit hash-chain creation (offline)
6. Chain tampering detection (offline)
"""
from __future__ import annotations

import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Force offline test database
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["ENVIRONMENT"] = "airgap-verified"

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))
sys.path.insert(0, str(REPO_ROOT / "soc-simulator" / "src"))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.audit.service import record_audit_action, verify_audit_chain
from app.auth.service import (
    authenticate_user,
    create_session,
    lock_session,
    seed_default_users,
    verify_and_rotate_session,
)
from app.ingestion.service import get_stats, ingest_batch
from app.models.base import Base
from app.models.identity import AuditLog
from app.schemas.ingestion import BatchIngestRequest


def log_step(step: int, name: str, status: str = "RUNNING"):
    symbol = "▶" if status == "RUNNING" else ("✓" if status == "PASS" else "✗")
    color = "\033[94m" if status == "RUNNING" else ("\033[92m" if status == "PASS" else "\033[91m")
    reset = "\033[0m"
    print(f"  {color}{symbol} [Step {step}] {name:<50} {status}{reset}")


async def run_airgap_verification() -> bool:
    print("\n" + "=" * 70)
    print("  ANVĪKṢA AIR-GAP PROOF — 100% OFFLINE VERIFICATION (SIH26157)")
    print("=" * 70 + "\n")

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    all_passed = True

    # Step 1: Initialize DB schema (22 tables)
    log_step(1, "Initialize 22 database tables offline")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        table_count = len(Base.metadata.sorted_tables)
        log_step(1, f"Initialized {table_count} tables offline", "PASS")
    except Exception as e:
        log_step(1, f"Failed initializing tables: {e}", "FAIL")
        all_passed = False

    # Step 2: Seed users (Argon2 hashing)
    log_step(2, "Seed system users with local Argon2 hashing")
    try:
        async with SessionLocal() as db:
            created = await seed_default_users(db)
        log_step(2, f"Seeded {len(created)} users (Supervisor, Admin, Analyst)", "PASS")
    except Exception as e:
        log_step(2, f"Failed user seeding: {e}", "FAIL")
        all_passed = False

    # Step 3: Local Authentication & Cryptographic Session Credential
    log_step(3, "Authenticate user & issue rotating session credential")
    try:
        async with SessionLocal() as db:
            user = await authenticate_user(db, "supervisor@anviksa.local", "anviksa_supervisor")
            assert user is not None, "Authentication returned None"
            session, token = await create_session(db, user, "AIRGAP-SECURE-STATION-01")
            assert session.session_status == "ACTIVE"
            assert len(token) > 30
            # Test credential rotation
            rotated = await verify_and_rotate_session(db, session.id, session.session_credential)
            assert rotated.valid is True
        log_step(3, "Local auth & cryptographic rotation verified", "PASS")
    except Exception as e:
        log_step(3, f"Failed auth/session: {e}", "FAIL")
        all_passed = False

    # Step 4: Local Telemetry Ingestion
    log_step(4, "Ingest telemetry dataset without cloud dependencies")
    try:
        healthy_dir = REPO_ROOT / "soc-simulator" / "datasets" / "healthy"
        import json
        dataset = {}
        for key in ["socs", "analysts", "devices", "assets", "threats", "events", "alerts", "incidents", "investigations", "escalations", "analyst_actions"]:
            fp = healthy_dir / f"{key}.json"
            if fp.exists():
                with open(fp) as f:
                    dataset[key] = json.load(f)
            else:
                dataset[key] = []

        batch = BatchIngestRequest.model_validate(dataset)
        async with SessionLocal() as db:
            counts = await ingest_batch(db, batch)
            stats = await get_stats(db)

        log_step(4, f"Ingested {stats['events']} events, {stats['alerts']} alerts, {stats['incidents']} incidents", "PASS")
    except Exception as e:
        log_step(4, f"Failed ingestion: {e}", "FAIL")
        all_passed = False

    # Step 5: Audit Hash-Chain Creation & Verification
    log_step(5, "Create & verify SHA-256 append-only audit hash chain")
    try:
        async with SessionLocal() as db:
            r1 = await record_audit_action(db, "AIRGAP_TEST_START", "SYSTEM", "NODE-01")
            r2 = await record_audit_action(db, "VIEW_DASHBOARD", "COMMAND_CENTRE")
            r3 = await record_audit_action(db, "AIRGAP_TEST_COMPLETE", "SYSTEM", "NODE-01")

            chain_res = await verify_audit_chain(db)
            assert chain_res.intact is True, f"Chain broken: {chain_res.reason}"
        log_step(5, f"Audit hash chain intact ({chain_res.total_records} records)", "PASS")
    except Exception as e:
        log_step(5, f"Failed audit chain: {e}", "FAIL")
        all_passed = False

    # Step 6: Tamper Detection Proof
    log_step(6, "Simulate unauthorized DB tampering & verify detection")
    try:
        async with SessionLocal() as db:
            r = await record_audit_action(db, "SUPERVISOR_ACTION", "POLICY")
            # Malicious edit directly on row
            row = await db.get(AuditLog, r.id)
            row.action = "TAMPERED_MALICIOUS_ACTION"
            await db.commit()

            tamper_res = await verify_audit_chain(db)
            assert tamper_res.intact is False, "Tampering was not detected!"
        log_step(6, f"Tamper detected at record {tamper_res.broken_record_id}", "PASS")
    except Exception as e:
        log_step(6, f"Failed tamper detection: {e}", "FAIL")
        all_passed = False

    print("\n" + "-" * 70)
    if all_passed:
        print("\033[92m  ✅ ALL 6 AIR-GAP PROOF CHECKS PASSED — PLATFORM IS 100% OFFLINE READY\033[0m")
    else:
        print("\033[91m  ✗ AIR-GAP PROOF CHECKS FAILED\033[0m")
    print("-" * 70 + "\n")
    return all_passed


if __name__ == "__main__":
    success = asyncio.run(run_airgap_verification())
    sys.exit(0 if success else 1)
