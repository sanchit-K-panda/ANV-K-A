"""SQLAlchemy Declarative Base + async engine/session for ANVĪKṢA.

Local PostgreSQL (asyncpg) via docker-compose; the GUID column degrades to
CHAR(36) for any MySQL-family backend if ever needed. No cloud database (Rules.md §4).
"""
from __future__ import annotations

import uuid

from sqlalchemy import String, TypeDecorator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class GUID(TypeDecorator):
    """Database-agnostic UUID column.

    Stores as native-friendly String(36); uses CHAR(36) with ascii collation on
    MySQL-family dialects for FK compatibility. Always returns Python uuid.UUID.
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "mysql":
            # Use CHAR(36) with ascii collation for consistent FK matching
            from sqlalchemy import CHAR
            return dialect.type_descriptor(CHAR(36, collation="ascii_bin"))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, uuid.UUID):
                return str(value)
            return str(uuid.UUID(value))
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if isinstance(value, uuid.UUID):
                return value
            return uuid.UUID(str(value).strip())
        return value


class Base(DeclarativeBase):
    pass


def _build_engine():
    """Build async engine for the local compose database (no TLS endpoints)."""
    return create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
    )


engine = _build_engine()
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

