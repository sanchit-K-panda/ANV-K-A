"""Phase 11 Secure Identity tests — login, JWT, rotating session credentials, role enforcement, session locking."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestAuthFlow:
    """Test full login, session rotation, role check, and logout flows."""

    @pytest.mark.asyncio
    async def test_seed_users(self, client: AsyncClient):
        resp = await client.post("/api/auth/seed-users")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "supervisor@anviksa.local" in data["created_users"]
        assert "admin@anviksa.local" in data["created_users"]
        assert "analyst@anviksa.local" in data["created_users"]

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")

        login_payload = {
            "email": "supervisor@anviksa.local",
            "password": "anviksa_supervisor",
            "device_identifier": "DEV-DESKTOP-01",
        }
        resp = await client.post("/api/auth/login", json=login_payload)
        assert resp.status_code == 200
        data = resp.json()

        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "supervisor@anviksa.local"
        assert data["user"]["role"] == "SUPERVISOR"
        assert data["session"]["session_status"] == "ACTIVE"
        assert len(data["session"]["session_credential"]) > 20

    @pytest.mark.asyncio
    async def test_login_invalid_password(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")

        login_payload = {
            "email": "supervisor@anviksa.local",
            "password": "wrong_password",
            "device_identifier": "DEV-DESKTOP-01",
        }
        resp = await client.post("/api/auth/login", json=login_payload)
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_protected_me_endpoint(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")
        login_resp = await client.post(
            "/api/auth/login",
            json={"email": "analyst@anviksa.local", "password": "anviksa_analyst"},
        )
        token = login_resp.json()["access_token"]

        # Call /api/auth/me without token -> 401
        unauth_resp = await client.get("/api/auth/me")
        assert unauth_resp.status_code == 401

        # Call with valid Bearer token -> 200
        auth_resp = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert auth_resp.status_code == 200
        assert auth_resp.json()["email"] == "analyst@anviksa.local"
        assert auth_resp.json()["role"] == "ANALYST"

    @pytest.mark.asyncio
    async def test_session_continuous_verification(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")
        login_resp = await client.post(
            "/api/auth/login",
            json={"email": "supervisor@anviksa.local", "password": "anviksa_supervisor"},
        )
        data = login_resp.json()
        session_id = data["session"]["id"]
        old_credential = data["session"]["session_credential"]

        # Call /api/auth/verify
        verify_resp = await client.post(
            "/api/auth/verify",
            json={"session_id": session_id, "credential": old_credential},
        )
        assert verify_resp.status_code == 200
        vdata = verify_resp.json()
        assert vdata["valid"] is True
        assert vdata["session_status"] == "ACTIVE"
        assert vdata["new_credential"] != old_credential

    @pytest.mark.asyncio
    async def test_session_lock_and_revocation(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")
        
        # Login supervisor
        sup_resp = await client.post(
            "/api/auth/login",
            json={"email": "supervisor@anviksa.local", "password": "anviksa_supervisor"},
        )
        sup_token = sup_resp.json()["access_token"]

        # Login analyst
        an_resp = await client.post(
            "/api/auth/login",
            json={"email": "analyst@anviksa.local", "password": "anviksa_analyst"},
        )
        an_token = an_resp.json()["access_token"]
        an_session_id = an_resp.json()["session"]["id"]

        # Analyst accesses profile -> 200
        assert (await client.get("/api/auth/me", headers={"Authorization": f"Bearer {an_token}"})).status_code == 200

        # Supervisor locks analyst's session (e.g. after identity anomaly detected)
        lock_resp = await client.post(
            "/api/auth/lock-session",
            json={"session_id": an_session_id, "reason": "Suspected identity anomaly"},
            headers={"Authorization": f"Bearer {sup_token}"},
        )
        assert lock_resp.status_code == 200

        # Analyst tries to access profile now -> 401 Unauthorized (Session is LOCKED)
        blocked_resp = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {an_token}"},
        )
        assert blocked_resp.status_code == 401
        assert "LOCKED" in blocked_resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_logout(self, client: AsyncClient):
        await client.post("/api/auth/seed-users")
        login_resp = await client.post(
            "/api/auth/login",
            json={"email": "admin@anviksa.local", "password": "anviksa_admin"},
        )
        token = login_resp.json()["access_token"]

        # Logout
        logout_resp = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert logout_resp.status_code == 200

        # Subsequent call -> 401
        resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
