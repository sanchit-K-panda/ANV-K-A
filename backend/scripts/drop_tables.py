#!/usr/bin/env python3
"""Drop all ANVĪKṢA tables from TiDB Cloud (for clean re-creation)."""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.models  # noqa: F401
from app.models.base import Base, engine


async def main():
    print("Dropping all tables from TiDB Cloud...")
    try:
        async with engine.begin() as conn:
            # Disable FK checks for clean drop
            await conn.execute(__import__("sqlalchemy").text("SET FOREIGN_KEY_CHECKS = 0"))
            await conn.run_sync(Base.metadata.drop_all)
            await conn.execute(__import__("sqlalchemy").text("SET FOREIGN_KEY_CHECKS = 1"))
        print("✓ All tables dropped.")
    except Exception as e:
        print(f"✗ Drop failed: {e}")
        # Try brute force
        import sqlalchemy as sa
        async with engine.begin() as conn:
            await conn.execute(sa.text("SET FOREIGN_KEY_CHECKS = 0"))
            for table in reversed(Base.metadata.sorted_tables):
                try:
                    await conn.execute(sa.text(f"DROP TABLE IF EXISTS `{table.name}`"))
                    print(f"  Dropped {table.name}")
                except Exception as e2:
                    print(f"  Skip {table.name}: {e2}")
            await conn.execute(sa.text("SET FOREIGN_KEY_CHECKS = 1"))
        print("✓ Force drop complete.")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
