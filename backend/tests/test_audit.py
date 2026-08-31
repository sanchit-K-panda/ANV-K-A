"""Phase 12 Audit Chain tests — append-only hash chain, cryptographic verification, and tampering detection."""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.service import record_audit_action, verify_audit_chain
from app.models.base import get_db
from app.models.identity import AuditLog
from tests.conftest import TestSessionLocal


class TestAuditChain:
    """Test append-only hash chaining, verification, and tamper detection."""

    @pytest.mark.asyncio
    async def test_empty_chain_is_valid(self, client: AsyncClient):
        async with TestSessionLocal() as session:
            res = await verify_audit_chain(session)
            assert res.intact is True
            assert res.total_records == 0

    @pytest.mark.asyncio
    async def test_hash_chain_sequential_integrity(self, client: AsyncClient):
        async with TestSessionLocal() as session:
            # Append 5 records
            r1 = await record_audit_action(session, action="LOGIN", resource="AUTH")
            r2 = await record_audit_action(session, action="VIEW_FINDING", resource="FINDING", resource_id="F-01")
            r3 = await record_audit_action(session, action="VIEW_EVIDENCE", resource="EVIDENCE", resource_id="EV-01")
            r4 = await record_audit_action(session, action="OPEN_CASE", resource="INCIDENT", resource_id="INC-01")
            r5 = await record_audit_action(session, action="LOGOUT", resource="AUTH")

            # Check previous_hash chain links
            assert r1.previous_hash == "0000000000000000000000000000000000000000000000000000000000000000"
            assert r2.previous_hash == r1.current_hash
            assert r3.previous_hash == r2.current_hash
            assert r4.previous_hash == r3.current_hash
            assert r5.previous_hash == r4.current_hash

            # Verify chain
            res = await verify_audit_chain(session)
            assert res.intact is True
            assert res.total_records == 5

    @pytest.mark.asyncio
    async def test_tampering_detection(self, client: AsyncClient):
        """Rules.md §7: Tampering with any historical record must break the chain."""
        async with TestSessionLocal() as session:
            r1 = await record_audit_action(session, action="LOGIN", resource="AUTH")
            r2 = await record_audit_action(session, action="VIEW_FINDING", resource="FINDING", resource_id="F-01")
            r3 = await record_audit_action(session, action="EXPORT_EVIDENCE", resource="EVIDENCE")

            # Verify initial chain intact
            assert (await verify_audit_chain(session)).intact is True

            # TAMPERING: maliciously modify record 2's action directly in DB
            db_r2 = await session.get(AuditLog, r2.id)
            assert db_r2 is not None
            db_r2.action = "TAMPERED_ACTION"
            await session.commit()

            # Verification must fail and flag broken link at index 1
            res = await verify_audit_chain(session)
            assert res.intact is False
            assert res.broken_at_index == 1
            assert res.broken_record_id == r2.id
            assert "mismatch" in (res.reason or "").lower()

    @pytest.mark.asyncio
    async def test_audit_api_privilege_enforcement(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")

        # Login supervisor (has audit:view permission)
        sup_resp = await client.post(
            "/api/auth/login",
            json={"email": "supervisor@anviksa.local", "password": "anviksa_supervisor"},
        )
        sup_token = sup_resp.json()["access_token"]

        # Login analyst (no audit:view permission)
        an_resp = await client.post(
            "/api/auth/login",
            json={"email": "analyst@anviksa.local", "password": "anviksa_analyst"},
        )
        an_token = an_resp.json()["access_token"]

        # Analyst attempts to view audit logs -> 403 Forbidden
        an_audit_resp = await client.get(
            "/api/audit/logs",
            headers={"Authorization": f"Bearer {an_token}"},
        )
        assert an_audit_resp.status_code == 403

        # Supervisor views audit logs -> 200 OK
        sup_audit_resp = await client.get(
            "/api/audit/logs",
            headers={"Authorization": f"Bearer {sup_token}"},
        )
        assert sup_audit_resp.status_code == 200
        data = sup_audit_resp.json()
        assert data["total"] >= 2  # Login actions were automatically audited

        # Supervisor verifies chain via API -> 200 OK with intact=True
        verify_api_resp = await client.get(
            "/api/audit/verify",
            headers={"Authorization": f"Bearer {sup_token}"},
        )
        assert verify_api_resp.status_code == 200
        assert verify_api_resp.json()["intact"] is True

    @pytest.mark.asyncio
    async def test_concurrent_audit_recording(self, client: AsyncClient):
        """Verify that concurrent audit log requests maintain linear hash chain integrity."""
        import asyncio

        async def _record_action_worker(idx: int):
            async with TestSessionLocal() as session:
                await record_audit_action(
                    session,
                    action=f"CONCURRENT_ACTION_{idx}",
                    resource="LOAD_TEST",
                    resource_id=f"ITEM_{idx}",
                )

        # Launch 20 concurrent logging tasks simultaneously
        tasks = [_record_action_worker(i) for i in range(20)]
        await asyncio.gather(*tasks)

        # Verify full chain integrity
        async with TestSessionLocal() as session:
            res = await verify_audit_chain(session)
            assert res.intact is True, f"Concurrent chain broken: {res.reason}"
            assert res.total_records == 20
