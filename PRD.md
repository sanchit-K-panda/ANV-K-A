# PRD.md — ANVĪKṢA (SAT-SA)
### Supervisory Analytics Tool for SOC Assessment
**SIH Reference:** SAT-SA · SIH26157 · Problem Statement: Supervisory Analytics Tool for SOC Assessment
**Organization:** National Technical Research Organisation (NTRO)
**Category:** Software · **Domain:** Blockchain & Cybersecurity
**Tagline:** *Examine Beyond the Obvious.*

---

## 1. What We Are Building

ANVĪKṢA is an offline-capable, AI-powered **supervisory intelligence platform** that assesses the actual operational effectiveness of a Security Operations Centre (SOC).

It does **not** replace a SIEM, EDR, IDS/IPS, firewall, or incident-management platform. It sits **above** existing SOC tooling and analyzes the operational data those systems already produce (alerts, incidents, investigations, escalations, analyst actions, assets, threat intel, authentication activity).

The single question the product answers:

> **"Is the SOC actually operating effectively, or does its activity only appear healthy from conventional metrics?"**

A SOC can process 96% of alerts and still be failing — if investigations aren't happening, escalations are being skipped, or closures are suspiciously fast. ANVĪKṢA is built to catch exactly that gap between *looks busy* and *is effective*.

---

## 2. Target Users

| Persona | Role | What they need from ANVĪKṢA |
|---|---|---|
| **SOC Supervisor** (primary) | Oversees SOC operations, accountable for effectiveness | A single screen answering "what's wrong, how bad, why, what do I do" — with evidence, not just a number |
| **CISO / SOC Manager** (secondary) | Consumes reports, makes resourcing/process decisions | Executive summaries, risk trends, analyst workload reports |
| **Security Analyst** (secondary, read-limited) | Subject of workload/behaviour analytics | Fair, explainable findings — not a black-box performance score |
| **SIH Judges / NTRO Evaluators** (demo audience) | Assess technical merit and real-world applicability | A clear, evidence-driven demo story showing detection of a hidden SOC failure |

---

## 3. Problem Statement

Traditional SOC dashboards report **activity**: alert counts, MTTD, MTTR, closed cases, analyst workload. Activity does not equal **effectiveness**.

Example of the gap this product targets:

```
1,000 alerts received → 980 closed → 96% processing rate   (looks great)

but underneath:
100 Critical alerts
  → 83 closed unusually quickly
  → only 9 have investigation records
  → only 4 escalations
  → 17 are recurring/unresolved threats           (actually critical)
```

A conventional dashboard shows the top line. ANVĪKṢA is built to surface the second block automatically, with evidence.

---

## 4. Core Differentiators

These six capabilities are the product's reason to exist. Every other feature supports one of them.

### 4.1 Execution Gap Detection
Compares the **expected** SOC workflow (Alert → Triage → Investigation → Escalation → Resolution) against what **actually happened**, and reports missing steps with evidence.

### 4.2 Negative-Space Detection
The product's primary differentiator. Instead of asking "what happened," it asks **"what should have happened but didn't?"** — e.g., expected 80 investigations, observed 17; expected 30 escalations, observed 2.

### 4.3 Behavioural Anomaly Detection
Establishes baselines (closure time, investigation duration, escalation rate, workload, severity distribution) and flags deviation — including potential **KPI manipulation** (e.g., closure time drops from 35–50 min to 3–5 min while investigation evidence and escalations both drop).

### 4.4 Recurring Threat Analysis
Identifies threats that keep reappearing without effective remediation — a signal of systemic response failure, not just "one more alert."

### 4.5 Analyst Workload Analysis
Detects abnormal workload concentration (e.g., one analyst carrying 72% of critical cases) — surfacing overload, under-utilization, bottlenecks, and single points of operational failure.

### 4.6 Explainable Risk Scoring
The system must never output an unexplained number. Every risk score is a sum of named, weighted contributing factors:

```
SOC RISK: 91 / 100 — CRITICAL
Investigation Gap   +31
Escalation Anomaly  +24
Negative Space       +18
Closure Anomaly      +11
Repeated Threats      +7
```

---

## 5. Goals

- Ingest normalized SOC telemetry (alerts, incidents, investigations, escalations, analyst actions, assets, threat intel, auth activity) and build a unified SOC Knowledge Model.
- Run five analytics engines (Execution Gap, Negative-Space, Behavioural Anomaly, Recurrence, Workload) against that model using a **hybrid** rules + ML approach.
- Correlate engine outputs into a single, explainable **Finding**, scored by a transparent **Risk Engine**, and rendered by an **Explainability Engine** that always answers What / Why / When / Where / Evidence / Confidence / Recommendation.
- Present findings through a dense, evidence-first **SOC Command Centre** web interface.
- Protect supervisor access with a biometric + device + continuous-verification identity layer, and record every privileged action in a tamper-evident audit trail.
- Run entirely **offline / air-gapped** — no cloud APIs, no external LLM calls, no cloud database, no internet-dependent authentication.
- Prove detection quality quantitatively (precision/recall/F1) against a SOC Simulator with known ground truth across seven core scenarios.

## 6. Non-Goals (What We Should NOT Build)

Avoid feature creep. Explicitly out of scope:

- A replacement SIEM, EDR, or firewall.
- A generic cybersecurity chatbot.
- A generic "AI predicts cyberattacks" system.
- Blockchain for its own sake — only a concrete tamper-evident audit mechanism (hash-chain), not a public/permissionless blockchain.
- Face recognition unrelated to SOC supervisor security (no general-purpose biometric surveillance).
- Hardware integrated purely for demo spectacle (e.g., LiDAR must degrade gracefully — it's an enhancement, never a hard dependency).

**Litmus test for any new feature:** it must support SOC supervision, assessment, security, evidence, or decision-making. If it doesn't, it doesn't ship.

---

## 7. Feature Inventory

### 7.1 Core Platform
SOC Command Centre · SOC Health Score · Live SOC Status · Critical Findings / Active Anomalies / Execution Gap / Negative-Space / Behaviour Anomaly / Threat Recurrence counters · SOC Performance Overview (Detection / Investigation / Escalation / Response) · Historical SOC Trends

### 7.2 Supervisory Intelligence Engines
Execution Gap Engine · Negative-Space Engine · Behavioural Anomaly Engine · Threat Recurrence Engine · Analyst Workload Engine · Correlation Engine · Risk Engine · Explainability Engine · Recommendation Engine · SOC Baseline Engine

### 7.3 Findings
Findings Centre (filterable table) · Severity (Critical/High/Medium/Low) · Confidence Score · Finding Timeline · Evidence · Affected Assets/Analysts · Related Incidents/Alerts · Recommended Action · Finding Status · Investigation Assignment

### 7.4 Execution Gap & Negative Space
Expected vs. Actual workflow view · Missing-action detection · Investigation/Escalation/Response gap detection · Closure-without-investigation detection · Negative-space confidence and timeline

### 7.5 Behaviour, Threat & Workforce Analytics
SOC/analyst behaviour baselines · Closure-time, investigation-time, escalation-rate, severity-distribution analysis · Behavioural deviation score · KPI manipulation detection · Recurring threat detection with frequency/history/timeline · Threat-to-incident/asset correlation · Analyst workload, critical-case distribution, bottleneck detection, SOC capacity view

### 7.6 Alert / Incident / Investigation / Case Management
Alert Explorer · Incident Explorer · Investigation Explorer · Case Management · timelines, status, assignment, evidence, notes, activity history, resolution, related findings/threats

### 7.7 Evidence & Risk
Evidence Explorer with correlated timeline · Baseline comparison · Risk factor breakdown · Detection reasoning · Confidence and recommendation explanation · SOC/Finding risk score, trend, prioritization · Critical Risk Queue

### 7.8 Secure Identity & Access
Biometric supervisor login (face, optional LiDAR/depth) · Liveness check · Device verification · Role-based access control · Session verification · Continuous identity verification · Short-lived rotating session credential · Session lock on mismatch · Authentication audit and session history

### 7.9 Audit & Integrity
Append-only audit log (auth, admin, finding/case/evidence/session events) · Hash-chained integrity · Tamper detection · Audit search and timeline

### 7.10 Offline / Air-Gapped Operation
Fully local runtime: local Postgres, local Redis, local ML inference, optional local LLM, local auth, local audit, local SOC simulator, local WebSocket comms. **No cloud runtime dependency of any kind.**

### 7.11 Data Ingestion
JSON / CSV / Syslog / REST API ingestion · SIEM/EDR/IDS-IPS/Firewall/Case-management adapters · Deduplication, timestamp/severity normalization, entity mapping, correlation-ID management

### 7.12 Reports
SOC Assessment Report · Executive Summary · Risk Summary · Critical Findings Summary · Performance Summary · Threat Summary · Analyst Workload Summary · Evidence Appendix · Recommendation Summary · Audit Summary · Offline export (PDF/CSV/JSON)

### 7.13 SOC Simulation & Testing
Scenario manager · Healthy SOC / Investigation Gap / Negative-Space / KPI Manipulation / Analyst Overload / Recurring Threat / Identity Anomaly scenarios · Synthetic generators · Ground-truth dataset · Precision/Recall/F1 evaluation

---

## 8. Primary User Flows

### 8.1 Investigation Flow (main product loop)
```
Finding generated → Supervisor notified → Open Finding → View Evidence
(Timeline, Related Alerts/Incidents, Analyst Actions, Baseline Comparison, Risk Factors)
→ Review Recommendation → Open Investigation → Take Action → Record Result → Audit Trail
```

### 8.2 Secure Access Flow
```
Login → Face/Optional LiDAR capture → Liveness check → Identity verification
→ [NO MATCH → Deny + audit event]
→ Device verification → Risk/context check → Session created → Short-lived credential issued
→ Dashboard access → Continuous identity verification in background
→ [Mismatch → Freeze sensitive ops → Session locked → Re-authentication required]
```

### 8.3 Secondary Analytics Flow
```
Command Centre → Analytics → Negative Space → Expected vs Actual → Affected Cases → Evidence
```

---

## 9. Acceptance Criteria — Seven Core Testing Scenarios

The product is considered functionally complete for MVP once it correctly detects all seven scenarios below when run against the SOC Simulator:

| # | Scenario | Injected condition | Expected detection |
|---|---|---|---|
| 1 | Healthy SOC | Normal operations | No major findings |
| 2 | Investigation Gap | Critical alerts + missing investigations | Execution Gap finding |
| 3 | Negative Space | Expected escalations disappear | Negative-Space finding |
| 4 | KPI Manipulation | Very fast closure + reduced investigation/escalation evidence | Behavioural Anomaly finding |
| 5 | Analyst Overload | One analyst gets disproportionate critical cases | Workload Anomaly finding |
| 6 | Repeated Threat | Same threat recurs without remediation | Recurrence finding |
| 7 | Identity Anomaly | Supervisor leaves, another person attempts access | Identity Mismatch → Session Lock → Security Event |

## 10. Success Metrics

**Detection quality** (development targets, not marketing claims — must be validated against the simulator):
- Execution Gap Detection: Precision ≥ 90%, Recall ≥ 85%, F1 ≥ 87%
- Negative-Space Detection: Precision ≥ 90%, Recall ≥ 85%
- Anomaly Detection: F1 ≥ 85%

**Operational:** processing latency, event throughput, API response time, dashboard latency.

**Security:** authentication success/failure rate, unauthorized-action prevention, session invalidation time, audit integrity (zero undetected tampering in test injection).

---

## 11. Constraints & Assumptions

- Must run fully **offline / air-gapped** — this is a hard requirement, not an optimization, because SOC environments may restrict internet connectivity. This must be visibly demonstrable during SIH judging (a status indicator, e.g. `● LOCAL / OFFLINE`, with a detail drawer showing runtime mode, AI inference location, database location, auth location).
- Biometric identity is an **additional security layer protecting supervisor actions** — it is not the SOC analytics engine and must never be the sole basis for a security decision.
- LiDAR is an **optional enhancement** to biometric verification, not a dependency. The product must work with a plain camera (Baseline Mode: camera → facial features → verification) and demo correctly on judging hardware without LiDAR.
- The "six-second credential" concept is a **short-lived rotating session credential** bound to User + Device + Session + Role + Timestamp + Permissions — it is never a direct conversion of biometric data into a token, and biometric templates and session credentials must remain cryptographically separate.
- Blockchain is explicitly **not required**; a hash-chained, append-only audit log satisfies the tamper-evidence requirement without introducing unnecessary distributed-ledger infrastructure. See `Rules.md` for the boundary on this.
- Development priority: **detection quality before UI polish.** A working, explainable detection engine beats a beautiful dashboard with weak detection — see `Architecture.md` §10 (Final Architecture Principle).

---

## 12. Demo Narrative (for SIH judging)

```
1. Show a SOC that appears healthy
2. Introduce hidden operational failures (via simulator)
3. SOC continues reporting acceptable KPIs
4. ANVĪKṢA analyzes the same telemetry
5. Execution Gap detected → Negative Space detected → Behavioural anomaly detected
6. Findings correlated → Risk score generated → Evidence shown
7. Explainable recommendation → Supervisor investigates
8. Secure identity / audit trail demonstrated
```

Closing line: *"A SOC can look busy without being effective. ANVĪKṢA measures what conventional dashboards cannot: whether the SOC actually performed the actions required to keep the organization secure."*
