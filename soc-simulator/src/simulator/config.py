"""Simulator configuration — all tunables live here, no magic numbers elsewhere."""
from __future__ import annotations

import tomllib
from dataclasses import dataclass, field
from pathlib import Path

from simulator.schemas.enums import ScenarioName

DEFAULTS_TOML = """
# ANVĪKṢA SOC Simulator default configuration
[scale]
soc_count = 2
analysts_per_soc_min = 15
analysts_per_soc_max = 30
assets_per_soc_min = 500
assets_per_soc_max = 2000
devices_per_soc = 12
threats_per_run = 25
events = 10000
alert_rate = 0.12            # fraction of events that become alerts
incident_rate = 0.25         # fraction of critical/high alerts that become incidents
max_alerts_per_incident = 4

[time]
window_days = 14             # dataset spans this many days ending 'now'

[distributions]
# severity weights for events (INFO, LOW, MEDIUM, HIGH, CRITICAL)
severity = [30, 30, 25, 12, 3]
closure_minutes_median = 40
investigation_minutes_min = 15
investigation_minutes_max = 180
triage_seconds_median = 90

[investigation_gap]
fraction_of_critical = 0.35  # share of critical incidents with missing investigation
[negative_space]
fraction_affected = 0.20
[kpi_manipulation]
fraction_analysts = 0.30
closure_minutes_injected = 4
investigation_rate_injected = 0.12
escalation_rate_injected = 0.05
[analyst_overload]
dominant_share = 0.65
[recurring_threat]
recurrence_count = 5
[identity_anomaly]
session_count = 40
"""


@dataclass
class SimConfig:
    soc_count: int = 2
    analysts_per_soc_min: int = 15
    analysts_per_soc_max: int = 30
    assets_per_soc_min: int = 500
    assets_per_soc_max: int = 2000
    devices_per_soc: int = 12
    threats_per_run: int = 25
    events: int = 10_000
    alert_rate: float = 0.12
    incident_rate: float = 0.25
    max_alerts_per_incident: int = 4
    window_days: int = 14
    severity_weights: tuple[int, ...] = (30, 30, 25, 12, 3)
    closure_minutes_median: float = 40.0
    investigation_minutes_min: int = 15
    investigation_minutes_max: int = 180
    triage_seconds_median: float = 90.0
    # scenario knobs
    ig_fraction_critical: float = 0.35
    ns_fraction_affected: float = 0.20
    kpi_fraction_analysts: float = 0.30
    kpi_closure_minutes: float = 4.0
    kpi_investigation_rate: float = 0.12
    kpi_escalation_rate: float = 0.05
    overload_dominant_share: float = 0.65
    recurrence_count: int = 5
    identity_session_count: int = 40
    seed: int = 42
    scenario: ScenarioName = ScenarioName.HEALTHY
    extra: dict = field(default_factory=dict)

    @classmethod
    def load(cls, path: Path | None = None) -> "SimConfig":
        """Load config from TOML file, falling back to built-in defaults."""
        raw = DEFAULTS_TOML
        if path and Path(path).exists():
            raw = Path(path).read_text(encoding="utf-8")
        data = tomllib.loads(raw)
        scale, time_, dist = data.get("scale", {}), data.get("time", {}), data.get("distributions", {})
        return cls(
            soc_count=scale.get("soc_count", 2),
            analysts_per_soc_min=scale.get("analysts_per_soc_min", 15),
            analysts_per_soc_max=scale.get("analysts_per_soc_max", 30),
            assets_per_soc_min=scale.get("assets_per_soc_min", 500),
            assets_per_soc_max=scale.get("assets_per_soc_max", 2000),
            devices_per_soc=scale.get("devices_per_soc", 12),
            threats_per_run=scale.get("threats_per_run", 25),
            events=scale.get("events", 10_000),
            alert_rate=scale.get("alert_rate", 0.12),
            incident_rate=scale.get("incident_rate", 0.25),
            max_alerts_per_incident=scale.get("max_alerts_per_incident", 4),
            window_days=time_.get("window_days", 14),
            severity_weights=tuple(dist.get("severity", (30, 30, 25, 12, 3))),
            closure_minutes_median=dist.get("closure_minutes_median", 40.0),
            investigation_minutes_min=dist.get("investigation_minutes_min", 15),
            investigation_minutes_max=dist.get("investigation_minutes_max", 180),
            triage_seconds_median=dist.get("triage_seconds_median", 90.0),
            ig_fraction_critical=data.get("investigation_gap", {}).get("fraction_of_critical", 0.35),
            ns_fraction_affected=data.get("negative_space", {}).get("fraction_affected", 0.20),
            kpi_fraction_analysts=data.get("kpi_manipulation", {}).get("fraction_analysts", 0.30),
            kpi_investigation_rate=data.get("kpi_manipulation", {}).get("investigation_rate_injected", 0.12),
            kpi_escalation_rate=data.get("kpi_manipulation", {}).get("escalation_rate_injected", 0.05),
            kpi_closure_minutes=data.get("kpi_manipulation", {}).get("closure_minutes_injected", 4.0),
            overload_dominant_share=data.get("analyst_overload", {}).get("dominant_share", 0.65),
            recurrence_count=data.get("recurring_threat", {}).get("recurrence_count", 5),
            identity_session_count=data.get("identity_anomaly", {}).get("session_count", 40),
        )
