"""Dataset exporters: JSON, CSV, SQLite."""
from __future__ import annotations

import json
import logging
import sqlite3
from pathlib import Path

from simulator.schemas.entities import Dataset

log = logging.getLogger(__name__)

# entity name -> dataset attribute
COLLECTIONS = [
    ("socs", "socs"), ("analysts", "analysts"), ("devices", "devices"),
    ("assets", "assets"), ("threats", "threats"), ("events", "events"),
    ("alerts", "alerts"), ("incidents", "incidents"),
    ("investigations", "investigations"), ("escalations", "escalations"),
    ("analyst_actions", "actions"), ("ground_truth", "ground_truth"),
]


def _dump_model(obj) -> dict:
    return json.loads(obj.model_dump_json())


def export_json(ds: Dataset, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for fname, attr in COLLECTIONS:
        (out_dir / f"{fname}.json").write_text(
            json.dumps([_dump_model(m) for m in getattr(ds, attr)], indent=1),
            encoding="utf-8")
    (out_dir / "metadata.json").write_text(
        json.dumps(_dump_model(ds.metadata), indent=2), encoding="utf-8")
    log.info("JSON export complete → %s", out_dir)


def export_csv(ds: Dataset, out_dir: Path) -> None:
    import csv
    out_dir.mkdir(parents=True, exist_ok=True)
    for fname, attr in COLLECTIONS:
        rows = [_dump_model(m) for m in getattr(ds, attr)]
        if not rows:
            continue
        flat: list[dict] = []
        for r in rows:
            flat.append({k: (json.dumps(v) if isinstance(v, (dict, list)) else v)
                         for k, v in r.items()})
        with open(out_dir / f"{fname}.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=list(flat[0].keys()))
            w.writeheader()
            w.writerows(flat)
    log.info("CSV export complete → %s", out_dir)


def export_sqlite(ds: Dataset, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    db_path = out_dir / "soc_simulator.db"
    if db_path.exists():
        db_path.unlink()
    conn = sqlite3.connect(db_path)
    for fname, attr in COLLECTIONS:
        rows = [_dump_model(m) for m in getattr(ds, attr)]
        if not rows:
            continue
        cols = list(rows[0].keys())
        conn.execute(f"CREATE TABLE {fname} ({', '.join(c + ' TEXT' for c in cols)})")
        conn.executemany(
            f"INSERT INTO {fname} VALUES ({','.join('?' * len(cols))})",
            [tuple(json.dumps(r[c]) if isinstance(r[c], (dict, list)) else str(r[c])
                   for c in cols) for r in rows])
    conn.commit()
    conn.close()
    log.info("SQLite export complete → %s", db_path)
    return db_path
