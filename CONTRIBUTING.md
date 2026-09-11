# Contributing to ANVĪKṢA

Thank you for your interest in contributing to **ANVĪKṢA (Supervisory Analytics Tool for SOC Assessment)**!

## Core Principles

1. **Strict Air-Gap Compliance**:
   * No code may introduce external cloud dependencies, remote telemetry endpoints, or non-local API calls.
   * All models, databases, and caches must run within the sovereign local enclave.
2. **Evidence-First & No Mock Data**:
   * Findings, timeline steps, and risk metrics must be derived exclusively from real or simulated backend telemetry.
   * Never hardcode mock identifiers or bypass error states with fabricated data.
3. **Deterministic & Test-Driven**:
   * Every new feature or bugfix must include automated unit/integration tests.
   * All tests must pass before pull requests are opened.

---

## Development Workflow

### 1. Fork & Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Running Local Tests
Before committing, ensure that all test suites and air-gap checks pass:

```bash
# Run backend test suite
py -3.14 -m pytest backend/tests -q

# Run ML test suite
py -3.14 -m pytest ml/tests -q

# Run air-gap proof verification
py -3.14 infrastructure/verify_airgap.py

# Verify frontend build
cd frontend && npm run build
```

### 3. Coding Conventions
* **Backend**: Python 3.12+ / FastAPI, strict type annotations, Pydantic v2 schemas.
* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, dark glassmorphic cybersecurity design system.
* **Formatting**: Clean code without trailing whitespace, unused imports, or ground-truth leakage.

---

## Submitting Pull Requests

1. Provide a clear and descriptive PR title following conventional commits (e.g., `feat:`, `fix:`, `docs:`).
2. Reference any related issues or problem statement capability areas.
3. Fill out the [Pull Request Template](.github/pull_request_template.md).
