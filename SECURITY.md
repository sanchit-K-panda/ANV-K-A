# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Sovereign Air-Gap & Isolation Constraints

ANVĪKṢA is designed for deployment in high-security defence, intelligence, and national critical infrastructure enclaves (NTRO / NCIIPC / CERT-In).

### Core Security Invariants:
1. **Zero Cloud Egress**: The software must not make outbound calls to external services, remote LLMs, or cloud telemetries.
2. **Local Cryptographic Auditing (SAKṢĪ)**: Every supervisory decision, review action, and authentication event is committed to an append-only, SHA-256 hash-chained local audit ledger.
3. **Argon2id Password & Credential Hashing**: System users and supervisory sessions use memory-hard Argon2id hashing with rotating session tokens.

---

## Reporting a Vulnerability

If you discover a security vulnerability or an unintentional network egress path in ANVĪKṢA, please disclose it responsibly:

1. **Do NOT open a public issue.**
2. Send an email to the repository maintainers with:
   - Description of the vulnerability.
   - Exact steps to reproduce.
   - Network capture or audit proof (if relevant).
3. The team will acknowledge receipt within 48 hours and work on a prompt remediation.
