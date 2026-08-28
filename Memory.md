# Memory.md — ANVĪKṢA Running Log

> Updated at the end of every phase (Phases.md rule). Purpose: any agent or human
> can resume work with full context. Read alongside PROJECT.md, PRD.md,
> Architecture.md, Design.md, Rules.md.

---

## Project snapshot (2026-08-25)

- **Product:** ANVĪKṢA — Supervisory Analytics Tool for SOC Assessment (SAT-SA), SIH26157, NTRO
- **Repo:** https://github.com/sanchit-K-panda/ANV-K-A.git (branch `main`)
- **Author identity:** sanchit-K-panda <juug25btech30071@jainuniversity.ac.in> (set repo-locally; beware Antigravity IDE was signed in as a different GitHub account — necatiozmen — do not let it commit here)
- **Host OS:** Windows 11, git-bash shell; Python 3.14 via `py -3.14` (pytest + pydantic installed there); `PYTHONPATH=src` needed to run the simulator without installing
- **Skills installed in project:** `.agents/skills/` (Leonxlnx taste-skill set); `awesome-design-md/` = cloned corpus of 74 DESIGN.md design systems from VoltAgent — useful references for Phase 10 UI (linear.app/vercel/cursor fit the dark dense SOC aesthetic)

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 1. Scaffold + Schema Freeze | ✅ DONE (2026-08-28) | Repo tree ✅ (frontend/backend/ml/simulator/biometric/database/infrastructure/docs), docker-compose valid ✅ (postgres+redis+fastapi+next), SQLAlchemy Base 22 tables ✅, Alembic 001_phase1 head ✅, .env.example ✅, contracts-only frontend ✅. Fixes: duplicate devices→user_devices, enum+metadata reserved fixes, base.py. Verified: 22 tables create in sqlite, /api/health 2/2 tests pass, alembic upgrade --sql generates. |
| 2. SOC Simulator + Ground Truth | ✅ DONE | See details below |
| 3–16 | ⬜ not started | Next: Phase 3 ingestion pipeline |

## Phase 2 record — SOC Simulator (commit acea305)

Location: `soc-simulator/`. Run with `export PYTHONPATH=src && py -3.14 -m simulator …`

**What exists:**
- Frozen Pydantic v2 contracts: `src/simulator/schemas/entities.py` (12 entities, extra="forbid") + `schemas/enums.py`
- Generators: `world.py` (SOCs/analysts/devices/assets/threats), `telemetry.py` (events → alerts → incidents → investigations → escalations → actions with log-normal timelines scaled by analyst skill)
- All 7 scenarios in `src/simulator/scenarios/`: healthy (empty ground truth BY DESIGN), investigation_gap, negative_space, kpi_manipulation (labelled POTENTIAL_KPI_MANIPULATION, never "malicious"), analyst_overload, recurring_threat, identity_anomaly
- Ground truth: expected-vs-actual workflow per injection (`ground_truth/builder.py`) — deletions never lose what should have happened
- Exporters JSON/CSV/SQLite (`exporters/io.py`); validation with 5 checks (`validation/integrity.py`): schema, referential, temporal, scenario, ground-truth integrity
- CLI: `generate` / `validate` / `summary` (`cli.py`); all knobs config-driven (`config.py`, TOML overridable)

**Verified:** 32/32 tests pass; all 7 scenarios DATASET VALID at 10k events seed 42; 50k-event stress run valid. Example datasets committed under `datasets/`.

**Known tuning note:** default funnel is thin (~20 incidents per 10k events because only HIGH/CRITICAL events alert). For denser ML datasets later raise `alert_rate`/`incident_rate` in a config TOML — no code change.

**Usage quick reference:**
```bash
python -m simulator generate --scenario investigation_gap --events 10000 --seed 42
python -m simulator validate datasets/investigation_gap
python -m simulator summary datasets/investigation_gap
```

## Frozen decisions (do not relitigate)

1. Build order = the merged 16-phase list in Phases.md (simulator before pipeline, rules before ML, identity/audit after core product)
2. Simulator generates data + truth only — it NEVER performs detection; ANVĪKṢA must discover injections independently (measured by precision/recall/F1 vs ground truth)
3. No blockchain — hash-chained append-only audit log (Rules.md §7)
4. Hybrid AI hierarchy: deterministic rules > ML baselines > optional local LLM for prose only (Rules.md §3)
5. Fully air-gapped runtime; no cloud anything; offline status must be UI-visible
6. Every finding answers WHAT/WHY/WHEN/WHERE/EVIDENCE/CONFIDENCE/RECOMMENDATION; risk scores always itemized factor sums
7. LiDAR/biometrics are late-phase enhancements, never foundations
8. graphifyy installed globally but NOT used for this project — Memory.md + existing docs are the context system (revisit if codebase navigation becomes costly ~Phase 6+)

## Phase 1 record — Scaffold + Schema Freeze (2026-08-28)

**What was frozen:**
- `backend/app/models/base.py` — DeclarativeBase + async engine/session (was missing, caused import failure)
- `backend/app/models/identity.py` — renamed `devices` → `user_devices` to resolve clash with `soc.devices` (both used `devices` table name), fixed FKs; converted `UserRole` str class → `str,enum.Enum`; added `UserDevice` alias
- `backend/app/models/soc.py` — converted all `class Foo(str):` → `str,enum.Enum`, renamed `metadata` → `extra_data` (mapped to column `metadata`) for `Event`+`AnalystAction` (SQLAlchemy reserved name), 22 tables verified in sqlite memory
- `backend/app/models/analytics.py` — enum fix
- `backend/app/main.py` + `app/api/health.py` — minimal FastAPI runnable (GET / + /api/health + /api/ready DB check), CORS, health tests 2/2
- `backend/alembic.ini` + `alembic/env.py` config fix + `alembic/versions/001_phase1_schema_freeze.py` — full 22-table migration (users→recommendations + junction tables) with correct FK order; `alembic history` head = 001, `upgrade --sql` generates correctly
- `docker-compose.yml` — removed obsolete `version: '3.8'` and stale `./database/migrations:/docker-entrypoint-initdb.d` mount; `docker compose config` VALID; services postgres+redis+backend+frontend all local, no cloud
- `.env.example` — Postgres/Redis/backend/frontend vars, no cloud deps
- `frontend/` — Next.js 14 scaffold (package.json, Dockerfile, next.config.js, tsconfig.json, app/layout.tsx+page.tsx with ● LOCAL/OFFLINE indicator per Design.md), contracts-only per Phases.md
- Placeholder `.gitkeep` for ml/*/anomaly/behaviour/preprocessing etc, biometric/*, infrastructure/*, docs/*
- Verification: `Base.metadata.create_all(sqlite)` 22 tables, missing=0; `docker compose config` VALID; `alembic upgrade head --sql` OK

**Known Phase 1 debt for Phase 3:**
- `docker compose up` not yet exercised against real Postgres (requires Docker daemon running); `alembic current/upgrade` needs live DB — will verify on `docker compose up postgres` in Phase 3 start
- Frontend is scaffold only — no dashboard logic (intentional per Phase 1 contracts-only rule)

## Next up — Phase 3 Ingestion Pipeline

Phase 1 ✅ closed. Next: Phase 3 `POST /api/events | /alerts | /incidents | /investigations | /escalations` with validation→normalization→correlation IDs→Postgres persistence, handling thousands of synthetic records. No analytics logic yet.
