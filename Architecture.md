# Architecture.md — ANVĪKṢA (SAT-SA)

This document defines system architecture, data flow, data model, technology stack, repository layout, and deployment. Read alongside `PRD.md` (what/why) and `Rules.md` (boundaries). Build order in `Phases.md` follows this architecture layer by layer.

---

## 1. System Position

ANVĪKṢA does not sit inside the SOC's detection path — it sits **above** existing tooling as a supervisory layer that reads operational data and reasons about it.

```
EXISTING SOC (unchanged)
SIEM | EDR | IDS/IPS | Firewall | Case Management | Threat Intel
                    |
                    v
          SAT-SA DATA LAYER (ingest + normalize)
                    |
                    v
          SUPERVISORY ANALYTICS (5 engines)
                    |
                    v
               RISK ENGINE
                    |
                    v
          EXPLAINABLE FINDINGS
                    |
                    v
             SOC SUPERVISOR (via Command Centre)
```

---

## 2. Full Layered Architecture

```
+----------------------------------------------------------------+
|                         EXISTING SOC                           |
|  SIEM | EDR | IDS/IPS | Firewall | Case Mgmt | Threat Intel    |
+---------------------------------+--------------------------------+
                                  |
                                  v
+----------------------------------------------------------------+
|                     DATA INGESTION LAYER                       |
|  APIs | Syslog | JSON | CSV | Log Streams | SOC Connectors     |
+---------------------------------+--------------------------------+
                                  |
                                  v
+----------------------------------------------------------------+
|                     DATA NORMALIZATION                         |
|  Cleaning | Deduplication | Timestamp Normalization | Severity |
|  Standardization | Entity Mapping | Correlation IDs            |
+---------------------------------+--------------------------------+
                                  |
                                  v
+----------------------------------------------------------------+
|                    SOC KNOWLEDGE MODEL                         |
|  Alerts -> Events -> Incidents -> Investigations -> Escalations|
|              |            |             |                      |
|              +------------+-------------+                      |
|                           |                                    |
|                Analysts / Assets / Threats                     |
+---------------------------------+--------------------------------+
                                  |
                                  v
+----------------------------------------------------------------+
|                       ANALYTICS ENGINE                         |
+---------+------------------+------------------+----------------+
          |                  |                  |
          v                  v                  v
   Execution Gap      Negative Space      Behavioural Anomaly
      Engine              Engine                Engine
          |                  |                  |
          +------------------+------------------+
                             |
                             v
                     CORRELATION ENGINE
                             |
                             v
                        RISK ENGINE
                             |
                             v
                  EXPLAINABILITY ENGINE
                             |
                             v
+----------------------------------------------------------------+
|                        SAT-SA CORE                              |
|  SOC Health | Risk | Findings | Benchmarking | Recommendations  |
+---------------------------------+--------------------------------+
                                  |
                                  v
+----------------------------------------------------------------+
|                    SOC COMMAND CENTRE (frontend)                |
|  Overview | Findings | Analytics | Cases | Evidence | Reports   |
+---------------------------------+--------------------------------+
                                  |
                                  v
                          SOC SUPERVISOR
```

A parallel **Identity & Secure Access Layer** (§4) gates every entry into the Command Centre and every privileged action, independent of the analytics pipeline above.

---

## 3. Hybrid AI Architecture

The system must **never** rely on a single generic model. Three layers, in order of authority:

```
                    SOC DATA
                       |
            +----------+----------+
            |                     |
          RULES                 ML/AI
            |                     |
            |          +----------+----------+
            |          |          |          |
            |       Anomaly    Behaviour   Pattern
            |        Model       Model      Model
            |          |          |          |
            +----------+----------+----------+
                       |
                       v
               CORRELATION ENGINE
                       |
                       v
                   RISK ENGINE
                       |
                       v
              EXPLAINABILITY LAYER
```

- **Rules** — deterministic workflow-violation checks (e.g., "critical alert closed with zero investigation records" is a rule, not a model output). Rules are the first line of detection and the easiest to explain.
- **ML/AI** — statistical baselines and anomaly models for things that don't have a clean rule (Isolation Forest / Local Outlier Factor / DBSCAN / time-series baselines / classification / graph-based correlation).
- **Optional local LLM** — natural-language explanation and report generation only. It **never** makes a security decision or contributes to a risk score. See `Rules.md` §3 for the hard boundary.

---

## 4. Analytics Engines (detail)

| Engine | Inputs | Output |
|---|---|---|
| **Execution Gap** | Alert severity, expected workflow, actual actions, investigation/escalation records, response timestamps | Execution gap, severity, missing actions, affected cases, confidence |
| **Negative-Space** | Expected actions, actual actions, workflow transitions, time windows, historical baselines | Missing expected behaviour, severity, confidence, evidence |
| **Behavioural Anomaly** | Historical analyst activity, closure time, escalation frequency, investigation duration, workload, severity distribution | Behavioural deviation, baseline, observed value, deviation, confidence |
| **Recurrence** | Threat history per asset/incident | Recurring threat, potential root-cause failure, affected assets, historical frequency, risk |
| **Workload** | Cases per analyst, critical cases per analyst, avg. investigation duration, queue length | Assignment imbalance, bottlenecks, capacity view |

All five engines feed the **Correlation Engine**, which links related outputs (e.g., an execution gap and a negative-space anomaly on the same incident cluster) into a single coherent **Finding** before scoring.

---

## 5. Risk Engine

A finding's score is the explicit sum of weighted, named factors — never an opaque number:

```
Risk = Severity + Evidence Strength + Behavioural Deviation
     + Historical Context + Recurrence + Confidence

SOC RISK: 91/100 — CRITICAL
Investigation Gap    +31
Escalation Anomaly   +24
Negative Space        +18
Closure Anomaly       +11
Repeated Threats       +7
```

The exact weighting formula is finalized during implementation/validation against the simulator's ground truth (Phase 5–6), but the **factor-based, additive, always-visible structure is a fixed requirement**, not an implementation detail.

## 6. Explainability Engine

Every finding surfaced to a supervisor must answer all seven of these — this is a hard interface contract between the analytics pipeline and the frontend, not a nice-to-have:

**WHAT** was detected · **WHY** is it abnormal (baseline vs observed) · **WHEN** did it occur · **WHERE** (SOC/asset/analyst/workflow) · **EVIDENCE** supporting it · **CONFIDENCE** · **RECOMMENDATION** for the supervisor.

---

## 7. Identity & Secure Access Layer

Independent subsystem protecting privileged supervisor actions. Not part of the SOC analytics pipeline.

```
SUPERVISOR
   |
Login Request
   |
Camera (+ optional LiDAR, enhanced 3D mode)
   |
Facial / 3D Feature Extraction
   |
Feature → Protected Biometric Representation (embedding, encrypted at rest)
   |
Identity Verification --NO MATCH--> DENY + audit event
   | MATCH
Device Verification --NO--> DENY + audit event
   | YES
Risk / Context Check
   |
Session Established
   |
Short-Lived Session Credential issued (bound to User+Device+Session+Role+Timestamp+Permissions)
   |
ANVĪKṢA Access
   |
Continuous Identity Verification (periodic, background)
   +-- MATCH --> Renew credential
   +-- MISMATCH --> Freeze sensitive ops --> Session locked --> Re-authentication required
```

**Design rules for this layer** (enforced in `Rules.md`):
- Never store or transmit a raw/plaintext biometric template. Only an encrypted, protected embedding.
- The biometric representation and the session credential are cryptographically **separate artifacts**. The credential is derived from session context, not from the biometric itself.
- LiDAR is Enhanced Mode only (Camera + LiDAR → 2D + depth → 3D representation). Baseline Mode (camera only → facial features) must fully work without it.
- Every deny, mismatch, session lock, and privileged action produces an audit event.

---

## 8. Data Model

### 8.1 Core entity relationships

```
User — Role — Device — Session — AuditLog

SOC — Analyst — Asset — Alert — Event — Incident — Investigation
    — Escalation — Threat — Finding — RiskAssessment — Recommendation
```

### 8.2 Recommended database tables

| Table | Key columns |
|---|---|
| `users` | id, name, role, status, created_at |
| `biometric_profiles` | id, user_id, protected_template, encryption_key_reference, created_at, updated_at |
| `devices` | id, device_identifier, user_id, trust_status, last_seen |
| `sessions` | id, user_id, device_id, session_status, issued_at, expires_at, last_verified_at |
| `alerts` | id, source, severity, timestamp, asset_id, status, analyst_id |
| `incidents` | id, alert_id, severity, status, created_at, closed_at |
| `investigations` | id, incident_id, analyst_id, started_at, completed_at, status, evidence_count |
| `escalations` | id, incident_id, analyst_id, target, timestamp, status |
| `findings` | id, type, severity, confidence, description, evidence, created_at |
| `risk_assessments` | id, finding_id, score, severity, factors, calculated_at |
| `audit_logs` | id, user_id, session_id, action, resource, timestamp, device_id, identity_status |

`biometric_profiles.protected_template` is always encrypted at rest (AES-256-GCM); never store or log a raw template.

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts or Apache ECharts |
| Icons | Lucide React |
| Real-time | WebSockets |
| Backend | Python 3.12+ / FastAPI |
| API validation | Pydantic |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Server | Uvicorn |
| Database | PostgreSQL |
| Cache / event queue / session state | Redis |
| ML | scikit-learn + PyTorch |
| Data processing | Pandas + NumPy + SciPy |
| Optional local LLM (explanation/reports only) | Ollama / llama.cpp |
| Authentication | FastAPI security utilities + RBAC |
| Password hashing | Argon2id |
| Encryption | AES-256-GCM |
| Transport security | TLS 1.3 |
| Audit integrity | Hash chain (optional local permissioned ledger, not public blockchain) |
| Biometrics | Face embedding + optional LiDAR/depth |
| Containers | Docker + Docker Compose |
| OS (dev/deploy) | Fedora / Linux recommended; Windows OK as desktop OS |
| Security testing | Kali Linux (isolated, separate machine — never the dev environment) |
| Backend/API testing | Pytest, HTTPX |
| E2E testing | Playwright |
| Frontend testing | Vitest |
| Monitoring (optional) | Prometheus + Grafana |
| Version control | Git + GitHub |

At prototype scale, avoid Kafka/Redpanda/Spark — Pandas/NumPy + Python async processing is sufficient. Only reconsider distributed processing if a genuine scale requirement emerges (see `Rules.md` §2).

---

## 10. Repository Structure

```
sat-sa/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── findings/
│   │   ├── analytics/
│   │   ├── cases/
│   │   ├── evidence/
│   │   └── authentication/
│   ├── lib/
│   ├── hooks/
│   └── types/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── security/
│   │   ├── ingestion/
│   │   ├── analytics/
│   │   ├── findings/
│   │   ├── risk/
│   │   ├── audit/
│   │   └── auth/
│   └── tests/
│
├── ml/
│   ├── preprocessing/
│   ├── anomaly/
│   ├── behaviour/
│   ├── recurrence/
│   ├── models/
│   └── evaluation/
│
├── simulator/
│   ├── scenarios/
│   ├── generators/
│   ├── attack-simulation/
│   └── ground-truth/
│
├── biometric/
│   ├── enrollment/
│   ├── verification/
│   ├── liveness/
│   └── lidar/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── infrastructure/
│   ├── docker/
│   ├── compose/
│   └── tls/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   └── testing/
│
└── README.md
```

---

## 11. Deployment Architecture

```
Fedora Linux (host)
   └── Docker
        ├── Next.js (frontend)
        ├── FastAPI (backend)
        ├── PostgreSQL
        ├── Redis
        ├── AI/ML Services
        └── Local LLM (optional)
```

- Windows can remain the primary desktop OS for development; Docker Compose handles the actual runtime.
- **Kali Linux** is used exclusively as a separate, isolated attacker machine for security testing — never for hosting SAT-SA itself.

```
                TEST MACHINE
                     |
        +------------+------------+
        |                         |
   Fedora Linux               Kali Linux
        |                         |
   SAT-SA Server              Attacker
        |                         |
        +------------+------------+
                     |
                Isolated Network
```

- The runtime must be demonstrably offline: `Runtime Mode: AIR-GAPPED`, `Internet Connectivity: DISABLED`, `AI Inference: LOCAL`, `Database: LOCAL`, `Authentication: LOCAL`, `Audit: LOCAL`, `External APIs: NONE`. This is a UI element (status indicator + drawer), not just a backend property — see `Design.md`.

---

## 12. End-to-End Data Flow

```
SOC Event → Alert Generated → Data Ingestion → Normalization → SOC Knowledge Model
   → [Expected Workflow] vs [Actual Workflow] → Behaviour Comparison
   → Normal | Gap | Anomaly → Correlation Engine → Risk Engine
   → Evidence Collection → Explainability Engine → SOC Finding → Supervisor
   → Investigate | Dismiss → Case Update → Audit Trail
```

## 13. SOC Simulation Environment (test harness)

A controlled simulator is a first-class architectural component, not an afterthought — the detection engines cannot be validated without it.

```
SOC SIMULATOR
   ├── Normal Scenario
   ├── Attack Scenario
   └── Failure Scenario
        |
        v
   SOC Telemetry → SAT-SA → AI Detection → Ground Truth Check
        → Precision / Recall / F1
```

It must be able to generate the seven scenarios listed in `PRD.md` §9 with known ground truth, so detection quality is measured, not assumed.

---

## 14. Final Architecture Principle

Build in this order — this is the load-bearing sequencing decision for the whole project, expanded task-by-task in `Phases.md`:

```
Problem Statement → Requirements → Data Model → SOC Simulator → Data Pipeline
→ Detection Engines → AI/ML → Risk + Explainability → Secure Identity
→ Dashboard → Testing → SIH Demonstration
```

> **Build the intelligence engine before polishing the interface.** A beautiful dashboard with weak detection will not win. Reliable, explainable detection of hidden SOC weaknesses is the entire value proposition.
