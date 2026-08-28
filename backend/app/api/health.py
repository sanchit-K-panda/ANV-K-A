"""Health + readiness endpoints — Phase 1 contract."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {"status": "ok", "service": "anviksa-backend", "phase": 1}


@router.get("/ready")
async def ready(db: AsyncSession = Depends(get_db)):
    # verifies DB connectivity
    await db.execute(text("SELECT 1"))
    return {"status": "ready", "database": "connected"}
