#!/usr/bin/env python3
"""Seed the ANVĪKṢA database from simulator datasets.

Usage:
    # Direct DB mode (no server needed, uses SQLAlchemy directly):
    python -m scripts.seed_from_simulator --scenario healthy --mode direct

    # HTTP mode (against running FastAPI server):
    python -m scripts.seed_from_simulator --scenario healthy --mode http

    # All scenarios:
    python -m scripts.seed_from_simulator --scenario all --mode direct
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("seed")

# Paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATASETS_DIR = REPO_ROOT / "soc-simulator" / "datasets"

ALL_SCENARIOS = [
    "healthy",
    "investigation_gap",
    "negative_space",
    "kpi_manipulation",
    "analyst_overload",
    "recurring_threat",
    "identity_anomaly",
]

# Entity files in FK-safe order
ENTITY_FILES = [
    ("socs", "socs.json"),
    ("analysts", "analysts.json"),
    ("devices", "devices.json"),
    ("assets", "assets.json"),
    ("threats", "threats.json"),
    ("events", "events.json"),
    ("alerts", "alerts.json"),
    ("incidents", "incidents.json"),
    ("investigations", "investigations.json"),
    ("escalations", "escalations.json"),
    ("analyst_actions", "analyst_actions.json"),
]

METADATA_COUNT_MAP = {
    "socs": "soc_count",
    "analysts": "analyst_count",
    "assets": "asset_count",
    "events": "event_count",
    "alerts": "alert_count",
    "incidents": "incident_count",
    "investigations": "investigation_count",
    "escalations": "escalation_count",
    "analyst_actions": "action_count",
}


def load_dataset(scenario_dir: Path) -> dict[str, list]:
    """Load all entity JSON files from a scenario directory."""
    dataset: dict[str, list] = {}
    for key, filename in ENTITY_FILES:
        filepath = scenario_dir / filename
        if filepath.exists():
            with open(filepath) as f:
                data = json.load(f)
            dataset[key] = data if isinstance(data, list) else [data]
            logger.info("  %s: %d records", key, len(dataset[key]))
        else:
            dataset[key] = []
            logger.warning("  %s: file not found (%s)", key, filepath)
    return dataset


def load_metadata(scenario_dir: Path) -> dict:
    """Load metadata.json for count verification."""
    meta_path = scenario_dir / "metadata.json"
    if meta_path.exists():
        with open(meta_path) as f:
            result: dict = json.load(f)
            return result
    return {}


def verify_counts(ingested: dict[str, int], metadata: dict) -> bool:
    """Compare ingested counts vs metadata.json expected counts."""
    ok = True
    print("\n  ┌─────────────────────┬──────────┬──────────┬────────┐")
    print("  │ Entity              │ Expected │ Ingested │ Status │")
    print("  ├─────────────────────┼──────────┼──────────┼────────┤")
    for entity_key, meta_key in METADATA_COUNT_MAP.items():
        expected = metadata.get(meta_key, "?")
        actual = ingested.get(entity_key, 0)
        match = "✓" if expected == actual else "✗"
        if expected != actual:
            ok = False
        print(f"  │ {entity_key:<19} │ {str(expected):>8} │ {str(actual):>8} │   {match}    │")
    print("  └─────────────────────┴──────────┴──────────┴────────┘")
    return ok


# ---------- Direct DB mode ----------

async def seed_direct(scenario_dir: Path) -> dict[str, int]:
    """Seed directly via SQLAlchemy (no HTTP server needed)."""
    # Import here to avoid import errors when not using direct mode
    import os
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///anviksa_test.db")

    from app.models.base import Base, engine, AsyncSessionLocal
    from app.schemas.ingestion import BatchIngestRequest
    from app.ingestion.service import ingest_batch

    # Import all models to register them
    import app.models  # noqa: F401

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    dataset = load_dataset(scenario_dir)

    # Build BatchIngestRequest from raw JSON
    batch = BatchIngestRequest.model_validate(dataset)

    async with AsyncSessionLocal() as session:
        counts = await ingest_batch(session, batch)

    return counts


# ---------- HTTP mode ----------

async def seed_http(scenario_dir: Path, base_url: str = "http://localhost:8000") -> dict[str, int]:
    """Seed via HTTP POST to running server."""
    try:
        import httpx
    except ImportError:
        logger.error("httpx required for HTTP mode: pip install httpx")
        sys.exit(1)

    dataset = load_dataset(scenario_dir)

    async with httpx.AsyncClient(base_url=base_url, timeout=120.0) as client:
        # Post as batch
        resp = await client.post("/api/ingestion/batch/raw", json=dataset)
        if resp.status_code != 200:
            logger.error("Batch POST failed: %s %s", resp.status_code, resp.text[:500])
            sys.exit(1)
        result = resp.json()
        counts = result.get("counts", {})
        errors = result.get("errors", [])
        if errors:
            logger.warning("  %d validation errors during ingestion", len(errors))
            for e in errors[:5]:
                logger.warning("    %s[%s]: %s", e.get("entity"), e.get("index"), str(e.get("error", ""))[:200])

    result_counts: dict[str, int] = counts
    return result_counts


# ---------- Main ----------

async def seed_scenario(scenario: str, mode: str, base_url: str) -> bool:
    scenario_dir = DATASETS_DIR / scenario
    if not scenario_dir.exists():
        logger.error("Dataset not found: %s", scenario_dir)
        return False

    logger.info("▶ Seeding '%s' (%s mode)", scenario, mode)

    if mode == "direct":
        counts = await seed_direct(scenario_dir)
    else:
        counts = await seed_http(scenario_dir, base_url)

    metadata = load_metadata(scenario_dir)
    ok = verify_counts(counts, metadata)
    if ok:
        logger.info("✅ %s: all counts match", scenario)
    else:
        logger.warning("⚠️  %s: count mismatch — check warnings above", scenario)
    return ok


async def main():
    parser = argparse.ArgumentParser(description="Seed ANVĪKṢA DB from simulator datasets")
    parser.add_argument("--scenario", default="healthy",
                        help="Scenario name or 'all' (default: healthy)")
    parser.add_argument("--mode", choices=["direct", "http"], default="direct",
                        help="direct=SQLAlchemy, http=POST to server (default: direct)")
    parser.add_argument("--url", default="http://localhost:8000",
                        help="Base URL for HTTP mode (default: http://localhost:8000)")
    args = parser.parse_args()

    scenarios = ALL_SCENARIOS if args.scenario == "all" else [args.scenario]

    all_ok = True
    for s in scenarios:
        ok = await seed_scenario(s, args.mode, args.url)
        if not ok:
            all_ok = False

    if all_ok:
        print("\n✅ All scenarios seeded and verified successfully")
    else:
        print("\n⚠️  Some scenarios had count mismatches")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
