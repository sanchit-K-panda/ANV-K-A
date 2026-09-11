"""Telemetry generator: events, alert→incident→investigation→escalation workflows.

The workflow engine produces coherent timelines (alert → triage → investigation →
escalation → response → closure) with realistic log-normal delays, and records the
per-incident workflow trace so scenarios can inject gaps and ground truth can
capture expected-vs-actual behaviour.
"""
from __future__ import annotations

import random
import statistics
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from simulator.generators.world import World
from simulator.schemas.entities import (
    Alert, AnalystAction, Event, Investigation, Incident, Escalation,
)
from simulator.schemas.enums import (
    ActionType, AlertStatus, Criticality, EscalationStatus,
    IncidentStatus, InvestigationStatus, Severity,
)

EVENT_TYPES = ["auth_success", "auth_failure", "process_create", "network_connection",
               "file_write", "dns_query", "port_scan", "privilege_escalation",
               "usb_insert", "email_gateway_hit"]
ALERT_TYPES = ["Suspicious Login", "Malware Detected", "Port Scan", "Phishing Attempt",
               "Data Exfiltration Suspicion", "Privilege Abuse", "C2 Beacon",
               "Ransomware Behaviour", "Brute Force"]


def lognormal_seconds(rng: random.Random, median: float) -> int:
    """Positive delay drawn from a log-normal distribution around `median` seconds."""
    import math
    mu = math.log(max(median, 0.1))
    return max(1, int(rng.lognormvariate(mu - 0.35, 0.6)))


@dataclass
class WorkflowTrace:
    """What actually happened for one incident — used by ground truth."""
    incident_id: str
    severity: Severity
    analyst_id: str
    soc_id: str
    created_at: datetime
    closed_at: datetime | None = None
    actions_done: list[str] = field(default_factory=list)
    expected_actions: list[str] = field(default_factory=list)
    investigation_exists: bool = False
    escalation_exists: bool = False


class TelemetryGenerator:
    """Generates events and the full alert→closure workflow chain."""

    def __init__(self, world: World):
        self.world = world
        self.rng = world.rng
        self.cfg = world.cfg
        self.events: list[Event] = []
        self.alerts: list[Alert] = []
        self.incidents: list[Incident] = []
        self.investigations: list[Investigation] = []
        self.escalations: list[Escalation] = []
        self.actions: list[AnalystAction] = []
        self.traces: dict[str, WorkflowTrace] = {}

    # -- events & alerts ---------------------------------------------------
    def generate_events(self) -> None:
        rng, cfg = self.rng, self.cfg
        sev_names = [Severity.INFO, Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]
        for _ in range(cfg.events):
            soc = rng.choice(self.world.socs)
            asset = rng.choice(self.world.assets_of(soc.soc_id))
            dev = rng.choice(self.world.devices_of(soc.soc_id))
            sev = rng.choices(sev_names, weights=list(cfg.severity_weights))[0]
            ts = self.world.rand_time()
            etype = rng.choice(EVENT_TYPES)
            self.events.append(Event(
                event_id=self.world.next_id("EV"), soc_id=soc.soc_id, timestamp=ts,
                event_type=etype, source=dev.device_type.value, asset_id=asset.asset_id,
                device_id=dev.device_id, severity=sev,
                description=f"{etype} observed on {asset.hostname}",
                metadata={"src_ip": f"10.{rng.randint(0, 255)}.{rng.randint(0, 255)}."
                          f"{rng.randint(1, 254)}"}))
        self.events.sort(key=lambda e: e.timestamp)

    def generate_alerts(self, critical_incident_rate: float | None = None) -> None:
        """Convert a fraction of events into alerts; group some into incidents."""
        rng, cfg = self.rng, self.cfg
        rate = cfg.alert_rate
        candidates = [e for e in self.events if e.severity in (Severity.HIGH, Severity.CRITICAL)]
        pool = rng.sample(candidates, k=int(len(candidates) * rate)) if candidates else []
        analysts_by_soc = {s.soc_id: self.world.analysts_of(s.soc_id) for s in self.world.socs}
        for ev in sorted(pool, key=lambda e: e.timestamp):
            analyst = rng.choice(analysts_by_soc[ev.soc_id])
            triage_delay = timedelta(seconds=lognormal_seconds(
                rng, cfg.triage_seconds_median / max(analyst.skill_level, 1)))
            status = AlertStatus.CLOSED  # baseline closes everything; scenarios may alter
            self.alerts.append(Alert(
                alert_id=self.world.next_id("AL"), soc_id=ev.soc_id, timestamp=ev.timestamp,
                source=ev.source, severity=ev.severity, alert_type=rng.choice(ALERT_TYPES),
                asset_id=ev.asset_id or "ASSET-00000", event_ids=[ev.event_id],
                analyst_id=analyst.analyst_id, status=status, priority=min(5, max(1, {
                    Severity.CRITICAL: 5, Severity.HIGH: 4}.get(ev.severity, 3))),
                created_at=ev.timestamp, closed_at=ev.timestamp + triage_delay +
                timedelta(minutes=lognormal_seconds(rng, cfg.closure_minutes_median * 60))))
        self._build_incidents(critical_incident_rate or cfg.incident_rate)

    # -- incidents & downstream workflow ------------------------------------
    def _profile_for(self, soc_id: str) -> "Any | None":
        """Per-SOC maturity profile, if multi-SOC profiles were configured."""
        return getattr(self.world, "profiles", {}).get(soc_id)

    def _build_incidents(self, incident_rate: float) -> None:
        rng, cfg = self.rng, self.cfg
        by_sev = [a for a in self.alerts if a.severity in (Severity.CRITICAL, Severity.HIGH)]
        n_incidents = max(1, int(len(by_sev) * incident_rate))
        chosen = rng.sample(by_sev, min(n_incidents, len(by_sev))) if by_sev else []
        groups: list[list] = []
        i = 0
        while i < len(chosen):  # cluster 1..max_alerts_per_incident alerts per incident
            k = rng.randint(1, cfg.max_alerts_per_incident)
            groups.append(chosen[i:i + k])
            i += k
        threats = self.world.threats
        for g in groups:
            soc_id = g[0].soc_id
            analyst = self.rng.choice(self.world.analysts_of(soc_id))
            created = g[0].created_at
            severity = Severity.CRITICAL if any(a.severity == Severity.CRITICAL for a in g) \
                else Severity.HIGH
            threat_ids = [self.rng.choice(threats).threat_id
                          for _ in range(self.rng.randint(0, 1))] if threats else []
            inc = Incident(
                incident_id=self.world.next_id("INC"), soc_id=soc_id,
                alert_ids=[a.alert_id for a in g], threat_ids=threat_ids,
                asset_ids=sorted({a.asset_id for a in g}), severity=severity,
                status=IncidentStatus.CLOSED, created_at=created,
                assigned_analyst_id=analyst.analyst_id)
            self.incidents.append(inc)
            self._run_workflow(inc)

    def _run_workflow(self, inc: Incident) -> None:
        """Execute the standard healthy workflow for one incident and record its trace.

        When the incident's SOC has a maturity profile (multi-SOC mode, REMEDIATION.md
        P0-3), workflow quality is degraded probabilistically according to that profile:
        escalation skips, closure-without-investigation, missing supervisor sign-off,
        thin investigation notes, and slow closure velocity. All deviations remain
        organic telemetry — ground truth is NOT written here; ranking must discover
        them from the data.
        """
        rng, cfg = self.rng, self.cfg
        profile = self._profile_for(inc.soc_id)
        analyst = next(a for a in self.world.analysts
                       if a.analyst_id == inc.assigned_analyst_id)
        expected = (["TRIAGE", "INVESTIGATION", "ESCALATION", "RESPONSE", "CLOSURE"]
                    if inc.severity == Severity.CRITICAL
                    else ["TRIAGE", "INVESTIGATION", "CLOSURE"])
        t = inc.created_at
        done: list[str] = []
        skill = max(analyst.skill_level, 1)

        # TRIAGE
        t += timedelta(seconds=lognormal_seconds(rng, cfg.triage_seconds_median / skill))
        self._action(analyst, inc, ActionType.TRIAGE, t, rng)
        done.append("TRIAGE")

        # INVESTIGATION (critical + high always investigated in healthy baseline)
        skip_investigation = (
            profile is not None
            and inc.severity in (Severity.HIGH, Severity.CRITICAL)
            and rng.random() < profile.closure_without_investigation_rate
        )
        investigation_exists = True
        if not skip_investigation:
            inv_minutes = rng.uniform(cfg.investigation_minutes_min, cfg.investigation_minutes_max) \
                / (skill ** 0.5)
            t += timedelta(minutes=inv_minutes)
            evidence = rng.randint(2, 15)
            notes = f"Investigated {inc.severity.value} incident"
            if profile is not None and rng.random() > profile.investigation_note_probability:
                notes = ""  # documentation gap: closed without written findings
            self.investigations.append(Investigation(
                investigation_id=self.world.next_id("INV"), incident_id=inc.incident_id,
                analyst_id=analyst.analyst_id, started_at=t,
                completed_at=t + timedelta(minutes=rng.uniform(10, inv_minutes)),
                status=InvestigationStatus.COMPLETED, evidence_count=evidence,
                notes=notes))
            self._action(analyst, inc, ActionType.INVESTIGATION_START, t, rng)
            done.append("INVESTIGATION")
        else:
            investigation_exists = False

        # ESCALATION — only critical incidents escalate in healthy baseline
        escalation_expected = "ESCALATION" in expected
        escalation_done = False
        if escalation_expected:
            escalate = True
            if profile is not None:
                escalate = rng.random() < profile.escalation_completeness
            if escalate:
                t2 = t + timedelta(minutes=rng.uniform(2, 12))
                seniors = [a for a in self.world.analysts_of(inc.soc_id)
                           if a.role in ("TIER3", "SUPERVISOR")] or [analyst]
                esc_to = self.rng.choice(seniors)
                esc_status = EscalationStatus.RESOLVED
                if profile is not None and rng.random() > profile.supervisor_signoff_probability:
                    esc_status = EscalationStatus.PENDING  # sign-off adherence gap
                self.escalations.append(Escalation(
                    escalation_id=self.world.next_id("ESC"), incident_id=inc.incident_id,
                    analyst_id=analyst.analyst_id, escalated_to=esc_to.analyst_id,
                    reason=f"{inc.severity.value} severity requires senior review",
                    timestamp=t2, status=esc_status))
                self._action(analyst, inc, ActionType.ESCALATION, t2, rng)
                inc.status = IncidentStatus.ESCALATED
                done.append("ESCALATION")
                escalation_done = True

        # RESPONSE
        t += timedelta(minutes=rng.uniform(5, 30))
        self._action(analyst, inc, ActionType.RESPONSE, t, rng)
        done.append("RESPONSE")

        # CLOSURE — log-normal around configured median, faster for skilled analysts;
        # maturity profiles slow (backlog-heavy) or accelerate (closure-gaming) velocity.
        velocity_mult = profile.closure_velocity_multiplier if profile is not None else 1.0
        close_min = lognormal_seconds(rng, cfg.closure_minutes_median * 60) / (skill ** 0.4)
        close_min *= velocity_mult
        t += timedelta(seconds=close_min)
        inc.closed_at = t
        inc.status = IncidentStatus.CLOSED
        for aid in inc.alert_ids:
            al = next(a for a in self.alerts if a.alert_id == aid)
            al.status = AlertStatus.CLOSED
            al.closed_at = t
        self._action(analyst, inc, ActionType.CLOSURE, t, rng)
        done.append("CLOSURE")

        # REOPEN — resilience indicator: unresolved root cause resurfaces (profile-driven)
        if profile is not None and rng.random() < profile.reopen_probability:
            done.append("REOPEN")

        self.traces[inc.incident_id] = WorkflowTrace(
            incident_id=inc.incident_id, severity=inc.severity,
            analyst_id=analyst.analyst_id, soc_id=inc.soc_id, created_at=inc.created_at,
            closed_at=inc.closed_at, actions_done=done, expected_actions=expected,
            investigation_exists=investigation_exists,
            escalation_exists=escalation_done)

    def _action(self, analyst, inc: Incident, atype: ActionType, ts: datetime,
                rng: random.Random, metadata: dict | None = None) -> None:
        self.actions.append(AnalystAction(
            action_id=self.world.next_id("ACT"), analyst_id=analyst.analyst_id,
            soc_id=inc.soc_id, incident_id=inc.incident_id, action_type=atype.value,
            timestamp=ts, duration_seconds=rng.randint(20, 900), metadata=metadata or {}))

    # -- stats helpers -------------------------------------------------------
    def mean_closure_minutes(self) -> float:
        deltas = [(i.closed_at - i.created_at).total_seconds() / 60
                  for i in self.incidents if i.closed_at]
        return round(statistics.mean(deltas), 1) if deltas else 0.0
