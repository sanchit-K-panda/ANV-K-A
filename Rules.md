# Rules.md — ANVĪKṢA (SAT-SA)

Boundaries for any AI (or human) building this project. If a request or a "good idea" conflicts with something here, this document wins. When in doubt, re-read `PRD.md` §6 (Non-Goals) and §11 (Constraints) before writing code.

---

## 1. Hard Boundaries — What NOT to Build

Do not, under any framing, implement:

- A replacement SIEM, EDR, or firewall.
- A generic cybersecurity chatbot / general-purpose Q&A assistant.
- A generic "AI predicts cyberattacks" prediction system.
- Blockchain, DLT, or a public/permissionless ledger of any kind. The tamper-evidence requirement is satisfied by a **local hash-chain** (§7). If a request implies "add blockchain," implement the hash-chain instead and say so.
- Face recognition or biometric capture for anything other than gating SOC-supervisor privileged access. No general surveillance features, no biometric use for analysts being profiled, no biometric data reused for any secondary purpose.
- Hardware integrations that exist only for demo spectacle. LiDAR is the one named exception, and only because it degrades gracefully (§5) — anything with a hard dependency on unusual hardware should be rejected.

Before adding any feature not already in `PRD.md` §7, check it against: *does this support SOC supervision, assessment, security, evidence, or decision-making?* If not, don't build it — flag it instead.

---

## 2. Library & Dependency Rules

**Use** (per `Architecture.md` §9): Next.js/TypeScript, Tailwind + shadcn/ui, Recharts/ECharts, FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, Redis, scikit-learn, PyTorch, Pandas/NumPy/SciPy, Argon2id, AES-256-GCM, TLS 1.3.

**Avoid unless a genuine scale requirement is demonstrated:** Kafka, Redpanda, Apache Spark, or any distributed-processing framework. This is a SIH prototype — Pandas/NumPy plus Python async processing handles the target data volumes. Do not introduce distributed infrastructure "to be safe" or "for scalability" without a measured bottleneck.

**Never introduce a dependency that:**
- Requires a network call to a cloud service at runtime (see §4, offline-first).
- Duplicates a capability already covered by the chosen stack (e.g., don't add a second ORM, a second chart library, a second state-management library).
- Is unmaintained, has no pinned version, or is pulled in "just to try it."

If a task seems to need something outside this list, name the gap and the tradeoff explicitly rather than silently adding a new dependency.

---

## 3. AI Decision-Making Boundary (Rules vs. ML vs. LLM)

This is the most important architectural rule in the project — see `Architecture.md` §3.

- **Rules** (deterministic) are the first-line, most-trusted source of findings. If something can be expressed as a workflow-violation rule, express it as one — it's the most explainable and the least likely to be wrong.
- **ML models** (Isolation Forest, LOF, DBSCAN, statistical baselines, time-series, classification, graph correlation) are used for behavioural baselines and anomaly detection where a clean rule doesn't exist.
- **Local LLM** is used **only** for: explaining a finding in natural language, generating assessment/report summaries, and converting technical findings into supervisor-readable prose.
  - It **must never** independently generate a risk score, decide severity, or be the sole basis for a finding.
  - It **must never** call an external API — local runtime only (Ollama / llama.cpp), consistent with §4.
  - Any LLM-generated explanation must be traceable back to the structured finding data it's summarizing — no free-form claims the underlying data doesn't support.

---

## 4. Offline-First Is a Hard Constraint

The entire runtime must function with zero internet connectivity. Concretely:

- No cloud database. PostgreSQL and Redis run locally (Docker).
- No cloud/external LLM API calls (OpenAI, Anthropic API, etc.) — local LLM only, and optional.
- No cloud authentication provider (no Auth0, no Firebase Auth, no OAuth against an external IdP as a hard dependency).
- No telemetry/analytics SDKs that phone home (no Sentry-cloud, no Google Analytics, no crash reporters that require internet).
- Any third-party frontend library must be vendored/bundled at build time — no runtime CDN dependency for anything functional.
- The offline/air-gapped state must be a **visible, verifiable UI element** (`Design.md` covers the status indicator), not just an internal property — this needs to be demonstrable to judges live.

If a feature request implies a network call to anything outside the Docker Compose stack, stop and flag it — don't quietly implement a cloud fallback.

---

## 5. Biometric & Identity Rules

- Never store or log a raw/plaintext biometric template. Only store a protected, encrypted embedding (`biometric_profiles.protected_template`, encrypted with AES-256-GCM).
- The biometric representation and the session credential are **separate artifacts**. Never derive the session credential directly from biometric data — it's derived from session context (User + Device + Session + Role + Timestamp + Permissions).
- LiDAR is Enhanced Mode only. Baseline Mode (camera-only facial verification) must be fully functional without LiDAR hardware present — assume judging hardware won't have it.
- Every identity event — match, no-match, device-verification failure, session lock, credential renewal — writes an audit record. No silent identity decisions.
- Continuous verification failures freeze sensitive operations and force re-authentication; they do not simply log a warning and continue.

---

## 6. Explainability Contract (non-negotiable output shape)

Every `Finding` object the backend produces, and every finding the frontend renders, must carry all seven of: **what, why, when, where, evidence, confidence, recommendation** (`Architecture.md` §6). A finding missing any of these fields is incomplete and should not reach the frontend.

Every risk score must be an explicit, itemized sum of named factors (`Architecture.md` §5). Never emit a bare number. If a new scoring factor is added, it must appear by name in the breakdown, not folded silently into an existing factor.

---

## 7. Audit & Integrity Rules

- Audit logs are **append-only**. No update or delete operation should ever target `audit_logs` in application code.
- Every privileged action (login, finding open, case update, evidence export, admin action) writes an audit record, including the actor, device, identity status, and timestamp.
- Tamper-evidence is implemented as a local hash-chain: each record's hash incorporates the previous record's hash (`hash_n = H(record_n + hash_{n-1})`). This is the entire "blockchain" requirement — do not build or integrate an actual distributed ledger.
- Audit integrity must be independently verifiable (a "verify chain" operation that walks the chain and reports the first broken link, if any).

---

## 8. Error Handling

- Ingestion errors (malformed data, unknown source format, timestamp parse failure) must be logged with the offending record preserved for inspection — never silently dropped, never silently "fixed" with a guessed value that could distort analytics.
- Analytics-engine errors must fail the specific finding/computation, not the whole pipeline — one bad record shouldn't block the rest of a batch.
- Authentication/identity errors default to **deny**. Ambiguous biometric match, expired credential, or unreachable verification step = access denied, not access granted with a warning.
- User-facing errors in the Command Centre must be specific enough to act on (not just "something went wrong") without leaking internals (stack traces, SQL, file paths) to the frontend.
- Every caught exception in a security-relevant path (`auth/`, `security/`, `audit/`) gets an audit event, even on failure — especially on failure.

---

## 9. Naming Consistency

Use the feature names from `PRD.md` §7 consistently across backend model names, API routes, and frontend components — e.g., "Execution Gap Engine," "Negative-Space Engine," "SOC Health Score," "Critical Risk Queue." Don't invent synonyms for existing concepts (no "workflow deviation detector" alongside an existing "Execution Gap Engine" — pick the one name and use it everywhere).

---

## 10. Testing Expectations

- Every analytics engine needs a corresponding scenario in the SOC Simulator (`PRD.md` §9) before it's considered done — an engine with no simulated ground truth to test against is not complete.
- Security-relevant code (`auth/`, `security/`, `audit/`) requires tests for both the success path and the deny/failure path — a passing test suite that only covers "correct credentials" is insufficient.
- Don't mark a phase (see `Phases.md`) complete without its stated Definition of Done being met, including tests.

---

## 11. When to Ask vs. Proceed

**Proceed without asking** when the answer is already fixed in `PRD.md` / `Architecture.md` / this document — e.g., "which database," "how is a risk score structured," "what does a finding need to contain."

**Ask before proceeding** when:
- A request would introduce a new external/cloud dependency.
- A request would change the risk-scoring factor structure, the finding schema, or the offline-first guarantee.
- A request is ambiguous between "add a rule" and "add an ML model" for the same detection.
- A request would touch `audit_logs` with anything other than an append.

State the assumption made and move on for anything smaller than that — don't block routine implementation work on clarifying questions the docs already answer.
