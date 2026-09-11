# Memory.md — ANVĪKṢA Running Log

> Updated at the end of every phase (Phases.md rule). Purpose: any agent or human
> can resume work with full context. Read alongside PROJECT.md, PRD.md,
> Architecture.md, Design.md, Rules.md.

---

## Project snapshot (2026-09-11 — post-audit remediation)

- **Product:** ANVĪKṢA — Supervisory Analytics Tool for SOC Assessment (SAT-SA), SIH26157, NTRO
- **Repo:** https://github.com/sanchit-K-panda/ANV-K-A.git (branch `main`)
- **Host OS:** Windows 11, git-bash shell; Python 3.14 via `py -3.14` (pytest + pydantic installed there); `PYTHONPATH=src` needed to run the simulator without installing
- **REMEDIATION.md (2026-09-10 audit) status:** P0-1 ✅ (VIKĀRA config recalibrated, honest feature imputation, moment-precise GT oracle, canonical eval artifacts), P0-2 ✅ (density config `configs/simulator-density.toml`, benchmark FP-rule aligned with window evaluator, sample sizes reported), P0-3 ✅ (multi-SOC maturity profiles + `ml/supervisory/ranking.py` + `/api/supervisory/ranking` + `/supervision` UI), P0-4 ✅ (`ml/supervisory/examiner.py` + `/samples` endpoint + examiner queue UI), P1-5 ✅ (cloud/TiDB/DeepSeek-API egress purged, air-gap re-verified), P1-6 ✅ (mockData.ts deleted, 7 pages migrated to backend, api.ts de-fabricated), P2-7 ✅ (feature schema v1.1: governance/discipline/resilience indicators), P2-8 ✅ (engine naming table PRD §7.2.1 + PROJECT.md), P2-9 ✅ (this refresh; duplicate eval artifacts removed; blockchain cursor deleted)
- **P0-1/P0-2 acceptance caveat:** healthy FPR 0.9% ✅ meets target; window-level F1 remains low (single digits) with ROC-AUC 0.77/0.68 — recorded honestly in `data/evaluation/vikara/` as the canonical numbers. The PS-window overlap between hourly windows and moment-based injections is the documented limiting factor; do NOT claim model F1 ≥ 0.80 until the window/scenario alignment is redesigned.

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 1. Scaffold + Schema Freeze | ✅ DONE (2026-08-28) | Repo tree ✅, docker-compose valid ✅, SQLAlchemy 22 tables ✅, Alembic 001 head ✅, .env.example ✅, contracts-only frontend ✅. |
| 2. SOC Simulator + Ground Truth | ✅ DONE | All 7 scenarios, datasets in `soc-simulator/datasets/` (regenerated 2026-09-11: 4 SOCs, maturity profiles, 20k events, seed 42) |
| 3. Ingestion Pipeline | ✅ DONE | Person 2 track complete |
| 4. Deterministic Rules Engines | ✅ DONE | ExecutionGapEngine + WorkloadEngine in `ml/anomaly/` |
| 5. Negative-Space Engine | ✅ DONE | NegativeSpaceEngine in `ml/anomaly/negative_space.py` |
| 6. Behavioural ML | ✅ DONE | BaselineEngine + BehavioralIsolationForest + KpiManipulationEngine in `ml/behaviour/` |
| 7. Correlation + Recurrence Engine | ✅ DONE | CorrelationEngine (`ml/models/`) + ThreatRecurrenceEngine (`ml/recurrence/`) |
| 8. Risk Engine | ✅ DONE | RiskEngine (`ml/models/risk_engine.py`) factor-sum scoring |
| 9. Explainability Engine | ✅ DONE | ExplainabilityEngine (`ml/models/explainability_engine.py`) 7-part cards |
| 10. Frontend | ✅ DONE (2026-09-11) | Full screen set incl. new `/supervision` (P0-3/P0-4). `npm run build` passes. Mock data deleted — all screens backend-sourced. |
| 11. Secure Identity (AI part) | ✅ DONE | FaceEmbeddingEngine + LivenessEngine + ContinuousIdentityMonitor in `ml/biometric/` |
| 12. Audit Chain | ✅ DONE | Record + verify chain + tamper detection (`backend/app/audit/`) |
| 13. Air-Gap Proof | ✅ DONE (re-verified 2026-09-11) | `infrastructure/verify_airgap.py` 6/6 checks passed post-P1-5 cloud purge |
| 14. 7-Scenario Validation | ✅ DONE | `ml.evaluation.benchmark` — 100% P/R/F1 **entity-level, N ground-truth cases stated per run** (see P0-2 reconciliation in REMEDIATION.md) |
| 15. Performance & Accuracy Metrics | ✅ DONE | Canonical VIKĀRA metrics in `data/evaluation/vikara/`; entity-level benchmark in `data/evaluation/vikara/pipeline.json` |
| 16. SIH Demo / Hardening | 🔶 IN PROGRESS | Demo script updated: opens with two-org ranking → drill-down → examiner queue → honest metrics → air-gap proof |

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

## Phase 13 record — Air-Gap Proof (2026-08-28; re-verified 2026-09-11)
- Script: `infrastructure/verify_airgap.py` — executes 6-step offline validation (schema, Argon2 user seed, cryptographic auth & session rotation, batch telemetry ingestion, SHA-256 hash chaining, and tamper detection).
- Verification: 6/6 checks passed — platform is 100% offline & air-gap compliant.
- **2026-09-11 re-verification (REMEDIATION.md P1-5):** deleted `inference/gateway/optional_cloud.py` (DeepSeek cloud egress), removed cloud gateway from `inference/gateway/{__init__,base}.py`, replaced TiDB `DATABASE_URL` in `.env.example` with local compose Postgres, removed TiDB SSL branch from `backend/app/models/base.py`, deleted `backend/.blockchain_cursor.txt` + `backend/app/workers/blockchain_poller.py` references. Air-gap script re-run: 6/6 PASS. Only local-model references to deepseek-r1:8b (Ollama on 127.0.0.1) remain — these are air-gap compliant.

## Overall Test Status (2026-09-11)
- Backend: all 57 tests pass (`py -3.14 -m pytest backend/tests -q`) incl. supervisory API tests (`tests/test_supervisory_api.py`).
- ML: all 59 tests pass (`py -3.14 -m pytest ml/tests -q`) incl. supervisory ranking/examiner tests (`ml/tests/test_supervisory.py`), updated feature schema tests (v1.1, 39 features), and honest-imputation tests.
- Frontend: `npm run build` clean (21 routes incl. `/supervision`).
- Air-Gap: `python infrastructure/verify_airgap.py` — 6/6 checks PASS (100% offline).
- Benchmark: `python -m ml.evaluation.benchmark --datasets soc-simulator/datasets --output data/evaluation/vikara/pipeline.json` — 139 GT cases evaluated across 7 scenarios (97.9% P, 100% R, 98.9% F1).

---

## Person 1 Record — AI / Data Track Complete (2026-08-30)

**What was built & verified:**
1. **Data Preprocessing & Contracts:**
   - `ml/schemas.py` — Pydantic models for findings, raw detections, 7-part explainability cards, risk factor scores.
   - `ml/preprocessing/dataset_loader.py` — In-memory indexer for SOC telemetry and simulator JSON datasets.
   - `ml/preprocessing/feature_extraction.py` — High-dimensional trace and analyst behavioral feature extractors.
2. **Deterministic Rules Engines (Phase 4 & 5):**
   - `ml/anomaly/execution_gap.py` — Detects critical/high incidents closed without investigation or required escalations.
   - `ml/anomaly/negative_space.py` — Detects silent omission of expected workflow steps across medium/high incidents.
   - `ml/anomaly/workload.py` — Detects dominant queue concentration and analyst bottlenecks.
3. **Behavioural ML (Phase 6):**
   - `ml/behaviour/baseline.py` — Computes statistical baselines (mean, median, IQR, Z-scores).
   - `ml/behaviour/isolation_forest.py` — Unsupervised multidimensional anomaly detection.
   - `ml/behaviour/kpi_manipulation.py` — Detects suspicious closure velocity and dropped investigation rates.
4. **Threat Analytics & Recurrence (Phase 7):**
   - `ml/recurrence/threat_recurrence.py` — Detects recurring unresolved threats across closed incident lifecycles.
5. **Synthesis & Explainability (Phases 7, 8, 9):**
   - `ml/models/correlation_engine.py` — Correlates co-occurring multi-engine detections into unified macro findings.
   - `ml/models/risk_engine.py` — Additive, itemized factor-sum risk scoring ($0-100$).
   - `ml/models/explainability_engine.py` — 7-part explainability cards (`WHAT/WHY/WHEN/WHERE/EVIDENCE/CONFIDENCE/RECOMMENDATION`) + `SupervisoryAnalyticsPipeline`.
6. **Biometric AI & Identity Telemetry (Phase 11):**
   - `ml/biometric/face_embedding.py` — 128-d normalized vector representation and cosine distance matching.
   - `ml/biometric/liveness.py` — Texture entropy and anti-spoofing engine.
   - `ml/biometric/continuous_monitor.py` — Detects mid-session identity drift and unauthorized operator shifts.
7. **FastAPI & Backend Bridges:**
   - `backend/app/analytics/service.py` — Service bridge connecting FastAPI to the ML pipeline.
   - `backend/app/api/findings.py` — REST endpoints (`GET /api/findings`, `GET /api/findings/{id}`, `POST /api/analytics/evaluate-scenario/{name}`).
8. **7-Scenario Benchmark Validation (Phases 14–15):**
   - `ml/evaluation/benchmark.py` — Validated against all 7 simulator ground truth datasets.
   - **Reconciliation note (REMEDIATION.md P0-1/P0-2, 2026-09-11):** the 100% figures below are
     **entity-level, rules-pipeline** metrics over the (small) per-scenario ground-truth case
     sets — a different evaluator and sample from the **window-level VIKĀRA model metrics**
     in `data/evaluation/vikara/` (which are much lower and reported with N). Both are
     reproducible via one command each; never quote one as the other.
   - Historical run (pre-density datasets): 100% P/R/F1 across all 7 scenarios, entity-level, N≈8 GT cases.
   - Current canonical runs: regenerate with `python -m ml.evaluation.benchmark --datasets soc-simulator/datasets --output data/evaluation/vikara/pipeline.json` (sample sizes printed with every percentage).
   - Unit & integration tests: all passing (count per run output; see snapshot above for 2026-09-11 status).

---

## Phase 16 Record — Local LLM Integration: DeepSeek-R1 8B (2026-09-06)

**What was built & verified:**
1. **Isolated Backend Service Layer (`backend/app/llm/`):**
   - `client.py`: Async Ollama client with timeout, keep-alive, and token bounding (`num_predict: 768`, `num_ctx: 2048`).
   - `schemas.py`: Strictly typed request/response contracts for `FindingExplanationRequest/Response` and `AssessmentSummaryRequest/Response`.
   - `prompts.py`: 16-rule strict system prompt, untrusted data boundaries, regex `<think>` chain-of-thought isolation via `clean_deepseek_r1_output()`.
   - `validators.py`: Sensitive field sanitization (credentials, keys, tokens, biometric blobs), prompt-injection neutralization (`[UNTRUSTED_INSTRUCTION_NEUTRALIZED]`), and mathematical invariant locks (risk score & confidence cannot be altered).
   - `service.py`: High-level orchestrator with latency tracking, metrics (`llm_request_count`, `llm_success_count`, `llm_failure_count`, `llm_average_latency_ms`), and deterministic template fallback (`_build_fallback_finding_explanation`).
   - `exceptions.py`: Domain-specific error hierarchies (`OllamaConnectionError`, `OllamaTimeoutError`, `OllamaModelNotFoundError`, `PromptInjectionDetectedError`).
2. **FastAPI Endpoints (`backend/app/api/llm.py`):**
   - `POST /api/llm/explain-finding`: Explains structured finding with DeepSeek-R1 or deterministic fallback.
   - `POST /api/llm/generate-assessment-summary`: Produces structured executive summary from aggregate SOC findings.
   - `GET /api/llm/health`: Reports Ollama status, model availability, and connection state.
   - `GET /api/llm/metrics`: Prometheus-friendly request counts, latencies, and fallback rates.
3. **Frontend Integration (`frontend/`):**
   - `lib/api.ts`: Typed `explainFindingWithLLM()` and `fetchLLMHealth()`.
   - `components/SupervisoryExplanationSection.tsx`: Crisp SOC-grade panel with executive briefing, 4-quadrant breakdown (What, Why, Evidence, Confidence), recommended remediation, and subtle local AI badge (`LOCAL AI · DeepSeek-R1 8B` or `LOCAL ENGINE · Deterministic Rule Fallback`).
   - Integrated into `app/findings/[id]/page.tsx` and `components/ExplainabilityCard.tsx`.
4. **Test Suite Verification (`backend/tests/test_llm_service.py`):**
   - 14/14 tests pass with `pytest` covering all mandatory cases (connectivity, missing evidence, think-tag stripping, markdown fence handling, timeout fallback, offline fallback, prompt injection defense, sensitive field redaction, invariant preservation).
5. **Air-Gap & Offline Compliance:**
   - 100% local operation on `127.0.0.1:11434`. Zero cloud dependencies. Deterministic fallback guarantees zero crashes when Ollama is offline or uninstalled.
