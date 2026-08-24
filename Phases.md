# Phases.md — ANVĪKṢA Build Order

Rule: build and verify one phase before starting the next. Each phase should leave the app in a runnable state. Update `Memory.md` at the end of every phase.

Build order (merged, frozen):

```
1. Scaffold + Schema Freeze → 2. SOC Simulator + Ground Truth → 3. Ingestion Pipeline
→ 4. Deterministic Rules Engines → 5. Negative-Space Engine → 6. Behavioural ML
→ 7. Correlation Engine → 8. Risk Engine → 9. Explainability Engine
→ 10. Frontend (5 core screens) → 11. Secure Identity → 12. Audit Chain
→ 13. Air-Gap Proof → 14. 7-Scenario Validation → 15. Performance + Accuracy Metrics
→ 16. SIH Demo / Hardening
```

## Phase 1 — Scaffold + Schema Freeze
- Repo structure per Architecture.md §10: frontend/, backend/, ml/, simulator/, biometric/, database/, infrastructure/, docs/
- Docker Compose: Postgres + Redis + FastAPI + Next.js, all local
- Lock the DB schema: users, biometric_profiles, devices, sessions, alerts, incidents, investigations, escalations, findings, risk_assessments, audit_logs (+ socs/analysts/assets/events/threats/recommendations as needed)
- Define detection scenarios to support; contracts only — no UI work
- `.env` conventions, no cloud dependencies anywhere

## Phase 2 — SOC Simulator + Ground Truth
- Python service generating realistic alerts, events, incidents, investigations, escalations, analyst actions, assets, threats
- Ground-truth labels generated alongside each injected anomaly (needed for precision/recall later)
- Must generate a "healthy SOC" run and an "unhealthy SOC" run on demand
- Scenario switches so each of the 7 PRD §9 scenarios can be turned on/off

## Phase 3 — Ingestion Pipeline
- POST /api/events | /alerts | /incidents | /investigations | /escalations
- Validation → normalization (timestamps, severity, entity mapping) → correlation IDs → persist into PostgreSQL
- Plumbing only — must handle thousands of synthetic records; no analytics logic yet

## Phase 4 — Deterministic Rules Engines
- Execution Gap Engine (investigation_required and not investigation_exists)
- Missing escalation rule (critical incident without escalation record)
- Closure-without-investigation rule
- Workload engine (deterministic distribution stats first)
- Provable rules before any ML — this yields a working product extremely early

## Phase 5 — Negative-Space Engine
- Workflow expectation model (CRITICAL: triage → investigation → escalation → response → closure)
- Expected vs Actual comparison → missing_actions, missing_rate, severity, confidence
- The product's primary differentiator

## Phase 6 — Behavioural ML
- Historical metrics: closure time, investigation duration, escalation rate, alerts/critical cases per analyst
- Baselines via statistical z-scores, rolling averages; then Isolation Forest / LOF
- Evaluate against Phase 2 ground truth (precision/recall/F1)

## Phase 7 — Correlation Engine
- Link related outputs (execution gap + negative space + closure anomaly + escalation decline) into one coherent Finding
- "Potential SOC process failure" instead of four unrelated alerts

## Phase 8 — Risk Engine
- Risk = severity + evidence strength + behavioural deviation + recurrence + confidence + historical context
- Output always stores the individual contributing factors — never a bare number

## Phase 9 — Explainability Engine
- Every finding auto-explains WHY with baseline-vs-observed numbers, affected scope, evidence — no LLM required
- Only after this works: optional local LLM to phrase structured evidence as natural language (never a decision source)

## Phase 10 — Frontend — 5 Core Screens
- Secure Login · Command Centre · Findings · Finding Detail · Analytics
- Get the flow working: Login → Command Centre → Critical Finding → Finding Detail → Evidence → Recommendation
- Follow Design.md visual system; offline status indicator from day one

## Phase 11 — Secure Identity
- Start simple: username/role → device verification → session
- Then face: camera → face detection → embedding → verification (Baseline Mode must fully work without LiDAR)
- Optional LiDAR = Enhanced Mode enhancement, never the foundation
- Short-lived rotating session credentials (user+device+session+role+timestamp+permissions), revocation, continuous verification → session lock

## Phase 12 — Audit Chain
- Privileged actions audited: LOGIN, VIEW_FINDING, VIEW_EVIDENCE, OPEN_CASE, UPDATE_CASE, EXPORT_EVIDENCE, LOGOUT
- Hash chain: hash_n = H(record_n + hash_{n-1}), append-only, verify-chain operation reporting first broken link
- No blockchain — local hash-chain only (Rules.md §7)

## Phase 13 — Air-Gap Proof
- Deliberate milestone: internet OFF → ANVĪKṢA still works
- Docker Compose: frontend, backend, postgres, redis, ml-service, optional local-llm
- No OpenAI/Gemini APIs, no cloud DB, no cloud auth, no cloud LLM
- Offline state visible in UI (Design.md status drawer), demonstrable live

## Phase 14 — 7-Scenario Validation
Run the full system against PRD §9 ground truth:
Healthy SOC · Investigation gap · Negative space · KPI manipulation · Analyst overload · Recurring unresolved threat · Identity anomaly
- Simulator scenario toggles on/off; correct detection required for all seven

## Phase 15 — Performance + Accuracy Metrics
- Per-scenario precision/recall/F1 (e.g. Execution Gap P≥90%, R≥85%, F1≥87%) and detection latency
- Dataset scaling, event throughput, dashboard latency under load
- These become part of the SIH presentation — measured, not claimed

## Phase 16 — SIH Demo / Hardening
- Scripted demo: healthy-looking SOC → hidden failure → detection → evidence → risk breakdown → recommendation → secure supervisor access → audit trail
- Rehearse the air-gapped proof point explicitly (judges should see it, not be told about it)
- Security testing pass (auth bypass, API fuzzing, session hijack attempts) before final rehearsal

---

## First MVP definition
Simulator generates ~10,000 events → FastAPI ingestion → PostgreSQL → Execution Gap + Negative-Space engines → Risk score → Next.js Command Centre → Finding Detail + Evidence.
Then layer on: behavioural ML, correlation, recurrence, workload, identity, audit chain, LiDAR, local LLM.

**One major rule:** do not start with LiDAR, face recognition, blockchain, or the dashboard. Start with: *can ANVĪKṢA correctly identify a hidden weakness in a simulated SOC?* Once that answer is yes, everything else is engineering around a working core.

## If time runs out — minimum wireframe/demo priority
1. Secure Login
2. SOC Command Centre / Overview
3. Critical Finding Detail
4. Execution Gap view
5. Negative Space view
6. Behavioural Anomaly view
7. Evidence Explorer
8. Risk Breakdown
9. Case Investigation
10. Audit Log
