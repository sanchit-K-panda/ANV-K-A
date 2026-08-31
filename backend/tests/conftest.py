"""Pytest fixtures and configuration for ANVĪKṢA backend test suite."""
from __future__ import annotations

import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.models.base as base_mod

# In-memory SQLite with StaticPool ensures all connections share the same memory database
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

# Patch base module engine and sessionmaker
base_mod.engine = test_engine
base_mod.AsyncSessionLocal = TestSessionLocal

# Import models to register with Base.metadata
import app.models  # noqa: F401
from app.main import app as fastapi_app
from app.models.base import Base, get_db


async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


fastapi_app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_test_database():
    """Create all tables before each test and drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for testing endpoints."""
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
import sys
from pathlib import Path

# Add backend and workspace root to sys.path
backend_root = Path(__file__).resolve().parent.parent
workspace_root = backend_root.parent

for p in [str(workspace_root), str(backend_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)
