# Design.md — ANVĪKṢA Visual System: Dark Mode Command Center (Void & Neon)

## Direction
Desktop-first SOC command centre — built for low eye strain in dark-room monitoring environments while elevating supervisory cyber intelligence with high-luminance neon telemetry accents. Restrained density, dark room contrast, professional, evidence-driven. Target frame: **1440 × 1024** and above.

Do:
- Deep obsidian void background paired with crisp, high-luminance neon signal accents
- Persistent left navigation with Signal Cyan active telemetry path indicators
- Tables, timelines, risk meters, and forensic evidence blocks as primary UI components
- High-contrast neon severity colors reserved strictly for meaningful security states
- Critical alerts highlighted with high-visibility Kinetic Pink neon signals

Don't:
- White or bright grey default backgrounds (avoid eye fatigue in dark rooms)
- Decorative generic color usage — colors indicate data paths, security state, or alert severity
- Muddy low-contrast text on dark backgrounds (maintain AA/AAA contrast using high-luminance off-white)

## Theme & Palette (Void & Neon)

Primary Command Center Palette:
- **Void Black** (`#050508` / `rgb(5, 5, 8)`): Main application canvas background
- **Console Panel** (`#0A0D14` / `rgb(10, 13, 20)`): Deep charcoal containers, cards, and data tables
- **Raised Surface** (`#121722` / `rgb(18, 23, 34)`): Interactive hover states, elevated drawers, dropdowns
- **Borders & Dividers** (`#1E2638` / `rgb(30, 38, 56)`): Hairline dark dividers with optional neon focus glow

Neon Signal Palette:
- **Signal Cyan** (`#00D4FF` / `rgb(0, 212, 255)`): Telemetry data paths, active nav links, focus rings, primary interactive elements
- **Kinetic Pink** (`#FF51FA` / `rgb(255, 81, 250)`): CRITICAL security findings, active threat anomalies, high priority alerts
- **Virus Green** (`#2FF801` / `rgb(47, 248, 1)`): Air-gapped enclave active status, verified credentials, clean audit records, OK status
- **Neon Orange** (`#FF9900` / `rgb(255, 153, 0)`): HIGH severity threats & escalation warnings
- **Neon Amber** (`#FFC700` / `rgb(255, 199, 0)`): MEDIUM severity findings

Typography Palette:
- **Primary Text**: High-Luminance Off-White (`#F0F6FC` / `rgb(240, 246, 252)`)
- **Secondary Text**: Muted Slate (`#8B949E` / `rgb(139, 148, 158)`)
- **Muted / Dim Text**: Low-Luminance Slate (`#484F58` / `rgb(72, 79, 88)`)

## Typography
- **Inter / IBM Plex Sans**: Functional sans-serif for UI labels, dense tables, and navigation
- **JetBrains Mono / IBM Plex Mono**: Monospace font for log hashes, IP addresses, timestamps, session keys, and risk factors

## Layout System
- **Sidebar**: Void Black background, Signal Cyan active indicator borders, Kinetic Pink alert badges, Virus Green enclave status
- **Topbar**: Product mark, current SOC selector, **● AIR-GAP ACTIVE (LOCAL)** status chip in Virus Green, supervisor identity in Signal Cyan
- **Content Area**: Telemetry metrics → Finding tables/charts → Forensic detail drill-downs
- **Explainability Pattern**: `WHAT → WHY → WHEN → WHERE → EVIDENCE → CONFIDENCE → RECOMMENDATION`

## Secure Session & Offline Visual Language
- Air-Gap status is permanently anchored in the Topbar and Sidebar footer (`Runtime: AIR-GAPPED`, `AI: LOCAL`, `Net: DISABLED`).
- Identity status chip: `VERIFIED` in Virus Green or Signal Cyan, with session token countdown and tamper-proof log hashes.
