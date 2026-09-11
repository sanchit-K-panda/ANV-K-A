# ANVĪKṢA — SIH26157 Winning Demo & Jury Defense Guide
**Problem Statement:** SIH26157 — Supervisory Analytics Tool for SOC Assessment (SAT-SA)  
**Organization:** National Technical Research Organisation (NTRO)  
**Evaluator Reference:** [sihbuddy.in/ps/SIH26157](https://www.sihbuddy.in/ps/SIH26157)  

---

## 1. The 60-Second Opening Hook (The "Optical Illusion of SOC Health")
> *"Esteemed Jury, a Security Operations Centre can boast a 99.8% SLA, pristine green dashboards, and an average closure time under 8 minutes — and yet be completely compromised.*  
>  
> *Why? Because analysts under pressure learn to game their metrics: rapidly closing alerts without investigation, ignoring complex high-severity escalations, and letting persistent threat campaigns recur unaddressed.*  
>  
> *Traditional tools like SIEMs and EDRs look at what **happened**. **ANVĪKṢA** is a sovereign supervisory analytics tool that looks at what was **supposed to happen and was silently omitted**."*

---

## 2. The Winning Demo Script ("The Smallest Thing That Wins the Room")

### Step 1: Navigate to Supervisory Ranking (`/supervision`)
* **What to say:** *"NTRO and NCIIPC oversee critical national infrastructure SOCs. Manual auditing of millions of raw tickets is impossible. ANVĪKṢA ingests workflow exhaust across 8 core capability areas defined in the problem statement."*
* **What to show:** The **Supervisory Organisation Leaderboard**, showing ranked SOCs ordered by cumulative penalty points derived strictly from telemetry.

### Step 2: Toggle "Head-to-Head Comparison" & 8-Axis Radar Chart
* **What to say:** *"Here is the winning move. We select two organisations side-by-side: `SOC-001 (Balanced Baseline)` versus `SOC-002 (Escalation-Lagging)`."*
* **What to show:** 
  * The **8-Axis Capability Spider Chart** instantly visualizing the operational delta across *Threat Detection, Investigation, Escalation, Incident Response, SecOps, Governance, Discipline, and Resilience*.
  * Point to the delta badge: `Escalation Sign-off: -82% vs. National Baseline`.

### Step 3: Drill into Capability Breakdown & Telemetry Factors
* **What to say:** *"ANVĪKṢA is never a black-box. Every single penalty point is backed by a named factor and exact telemetry metric (e.g. `critical_escalation_bypass = 0.74`)."*
* **What to show:** Click on the weakest area to reveal the verifiable data-derived reasons.

### Step 4: Examiner Inspection Queue (Sample Prioritization)
* **What to say:** *"We do not replace human examiners; we provide decision support. Instead of searching through 20,000 cases, the examiner is presented with the top prioritized cases exhibiting anomalous velocities, omitted supervisor sign-offs, or skipped forensics."*
* **What to show:** The **Examiner Inspection Queue** table with case IDs, assigned analysts, and field-referencing reasons.

### Step 5: Decision Support & 1-Click Audit Dossier Export
* **What to say:** *"The examiner can flag cases for on-site audit, request written justification from the SOC lead, or export an official offline inspection brief."*
* **What to show:** 
  * Click `[Flag On-Site Audit]` to show human-in-the-loop recording.
  * Click `[EXPORT AUDIT DOSSIER]` to display the structured Markdown brief signed with a **SHA-256 cryptographic seal**.

### Step 6: 100% Air-Gap & Sovereign Execution
* **What to say:** *"For defence and intelligence deployments, sovereign data must never leave the enclave. ANVĪKṢA runs 100% offline with zero cloud API keys, local PostgreSQL, local Redis, and local DeepSeek-R1 8B inference on 127.0.0.1."*
* **What to show:** Click the top-bar **`AIR-GAPPED (0 B/s)`** badge to show the verified 6/6 hardware and network security checks.

---

## 3. Defense Against Jury Trap Questions (SIH Buddy Red Flags)

### Question 1: *"Your tool runs on synthetic data. Isn't it just rediscovering your own hardcoded templates?"*
* **Answer:**  
  *"No, and we specifically architected against circularity:  
  1. Our core ML model (**VIKĀRA Isolation Forest**) is trained **strictly on benign, healthy baseline operations**. It has never seen our attack scenarios during training.  
  2. The model learns the statistical geometry of normal human workflow (39 features), and flags anomalies purely because the workflow geometry diverges.  
  3. Furthermore, we benchmarked across 139 ground-truth cases across 7 independent scenarios achieving 98.9% F1, and our ingestion pipeline accepts external SIEM/EDR datasets via standard JSON/CSV APIs."*

### Question 2: *"Why should we trust your 8 capability indicators over standard CISO metrics like MTTR?"*
* **Answer:**  
  *"Standard metrics measure speed, not thoroughness. If an analyst closes 100 alerts in 10 minutes, their MTTR looks world-class, but the SOC is effectively blind.  
  Our 39 indicators are directly mapped to **NIST CSF 2.0 (DE.AE, RS.MI, PR.IP)** and **NCIIPC SOC Maturity Guidelines**, evaluating triage-to-investigation depth, escalation completeness, shift-handover latency variance, and recurring unaddressed attack vectors."*

### Question 3: *"Can ANVĪKṢA ingest real production data from existing SIEMs like Splunk, Microsoft Sentinel, or Elastic?"*
* **Answer:**  
  *"Yes. ANVĪKṢA sits above existing SIEM/EDR tooling. Our `/api/ingest/batch` API ingests normalized alert, case, and workflow telemetry via standard CEF, Syslog, or REST payloads. The simulator is simply an air-gapped test-harness for reproducible evaluation."*

### Question 4: *"Why did you use an Isolation Forest alongside DeepSeek-R1?"*
* **Answer:**  
  *"Because they solve two fundamentally different problems:  
  - **VIKĀRA (Isolation Forest)** crunches high-dimensional numerical telemetry across millions of logs in milliseconds to mathematically isolate anomalous time windows and analysts.  
  - **PRATYAYA (DeepSeek-R1 8B)** runs locally via Ollama to perform chain-of-thought supervisory reasoning over the structured evidence, drafting CISO-grade intelligence reports and plain-language audit dossiers for government inspectors."*
