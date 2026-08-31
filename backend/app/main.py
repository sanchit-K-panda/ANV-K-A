"""ANVĪKṢA FastAPI entrypoint — Phase 3 ingestion enabled."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.health import router as health_router
from app.api.ingestion import router as ingestion_router
from app.api.ingestion import alias_router as ingestion_alias_router
from app.api.auth import router as auth_router
from app.api.audit import router as audit_router

app = FastAPI(
    title="ANVĪKṢA API",
    description="Supervisory Analytics Tool for SOC Assessment — Security & Telemetry",
from app.api.findings import router as findings_router
from app.api.analytics import router as analytics_router
from app.api.ingestion import router as ingestion_router

app = FastAPI(
    title="ANVĪKṢA API",
    description="Supervisory Analytics Tool for SOC Assessment",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(ingestion_router, prefix="/api")
app.include_router(ingestion_alias_router, prefix="/api")  # spec: POST /api/events etc.
app.include_router(findings_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ingestion_router, prefix="/api")


@app.get("/")
async def root():
    return {"service": "ANVĪKṢA", "status": "ok", "phase": "3 — Ingestion Pipeline"}
