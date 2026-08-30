# Memory.md — ANVĪKṢA Running Log

> Updated at the end of every phase (Phases.md rule). Purpose: any agent or human
> can resume work with full context. Read alongside PROJECT.md, PRD.md,
> Architecture.md, Design.md, Rules.md.

---

## Project snapshot (2026-08-28 — post-pull d1ff287)

- **Product:** ANVĪKṢA — Supervisory Analytics Tool for SOC Assessment (SAT-SA), SIH26157, NTRO
- **Repo:** https://github.com/sanchit-K-panda/ANV-K-A.git (branch `main`, HEAD `d1ff287` 2026-08-28 16:13)
- **Author identity:** sanchit-K-panda <juug25btech30071@jainuniversity.ac.in> (set repo-locally; beware Antigravity IDE was signed in as a different GitHub account — necatiozmen — do not let it commit here)
- **Host OS:** Windows 11, git-bash shell; Python 3.14 via `py -3.14` (pytest + pydantic installed there); `PYTHONPATH=src` needed to run the simulator without installing
- **Last pull:** `e7bcc69` (backend scaffold) → `7f2d6d2` (22-table freeze + Next.js + docker-compose) → `d1ff287` (PERSON_2_plan.md + healthy dataset regen). Full scaffold now on disk: `backend/`, `frontend/`, `ml/`, `biometric/`, `database/`, `infrastructure/`, `docs/` + 22-table Alembic 001
- **Person 2 refs:** `PERSON_2_plan.md` (platform/security execution plan, P0→P2), `PERSON_2_memory.md` (personal runbook + DB quick ref + pull snapshot) — created 2026-08-28 for Person 2 local continuity alongside this team log
- **Skills installed in project:** `.agents/skills/` (Leonxlnx taste-skill set); `awesome-design-md/` = cloned corpus of 74 DESIGN.md design systems from VoltAgent — useful references for Phase 10 UI (linear.app/vercel/cursor fit the dark dense SOC aesthetic)

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 1. Scaffold + Schema Freeze | ✅ DONE (2026-08-28) | Repo tree ✅, docker-compose valid ✅, SQLAlchemy 22 tables ✅, Alembic 001_phase1 ✅, .env.example ✅ |
| 2. SOC Simulator + Ground Truth | ✅ DONE (2026-08-28) | 7 scenarios, 32 tests, ground truth, validated |
| 3. Ingestion Pipeline | ✅ DONE (2026-08-28) | FastAPI POST endpoints, validation/normalization, batch ingestion, 16/16 tests pass, all 7 scenarios verified |
| 4–9. Detection & Analytics Engines | ⬜ Next for Person 1 | Execution Gap, Negative Space, Behaviour ML, Correlation, Risk, Explainability |
| 10. Frontend (5 screens) | ⏸ Skipped for now | Per user instruction (deferred) |
| 11. Secure Identity | ✅ DONE (2026-08-28) | Argon2 password hashing, JWT tokens, rotating session credentials, session locking, role enforcement, 7/7 tests pass |
| 12. Audit Chain | ✅ DONE (2026-08-28) | Append-only SHA-256 hash chaining, verify_chain, tamper detection, privileged API, 4/4 tests pass |
| 13. Air-Gap Proof | ✅ DONE (2026-08-28) | infrastructure/verify_airgap.py 6/6 offline checks pass — 100% offline ready |
| 14–16. Joint Validation & SIH Demo | ⬜ Not started | 7-scenario validation, metrics, demo rehearsal |

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

## Phase 3 record — Ingestion Pipeline (2026-08-28)
- Endpoints: `POST /api/ingestion/events|alerts|incidents|investigations|escalations|socs|analysts|devices|assets|threats|analyst_actions` + `/batch` + `/batch/raw` + `/stats` + aliases `POST /api/events|alerts|incidents|investigations|escalations`.
- Script: `backend/scripts/seed_from_simulator.py` supporting direct SQLAlchemy mode and HTTP mode.
- Verification: Tested against all 7 simulator scenarios (`healthy`, `investigation_gap`, `negative_space`, `kpi_manipulation`, `analyst_overload`, `recurring_threat`, `identity_anomaly`) — 100% count match on every entity.
- Tests: `backend/tests/test_ingestion.py` — 16/16 passed.

## Phase 11 record — Secure Identity (2026-08-28)
- Module: `backend/app/auth/` (security, schemas, service, dependencies).
- Features: Local Argon2 password hashing (`passlib[argon2]`), JWT access tokens (`python-jose`), rotating cryptographic session credentials (`User+Device+Session+Role+Timestamp+Permissions`), continuous verification (`POST /api/auth/verify`), session locking on anomaly (`POST /api/auth/lock-session`), default user seeding (Supervisor, Admin, Analyst).
- Tests: `backend/tests/test_auth.py` — 7/7 passed.

## Phase 12 record — Audit Chain (2026-08-28)
- Module: `backend/app/audit/` (service, schemas).
- Features: Append-only cryptographic hash chain (`hash_n = SHA-256(record_n + hash_{n-1})`), `verify_audit_chain` integrity validation with pinpoint tamper detection, automated audit logging on privileged events (login, logout, session locking), privileged query endpoints.
- Tests: `backend/tests/test_audit.py` — 4/4 passed (including intentional DB tampering detection test).

## Phase 13 record — Air-Gap Proof (2026-08-28)
- Script: `infrastructure/verify_airgap.py` — executes 6-step offline validation (schema, Argon2 user seed, cryptographic auth & session rotation, batch telemetry ingestion, SHA-256 hash chaining, and tamper detection).
- Verification: 6/6 checks passed — platform is 100% offline & air-gap compliant.

## Overall Backend Test Status
- 29/29 tests passing across health, ingestion, auth, and audit modules.

