# Design.md — ANVĪKṢA Visual System

## Direction
Desktop-first SOC command centre — not a generic SaaS dashboard, not an "AI futuristic" product. Restrained, dense, professional, evidence-driven. First Figma frame: **1440 × 1024**.

Do:
- Dense but readable information; strong hierarchy
- Persistent left navigation
- Tables, timelines, charts, and evidence blocks as the primary UI elements
- Severity colour used *only* for meaningful security states — never decoratively
- Critical findings immediately visible on load

Don't:
- Rounded-card-heavy "dashboard template" look
- Decorative gradients or glow effects
- Color used for anything that isn't a status/severity signal

## Theme
Restrained **dark SOC styling** as the default (matches real SOC/NOC environments and makes severity colour pop without competing).

Suggested base palette (tune during implementation, keep contrast AA+):
- Background layers: near-black / very dark slate (e.g. `#0B0D10`, `#12151A` for panels, `#1B1F26` for raised surfaces)
- Text: off-white primary (`#E8EAED`), muted grey secondary (`#8A919C`)
- Borders/dividers: low-contrast dark grey (`#242A32`)
- Accent (brand/interactive, used sparingly): a single restrained blue or teal — not neon

Severity palette (reserved exclusively for severity/status, never for branding or decoration):
- CRITICAL — red
- HIGH — orange
- MEDIUM — amber/yellow
- LOW — grey/blue-grey
- VERIFIED / OK / TRUSTED — green
- OFFLINE/LOCAL status indicator — neutral (green dot for "operating normally offline," not an error color)

## Typography
- One functional sans-serif for UI text (e.g. Inter / IBM Plex Sans) — legible at small sizes for dense tables
- One monospace for IDs, hashes, timestamps, session/device identifiers, code-like values (e.g. IBM Plex Mono / JetBrains Mono) — reinforces the "forensic evidence" feel
- Clear, limited type scale: page title, section header, table header, body, caption/label — avoid ad hoc sizes

## Layout system
- Persistent left sidebar (Command Centre, Findings, Analytics, Alerts, Incidents, Investigations, Cases, Evidence, Risk, Reports, Audit, Administration)
- Topbar: product mark, current SOC selector, **● LOCAL / OFFLINE** status, supervisor identity, session lock icon
- Content area: metric blocks → tables/charts → detail drill-downs
- Standard drill-down path everywhere: **Risk → Finding → Evidence → Original SOC events**

## Core reusable components
Sidebar, Topbar/Header, Status Indicator, Severity Badge, Status Badge, Confidence Indicator, Risk Score, Finding Row, Alert/Incident/Investigation Row, Evidence Row, Risk Factor Row, Metric Block, Chart Container, Timeline Event, Filter Bar, Search Input, Modal, Drawer, Toast, Session Status, Authentication State, Empty/Loading/Error States

## Explainability pattern (applies to every finding screen)
Every finding card/detail follows the same structure so supervisors learn it once:
```
WHAT → WHY → WHEN → WHERE → EVIDENCE → CONFIDENCE → RECOMMENDATION
```
Risk scores are never shown as a bare number — always with a contributing-factors breakdown (e.g. Investigation Gap +31, Escalation Anomaly +24 …).

## Offline/air-gapped visibility
This is a selling point, not a footnote — make it visually persistent:
```
Runtime Mode: AIR-GAPPED
Internet Connectivity: DISABLED
AI Inference: LOCAL
Database: LOCAL
Authentication: LOCAL
Audit: LOCAL
External APIs: NONE
```
Shown as a status drawer off the topbar indicator; should be demonstrable live during SIH judging.

## Secure session visual language
Session state is always visible near the identity control: `Identity: VERIFIED`, `Device: TRUSTED`, `Session: ACTIVE`, `Credential: ROTATING`, countdown to next renewal, and a clear locked/failed state (`Identity verification failed → sensitive operations locked → re-authentication required`).
