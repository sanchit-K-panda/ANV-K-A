# PERSON_2_memory.md — Person 2 Platform/Security Reference

> **Owner:** Person 2 (Platform / Security) — YOU  
> **Created:** 2026-08-28 · **Last pull:** `d1ff287` (2026-08-28 16:13) · **Branch:** `main`  
> **Companion docs:** `Memory.md` (team running log), `PERSON_2_plan.md` (execution plan), `Phases.md`, `Architecture.md`, `Rules.md`, `Design.md`  
> **Purpose:** Personal scratchpad that survives `git pull` — keep Person-2-specific state, gotchas, and runbook here. Do NOT duplicate `Memory.md`; reference it.

---

## 1. Pull Snapshot — What Just Landed (2026-08-28)

### Commits since `acea305` (Phase 2 DONE baseline)

| Hash | Msg | Key files |
|---|---|---|
| `e7bcc69` | `feat: initialize SOC telemetry and analytics backend structure` | `backend/Dockerfile` (17L), `backend/alembic/*`, `backend/app/models/{soc.py 664L, identity.py 219L, analytics.py 177L, __init__.py 94L}`, `backend/app/core/config.py` (33L), `docker-compose.yml` (90L), `backend/pyproject.toml` (55L) |
| `7f2d6d2` | `feat: complete project scaffold with SQLAlchemy models, Alembic migrations, and Next.js frontend structure` | `backend/app/models/base.py` (25L), `backend/app/main.py` (29L), `backend/app/api/health.py` (22L), `backend/alembic/versions/001_phase1_schema_freeze.py` (371L, 22 tables), `backend/anviksa_backend.egg-info/*`, `frontend/{package.json 21L, Dockerfile 7L, next.config.js 5L, tsconfig.json 21L, app/layout.tsx 13L, app/page.tsx 22L}`, `.env.example` (22L), `backend/tests/test_health.py` (18L), `.gitkeep` for `ml/*, biometric/*, infrastructure/*, docs/*`, `Memory.md` Phase 1 marked ✅ |
| `d1ff287` | `refactor: update healthy dataset analyst actions and generate project egg-info files` | `PERSON_2_plan.md` (438L), `soc-simulator/datasets/healthy/*` regenerated (events.json -151k lines trimmed, alerts.json, analyst_actions.json etc.), `metadata.json` bumps for all 7 scenarios, `soc-simulator/src/soc_simulator.egg-info/*` |
| `40f7cde` | `Initial commit` (inner `ANV-K-A` submodule pointer) | `ANV-K-A` 1L |

**Verify yourself:**
```bash
git -C /home/tejasw/SIH/ANV-K-A log --oneline -5
git -C /home/tejasw/SIH/ANV-K-A diff HEAD~2 --stat
```

### Current `Memory.md` state (read `Memory.md:19-80`)

- **Phase 1:** `✅ DONE (2026-08-28)` — repo tree, docker-compose valid, 22 tables, Alembic 001 head, `.env.example`, contracts-only frontend. Fixes: `devices→user_devices`, `metadata→extra_data`, `str→str,Enum`, `base.py`.
- **Phase 2:** `✅ DONE` — simulator 7 scenarios, 32 tests, ground truth.
- **Next:** Phase 3 ingestion `POST /api/events|alerts|incidents|investigations|escalations`.

> If you pull again and `Memory.md:21` changes, update §2 below and bump `Last pull` header.

---

## 2. Where We Are (Phase Gate)

```
Phase 1 Scaffold + Schema Freeze  ✅ DONE (2026-08-28) — 22 tables, alembic head, docker config
Phase 2 SOC Simulator + Ground Truth ✅ DONE (2026-08-28) — 7 scenarios, 32 tests
Phase 3 Ingestion Pipeline         ✅ DONE (2026-08-28) — FastAPI POST endpoints, batch/raw ingestion, 16/16 tests pass, all 7 scenarios verified
Phase 4-9 Engines                  ⬜ Person 1 (UNBLOCKED — telemetry in DB)
Phase 10 Frontend (5 screens)      ⬜ Person 1 (Reassigned)
Phase 11 Secure Identity           ✅ DONE (2026-08-28) — Argon2, JWT, rotating credentials, continuous verify, session lock, 7/7 tests pass
Phase 12 Audit Chain               ✅ DONE (2026-08-28) — SHA-256 hash chaining, verify_chain, tamper detection, 4/4 tests pass
Phase 13 Air-Gap Proof             ✅ DONE (2026-08-28) — infrastructure/verify_airgap.py 6/6 checks pass (100% offline ready)
Phase 14-16 Joint                  ⬜ Both (7-scenario validation, demo)
```

**Rule:** `Phases.md:3` — build and verify one phase before next, leave app runnable, update `Memory.md` at end of every phase.

---

## 3. Scaffold Map — Where Things Live Now (Post-Pull)

```
SIH/ANV-K-A/  (repo root, git repo at /home/tejasw/SIH/ANV-K-A/.git)
├── Memory.md                         # team log — update at phase end
├── PERSON_2_plan.md                  # your execution plan (P0→P2, gantt)
├── PERSON_2_memory.md                # THIS FILE — personal reference
├── .env.example                      # Postgres/Redis/backend/frontend vars, no cloud
├── docker-compose.yml                # postgres:16 + redis:7 + backend:8000 + frontend:3000, networks anviksa-network
├── Architecture.md / PRD.md / Phases.md / Rules.md / Design.md / PROJECT.md
├── backend/
│   ├── Dockerfile                    # python:3.12-slim, uvicorn
│   ├── pyproject.toml                # fastapi, asyncpg, alembic, redis, pydantic-settings, passlib[argon2], pandas/numpy/scipy
│   ├── alembic.ini + alembic/env.py + script.py.mako
│   ├── alembic/versions/001_phase1_schema_freeze.py  # 22 tables, enum drops
│   ├── app/
│   │   ├── main.py                   # FastAPI app, CORS, include health_router /api
│   │   ├── core/config.py            # settings (DATABASE_URL, REDIS_URL, SECRET_KEY)
│   │   ├── models/
│   │   │   ├── base.py               # DeclarativeBase + async engine/session + get_db + init_db
│   │   │   ├── __init__.py           # re-exports Base, engine, all 22 models
│   │   │   ├── identity.py           # User, BiometricProfile, UserDevice (alias IdentityDevice), Session, AuditLog, UserRole
│   │   │   ├── soc.py                # Soc, Analyst, Device (SocDevice), Asset, Threat, Event, Alert, Incident(+junctions), Investigation, Escalation, AnalystAction + enums
│   │   │   └── analytics.py          # Finding, RiskAssessment, Recommendation + FindingType/Severity/Status
│   │   ├── api/health.py             # GET /health, GET /ready (SELECT 1)
│   │   ├── api/__init__.py / analytics/__init__.py / audit/__init__.py / auth/__init__.py / findings/__init__.py / ingestion/__init__.py / risk/__init__.py / schemas/__init__.py / security/__init__.py / services/__init__.py  # stubs for Phase 3+
│   │   └── ... (models/analytics.py etc.)
│   └── tests/test_health.py          # 2 tests for /health
├── frontend/
│   ├── package.json                  # next 14.2.5, react 18.3.1, ts 5.4.5
│   ├── next.config.js + tsconfig.json
│   ├── Dockerfile                    # node:20-alpine
│   └── app/
│       ├── layout.tsx                # root layout
│       ├── page.tsx                  # Phase 1 placeholder: fetches GET /api/health, shows ● LOCAL/OFFLINE note
│       └── placeholder.txt
├── soc-simulator/
│   ├── src/simulator/schemas/entities.py  # frozen Pydantic contracts (12 entities, extra="forbid")
│   ├── src/simulator/config.py       # DEFAULTS_TOML tunables
│   ├── datasets/{healthy,investigation_gap,negative_space,kpi_manipulation,analyst_overload,recurring_threat,identity_anomaly}/ # regenerated
│   └── src/soc_simulator.egg-info/*
├── ml/{anomaly,behaviour,preprocessing,recurrence,models,evaluation}/.gitkeep  # Person 1 — stubs
├── biometric/{enrollment,verification,liveness,lidar}/.gitkeep                  # Phase 11
├── database/{migrations,seeds}/.gitkeep
├── infrastructure/{compose,docker,tls}/.gitkeep
└── docs/{api,architecture,security,testing}/.gitkeep
```

**Check scaffold:**
```bash
ls -R backend/app  | head -n 60
ls -R frontend     | head -n 20
cat docker-compose.yml | head -n 40
```

---

## 4. DB Quick Ref — 22 Tables (Frozen in `001_phase1_schema_freeze.py:27-370`)

> Source: `backend/app/models/{base,identity,soc,analytics}.py` + migration. Do NOT rename tables/cols without Alembic migration + `Memory.md` update (`Rules.md:9`).

### Identity & Access (5)

| Table | PK | Key cols | Notes |
|---|---|---|---|
| `users` | uuid | name, email (unique, indexed), role `user_role` (SUPERVISOR/ADMIN/ANALYST), status, password_hash, created_at/updated_at | |
| `biometric_profiles` | uuid | user_id FK→users (unique, indexed), protected_template bytea (AES-256-GCM, never raw `Rules.md:5`), encryption_key_reference, timestamps | |
| `user_devices` | uuid | device_identifier unique, user_id FK→users, trust_status (UNVERIFIED/TRUSTED/REVOKED), last_seen | **was `devices` → renamed to avoid clash with `soc.devices`** |
| `sessions` | uuid | user_id FK, device_id FK→user_devices, session_status, issued_at/expires_at/last_verified_at, session_credential (512), permissions text `{}` | credential = User+Device+Session+Role+Timestamp+Permissions, rotating ~6min |
| `audit_logs` | uuid | user_id FK→users SET NULL, session_id FK→sessions SET NULL, action (LOGIN/VIEW_FINDING/...), resource, resource_id, timestamp indexed, device_id FK→user_devices SET NULL, identity_status, previous_hash (64), current_hash (64) | **append-only, hash-chain `hash_n=H(record_n+hash_{n-1})` `Rules.md:7`** |

### SOC Core (10 + 3 junctions)

| Table | Key cols |
|---|---|
| `socs` | name, environment, location, timezone, status |
| `analysts` | soc_id FK→socs, name, role `analyst_role` (TIER1/TIER2/TIER3/SUPERVISOR), skill_level int, shift `MORNING/EVENING/NIGHT`, status |
| `devices` (SOC) | soc_id FK, hostname, device_type `SIEM/EDR/IDS/FIREWALL/CASE_MANAGEMENT`, ip_address, os, criticality `CRITICAL/HIGH/MEDIUM/LOW`, status ONLINE |
| `assets` | soc_id FK, hostname, asset_type `SERVER/WORKSTATION/DATABASE/NETWORK_DEVICE/CLOUD_INSTANCE/IOT`, ip, criticality, business_unit, owner, status |
| `threats` | name, category, severity `CRITICAL/HIGH/MEDIUM/LOW/INFO`, mitre_techniques text `[]`, first_seen/last_seen, status |
| `events` | soc_id FK, timestamp indexed, event_type, source, asset_id FK→assets SET NULL, device_id FK→devices SET NULL, analyst_id FK→analysts SET NULL, severity `severity`, description, metadata text `{}` (**attr `extra_data` → col `metadata` reserved fix**) |
| `alerts` | soc_id FK, timestamp, source, severity, alert_type, asset_id FK, source_device_id FK→devices, event_ids text `[]`, analyst_id FK, status `NEW/TRIAGED/CLOSED`, priority int 3, created_at/closed_at |
| `incidents` | soc_id FK, severity, status `OPEN/INVESTIGATING/ESCALATED/RESOLVED/CLOSED`, created_at/closed_at, assigned_analyst_id FK |
| `incident_alerts` / `incident_threats` / `incident_assets` | (incident_id, alert_id/threat_id/asset_id) composite PK junctions |
| `investigations` | incident_id FK, analyst_id FK, started_at/completed_at, status `IN_PROGRESS/COMPLETED/ABANDONED`, evidence_count, notes |
| `escalations` | incident_id FK, analyst_id FK, escalated_to, reason, timestamp, status `OPEN/ACKNOWLEDGED/RESOLVED` |
| `analyst_actions` | analyst_id FK, soc_id FK, incident_id FK SET NULL, action_type, timestamp, duration_seconds, metadata text `{}` (attr `extra_data`) |

### Analytics (3)

| Table | Key cols | Explainability contract |
|---|---|---|
| `findings` | type `EXECUTION_GAP/NEGATIVE_SPACE/BEHAVIOURAL_ANOMALY/RECURRING_THREAT/WORKLOAD_IMBALANCE/KPI_MANIPULATION/IDENTITY_ANOMALY`, severity `CRITICAL/HIGH/MEDIUM/LOW`, confidence float, description, evidence text `{}`, incident_id FK SET NULL, created_at/updated_at, status `OPEN/INVESTIGATING/RESOLVED/DISMISSED`, assigned_analyst_id FK SET NULL, **what, why, when, where, recommendation** | Every finding must carry WHAT/WHY/WHEN/WHERE/EVIDENCE/CONFIDENCE/RECOMMENDATION `Rules.md:6` |
| `risk_assessments` | finding_id FK→findings unique, score int 0-100, severity `CRITICAL/HIGH/MEDIUM/LOW`, factors text (itemized named weights), calculated_at | `Risk = sum(factors)` never bare number `Architecture.md:5` |
| `recommendations` | finding_id FK→findings, title, description, priority int 3, status PENDING, timestamps | |

**Enums created:** `user_role, analyst_role, shift, device_type, criticality, severity, alert_status, incident_status, investigation_status, escalation_status, finding_type, finding_severity, finding_status, risk_severity, asset_type` — dropped in `downgrade()`.

**Verify schema:**
```bash
# in-memory sqlite check (no docker needed)
python -c "from app.models.base import Base; from app.models import *; Base.metadata.create_all; print([t.name for t in Base.metadata.sorted_tables]); print(len(list(Base.metadata.tables)))"
# or via alembic sql
alembic -c backend/alembic.ini upgrade head --sql | head -n 100
```

---

## 5. Runbook — Copy-Paste for Person 2

### Docker (Phase 1 runnable check)

```bash
cp .env.example .env  # edit SECRET_KEY if needed
docker compose config          # VALID check (no version key, no stale mounts) — Memory.md:72
docker compose up --build -d   # postgres+redis+backend+frontend, all local no cloud Rules.md:4
docker compose logs -f backend
curl http://localhost:8000/                # {"service":"ANVĪKṢA","status":"ok","phase":"1 — Scaffold + Schema Freeze"} backend/app/main.py:29
curl http://localhost:8000/api/health      # {"status":"ok"}  health.py:14
curl http://localhost:8000/api/ready       # {"status":"ready","database":"connected"} health.py:18 (needs DB)
# frontend
curl http://localhost:3000/                # shows health JSON in <pre> + ● LOCAL/OFFLINE note
```

### Alembic

```bash
alembic -c backend/alembic.ini history          # head = 001_phase1
alembic -c backend/alembic.ini current          # check applied
alembic -c backend/alembic.ini upgrade head     # apply 22 tables (needs live postgres)
alembic -c backend/alembic.ini upgrade head --sql | head -n 80  # dry-run, works offline
psql "postgresql://anviksa:anviksa_dev@localhost:5432/anviksa" -c "\dt"  # 22 tables
```

### Simulator (ground truth source for Phase 3 ingestion tests)

```bash
cd soc-simulator
export PYTHONPATH=src  # or pip install -e . (needs pydantic)
python -m simulator generate --scenario healthy --events 10000 --seed 42
python -m simulator generate --scenario all --events 10000 --seed 42
python -m simulator validate datasets/healthy
python -m simulator summary datasets/healthy
# output: datasets/<scenario>/{events,alerts,incidents,investigations,escalations,analyst_actions,metadata,ground_truth}.json
# plus healthy/events.json trimmed in d1ff287 — re-generate if you need full 150k lines back
```

### Backend tests (Phase 1)

```bash
cd backend
pytest tests/test_health.py -v  # 2/2 should pass (health + ready)
```

### Env (`.env.example:1-22` — copy to `.env`)

```
POSTGRES_DB=anviksa POSTGRES_USER=anviksa POSTGRES_PASSWORD=anviksa_dev
REDIS_PASSWORD=anviksa_dev
DATABASE_URL=postgresql+asyncpg://anviksa:anviksa_dev@postgres:5432/anviksa  # compose uses postgres:5432, local uses localhost:5432
REDIS_URL=redis://:anviksa_dev@redis:6379/0
SECRET_KEY=dev-secret-change-in-production ALGORITHM=HS256 ACCESS_TOKEN_EXPIRE_MINUTES=30 ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:8000 NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 6. Known Debt & Gotchas (For Phase 3 Start)

- **Docker not yet exercised against real Postgres** (`Memory.md:75`) — `docker compose up` + `alembic upgrade head` needs Docker daemon. `upgrade --sql` works offline, but `alembic current` needs live DB. Verify on Phase 3 start.
- **Frontend is scaffold-only** (`Memory.md:76`) — intentional per `Phases.md:20` contracts-only. No dashboard logic. Next.js placeholder in `frontend/app/page.tsx:1-22` just fetches `/api/health`.
- **Device table naming** — `soc.devices` vs `identity.user_devices` clash fixed by renaming `devices→user_devices` for identity. FKs updated. Do not reintroduce `devices` for identity.
- **Reserved names** — `metadata` attr renamed to `extra_data` (col still `metadata`) for `Event` + `AnalystAction` (`soc.py`) due SQLAlchemy reserved. Same for any future `metadata` column.
- **Enums** — all `class Foo(str):` → `class Foo(str, enum.Enum):` (`enum.Enum` required). Missing `import enum`.
- **Base missing** — `backend/app/models/base.py` now provides `Base, engine, AsyncSessionLocal, get_db, init_db` — import from there, not ad-hoc.
- **Healthy dataset trimmed** — `d1ff287` regenerated healthy `events.json` from 151k lines → ~small (analyst_actions 844L etc.). If Phase 3 needs full volume, re-run `python -m simulator generate --scenario healthy --events 10000`.
- **Egg-info artifacts** — `backend/anviksa_backend.egg-info/*` + `soc-simulator/src/soc_simulator.egg-info/*` now committed — ok, but don't edit manually; they regenerate on `pip install -e .`.

---

## 7. Next Up — Phase 3 Ingestion (YOUR TODO)

> `Memory.md:78-80`, `Phases.md:29-32`, `PERSON_2_plan.md:3B`

- **Endpoints:** `POST /api/events | /alerts | /incidents | /investigations | /escalations` + `POST /api/ingest/batch` (bulk simulator JSON) + `GET /api/ingest/status/:id`
- **Pipeline:** Validation (Pydantic `extra="forbid"`) → normalization (timestamps UTC, severity enum, correlation IDs) → persist via async session. Handle thousands of records, no analytics logic yet.
- ** wiring:** `backend/scripts/seed_from_simulator.py` or direct `curl -F dataset=@soc-simulator/datasets/healthy/events.json http://localhost:8000/api/ingest/batch`
- **Tests:** `backend/tests/test_ingestion.py` — happy 10 rows, malformed 422 + raw preserved (`Rules.md:8`), duplicate idempotent, 10k batch throughput.
- **Unblocks:** Person 1 Phase 4 (Execution Gap) once `SELECT count(*) FROM alerts` matches `metadata.json:alert_count`.

**Pre-Phase 3 checklist:**
- [ ] `docker compose up -d postgres redis` healthy
- [ ] `alembic -c backend/alembic.ini upgrade head` succeeds
- [ ] `curl /api/health` + `curl /api/ready` 200
- [ ] `python -m simulator generate --scenario healthy --events 1000` + ingest 1000 → counts match

---

## 8. Links & File Pointers

| Doc | Path | Relevant § |
|---|---|---|
| Phases | `Phases.md:1` | §1-3 build order 1→16, Phase 3 spec `Phases.md:29-32` |
| Architecture | `Architecture.md:1` | §10 repo layout, §8 data model tables, §9 stack, §11 deployment, §7 identity flow |
| PRD | `PRD.md:1` | §9 seven scenarios acceptance gate, §7 feature inventory |
| Rules | `Rules.md:1` | §7 audit hash-chain, §4 offline, §5 biometric, §6 finding shape, §9 naming |
| Design | `Design.md:1` | §19-27 dark SOC theme, severity palette, offline drawer `Design.md:58-65`, explainability card `Design.md:51` |
| Team log | `Memory.md:1` | Phase status table `Memory.md:19`, frozen decisions `Memory.md:48-57`, Phase 1 record `Memory.md:59-76` |
| Your plan | `PERSON_2_plan.md:1` | §1-3 P0 scaffold→ingestion, §11 identity, §12 audit, §13 air-gap |
| DB migration | `backend/alembic/versions/001_phase1_schema_freeze.py:1` | 22 tables, 371L |
| Models | `backend/app/models/{base.py:1,identity.py:1,soc.py:1,analytics.py:1,__init__.py:1}` | |
| Compose | `docker-compose.yml:1` | 87L, services postgres/redis/backend/frontend |
| Env | `.env.example:1` | 22L |
| Simulator | `soc-simulator/src/simulator/schemas/entities.py:1` | frozen contracts, 12 entities |
| Simulator cfg | `soc-simulator/src/simulator/config.py:1` | DEFAULTS_TOML tunables |

---

## 9. Changelog (This File)

- **2026-08-28 (d1ff287):** Created from audit of `e7bcc69→7f2d6d2→d1ff287`. Captures 22-table freeze, scaffold map, pull snapshot, debt, runbook. Next: Phase 3 ingestion.

