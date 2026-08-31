"""SQLAlchemy Declarative Base + async engine/session for ANVĪKṢA.

Supports both PostgreSQL (asyncpg) and TiDB/MySQL (asyncmy) backends.
"""
from __future__ import annotations

import ssl
import uuid

from sqlalchemy import String, TypeDecorator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class GUID(TypeDecorator):
    """Database-agnostic UUID column.

    Stores as CHAR(36) on MySQL/TiDB, native UUID on PostgreSQL.
    Always returns Python uuid.UUID objects.
    Uses CHAR(36) (fixed-width) for MySQL FK constraint compatibility.
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
    """Build async engine with appropriate SSL config for TiDB Cloud."""
    connect_args = {}

    # TiDB Cloud requires SSL
    if settings.DATABASE_SSL and "tidbcloud" in settings.DATABASE_URL:
        ssl_ctx = ssl.create_default_context()
        connect_args["ssl"] = ssl_ctx

    return create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        connect_args=connect_args,
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

