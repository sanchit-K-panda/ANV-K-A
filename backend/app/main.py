"""ANVĪKṢA FastAPI entrypoint."""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure repo root and simulator src are on pythonpath regardless of cwd
REPO_ROOT = Path(__file__).resolve().parents[2]
for p in (str(REPO_ROOT), str(REPO_ROOT / "backend"), str(REPO_ROOT / "soc-simulator" / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.health import router as health_router
from app.api.ingestion import router as ingestion_router
from app.api.stream import router as stream_router
from app.api.ingestion import alias_router as ingestion_alias_router
from app.api.auth import router as auth_router
from app.api.audit import router as audit_router
from app.api.findings import router as findings_router
from app.api.analytics import router as analytics_router
from app.api.llm import router as llm_router
from app.api.ingestion import router as ingestion_router
from app.api.ingestion import alias_router as ingestion_alias_router
from app.api.ingestion import live_router as ingestion_live_router
from app.api.supervisory import router as supervisory_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="ANVĪKṢA API",
    description="Supervisory Analytics Tool for SOC Assessment — Security & Telemetry",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5231",
        "http://127.0.0.1:5231",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(findings_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(supervisory_router, prefix="/api")
app.include_router(llm_router, prefix="/api")
app.include_router(stream_router, prefix="/api")
app.include_router(ingestion_live_router, prefix="/api")
app.include_router(ingestion_router, prefix="/api")
app.include_router(ingestion_alias_router, prefix="/api")


@app.get("/")
async def root():
    return {"service": "ANVĪKṢA", "status": "ok", "phase": "3 — Ingestion Pipeline"}
