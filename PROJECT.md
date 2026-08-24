# PROJECT.md — ANVĪKṢA (SAT-SA)

## Identity
- **SIH ref:** SIH26157 — Supervisory Analytics Tool for SOC Assessment (SAT-SA)
- **Org:** NTRO | **Category:** Software | **Domain:** Blockchain & Cybersecurity
- **Product name:** ANVĪKṢA — "Examine Beyond the Obvious."

## Core problem
Assess whether a SOC is **actually effective**, not just active. ANVĪKṢA sits above existing SOC tooling (SIEM/EDR/IDS/Firewall/Case Mgmt) and analyzes the operational data those systems already produce — it does not replace them.

Central question: *Is the SOC actually operating effectively, or does its activity only appear healthy from conventional metrics?*

## Core intelligence (everything built must serve one of these)
1. Execution Gap Detection — expected workflow vs actual actions
2. Negative-Space Detection — what *should* have happened but didn't
3. Behavioural Anomaly Detection — deviation from learned baselines (e.g. KPI manipulation)
4. Threat Recurrence — same threat, no effective remediation
5. Analyst Workload — imbalance, bottlenecks, single points of failure
6. Risk Scoring — always a composite, always broken into factors
7. Explainability — every finding answers WHAT / WHY / WHEN / WHERE / EVIDENCE / CONFIDENCE / RECOMMENDATION

## Security (protects supervisor access, not the core analytics)
8. Secure Supervisor Authentication — biometric (camera baseline, optional LiDAR/3D enhanced mode)
9. Device Verification — device trust binding
10. Short-lived Session Credentials — bound to User+Device+Session+Role+Timestamp+Permissions, rotating, continuous re-verification
11. Audit Integrity — append-only, hash-chained (local tamper-evident ledger, not public blockchain)

## Deployment constraint
Fully offline / air-gapped. No cloud APIs, no external LLM APIs, no cloud DB, no internet auth. This must be visibly demonstrable in the UI (a persistent LOCAL/OFFLINE status indicator) and in the SIH demo itself.

## Non-negotiable design rule
> Every important number leads to an explanation. Every finding leads to evidence. Every risk leads to an actionable investigation.

## Recommended architecture (data flow)
```
SOC tools → Data Ingestion → Normalization → SOC Knowledge Model
  → [Execution Gap | Negative Space | Behavioural Anomaly] Engines
  → Correlation Engine → Risk Engine → Explainability Engine
  → Findings → SOC Command Centre → Supervisor → Audit Trail
```
Hybrid AI: deterministic **rules** for workflow violations + **ML** (Isolation Forest / LOF / DBSCAN / statistical baselines / time-series) for behavioural anomalies. Optional local LLM (Ollama/llama.cpp) only for natural-language explanation/report text — never the sole source of a security decision.

## Tech stack (target)
- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts/ECharts, Lucide React, WebSockets
- **Backend:** Python 3.12+, FastAPI, Pydantic, SQLAlchemy, Alembic, Uvicorn
- **AI/ML:** scikit-learn, PyTorch, NumPy, Pandas, SciPy
- **DB:** PostgreSQL (primary) + Redis (cache/session/event queue)
- **Security:** TLS 1.3, AES-256-GCM, Argon2id, RBAC, hash-chained audit log
- **Deploy target:** Fedora Linux + Docker (all services local); Kali Linux for separate security testing

## Core DB entities
users, biometric_profiles, devices, sessions, alerts, incidents, investigations, escalations, findings, risk_assessments, audit_logs

## Primary SIH demo flow (this is the story to protect above all else)
```
Secure Login → Identity/Device Verification → SOC Overview
→ Hidden SOC Failure surfaces as a Critical Finding → Finding Detail
→ WHY? → Evidence → Risk Breakdown → Recommendation
→ Open Investigation → Case Update → Audit Log
```
Secondary flow: Overview → Analytics → Negative Space → Expected vs Actual → Affected Cases → Evidence

## Reference files
- `Phases.md` — build order, one phase at a time
- `Design.md` — visual system (colors, type, layout rules)
- `Memory.md` — created once coding starts; running log of what's done, so context survives across chats
