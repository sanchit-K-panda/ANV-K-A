"""KPI_MANIPULATION — a subset of analysts closes incidents suspiciously fast
with investigation/escalation evidence dropping. Ground truth says
POTENTIAL_KPI_MANIPULATION (not 'malicious') so ANVĪKṢA must discover it."""
from __future__ import annotations

import logging

from simulator.scenarios.base import Scenario
from simulator.schemas.enums import Severity

log = logging.getLogger(__name__)


class KpiManipulationScenario(Scenario):
    name = "kpi_manipulation"

    def inject(self, tel) -> None:
        soc = self.rng.choice(self.world.socs).soc_id
        tier12 = [a for a in self.world.analysts_of(soc) if a.role in ("TIER1", "TIER2")]
        n = max(1, int(len(tier12) * self.cfg.kpi_fraction_analysts))
        manipulators = {a.analyst_id for a in self.rng.sample(tier12, min(n, len(tier12)))}
        affected = [i for i in tel.incidents if i.assigned_analyst_id in manipulators]

        for inc in affected:
            trace = tel.traces[inc.incident_id]
            # Compress the timeline: near-instant closure after triage.
            from datetime import timedelta
            new_close = inc.created_at + timedelta(
                seconds=self.rng.uniform(60, self.cfg.kpi_closure_minutes * 60 * 2))
            # keep timeline coherent: strip investigations that would start after closure
            tel.investigations = [iv for iv in tel.investigations
                                  if not (iv.incident_id == inc.incident_id
                                          and iv.started_at >= new_close)]
            inc.closed_at = new_close
            inc.status = inc.status  # still closed/resolved — looks productive
            for aid in inc.alert_ids:
                al = next(a for a in tel.alerts if a.alert_id == aid)
                al.closed_at = new_close
            # Strip most investigations/escalations for these incidents.
            if self.rng.random() > self.cfg.kpi_investigation_rate:
                tel.investigations = [iv for iv in tel.investigations
                                      if iv.incident_id != inc.incident_id]
                trace.investigation_exists = False
                trace.actions_done = [x for x in trace.actions_done if x != "INVESTIGATION"]
            if self.rng.random() > self.cfg.kpi_escalation_rate:
                tel.escalations = [es for es in tel.escalations
                                   if es.incident_id != inc.incident_id]
                trace.escalation_exists = False
                trace.actions_done = [x for x in trace.actions_done if x != "ESCALATION"]
            tel.actions = [a for a in tel.actions
                           if not (a.incident_id == inc.incident_id
                                   and a.action_type in ("RESPONSE",))]
            trace.actions_done = [x for x in trace.actions_done if x != "RESPONSE"]
            trace.closed_at = new_close

        baseline_rate = len([iv for iv in tel.investigations]) / max(len(affected), 1)
        self.gt.add(
            entity_type="analyst_group", entity_id=",".join(sorted(manipulators)) or "none",
            expected_behaviour={
                "avg_closure_minutes": self.cfg.closure_minutes_median,
                "investigation_rate": "> 0.80", "escalation_rate_for_critical": "> 0.25"},
            actual_behaviour={
                "avg_closure_minutes": round(sum(
                    (i.closed_at - i.created_at).total_seconds() / 60
                    for i in affected if i.closed_at) / max(len(affected), 1), 1),
                "investigation_rate": round(baseline_rate, 3),
                "escalation_rate_injected": self.cfg.kpi_escalation_rate,
                "analyst_count": len(manipulators), "incident_count": len(affected)},
            expected_findings=["POTENTIAL_KPI_MANIPULATION", "CLOSURE_ANOMALY"],
            severity=Severity.HIGH)
        log.info("Injected KPI manipulation: %d analysts, %d incidents",
                 len(manipulators), len(affected))
