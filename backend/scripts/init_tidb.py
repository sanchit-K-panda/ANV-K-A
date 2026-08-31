#!/usr/bin/env python3
"""Initialize ANVĪKṢA schema on TiDB Cloud and seed default users.

Usage:
    cd backend && python scripts/init_tidb.py
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Ensure backend is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Import all models to register with metadata
import app.models  # noqa: F401
from app.auth.service import seed_default_users
from app.models.base import AsyncSessionLocal, Base, engine, init_db


async def main():
    print("\n" + "=" * 60)
    print("  ANVĪKṢA — TiDB Cloud Schema Initialization")
    print("=" * 60)

    # Step 1: Test connection
    print("\n[1/3] Testing TiDB Cloud connection...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                __import__("sqlalchemy").text("SELECT VERSION()")
            )
            version = result.scalar()
            print(f"  ✓ Connected! TiDB version: {version}")
    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        print("\n  Check your DATABASE_URL in backend/app/core/config.py or .env")
        sys.exit(1)

    # Step 2: Create all tables
    print("\n[2/3] Creating 22 tables...")
    try:
        await init_db()
        table_names = [t.name for t in Base.metadata.sorted_tables]
        print(f"  ✓ Created {len(table_names)} tables:")
        for t in table_names:
            print(f"    - {t}")
    except Exception as e:
        print(f"  ✗ Table creation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    # Step 3: Seed default users
    print("\n[3/3] Seeding default users (Supervisor, Admin, Analyst)...")
    try:
        async with AsyncSessionLocal() as db:
            created = await seed_default_users(db)
        if created:
            print(f"  ✓ Seeded {len(created)} users:")
            for email in created:
                print(f"    - {email}")
        else:
            print("  ✓ Users already exist (idempotent)")
    except Exception as e:
        print(f"  ✗ User seeding failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    # Verify
    print("\n" + "-" * 60)
    print("  ✅ TiDB Cloud initialization complete!")
    print("  Default credentials:")
    print("    supervisor@anviksa.local / anviksa_supervisor")
    print("    admin@anviksa.local / anviksa_admin")
    print("    analyst@anviksa.local / anviksa_analyst")
    print("-" * 60 + "\n")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
