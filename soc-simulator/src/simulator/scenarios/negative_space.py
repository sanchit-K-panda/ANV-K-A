"""NEGATIVE_SPACE — expected SOC actions missing across a slice of incidents.

Unlike INVESTIGATION_GAP (critical-only), this removes *varied* expected steps
(evidence collection, response, escalation) from medium/high incidents so the
SOC still appears operational overall.
"""
from __future__ import annotations

import logging

from simulator.scenarios.base import Scenario
from simulator.schemas.enums import Severity

log = logging.getLogger(__name__)

REMOVABLE = ["INVESTIGATION", "ESCALATION", "RESPONSE"]


class NegativeSpaceScenario(Scenario):
    name = "negative_space"

    def inject(self, tel) -> None:
        pool = [i for i in tel.incidents if i.severity in (Severity.MEDIUM, Severity.HIGH)]
        n = int(len(pool) * self.cfg.ns_fraction_affected)
        victims = self.rng.sample(pool, min(n, len(pool))) if pool else []
        if not victims and tel.incidents:  # guarantee ≥1 injection at any scale
            victims = [self.rng.choice(tel.incidents)]

        for inc in victims:
            trace = tel.traces[inc.incident_id]
            # choose which expected steps silently never happened
            missing = [step for step in REMOVABLE if step in trace.expected_actions
                       and self.rng.random() < 0.5] or ["INVESTIGATION"]
            if "INVESTIGATION" in missing:
                tel.investigations = [iv for iv in tel.investigations
                                      if iv.incident_id != inc.incident_id]
            if "ESCALATION" in missing:
                tel.escalations = [es for es in tel.escalations
                                   if es.incident_id != inc.incident_id]
            drop = {"INVESTIGATION": "INVESTIGATION_START", "ESCALATION": "ESCALATION",
                    "RESPONSE": "RESPONSE"}
            tel.actions = [a for a in tel.actions
                           if not (a.incident_id == inc.incident_id
                                   and a.action_type in {drop[m] for m in missing})]
            trace.actions_done = [a for a in trace.actions_done if a not in missing]
            self.gt.add(
                entity_type="incident", entity_id=inc.incident_id,
                expected_behaviour={"workflow": trace.expected_actions},
                actual_behaviour={"actions_done": trace.actions_done,
                                  "missing_actions": missing},
                expected_findings=["NEGATIVE_SPACE"],
                severity=Severity.HIGH, start_time=inc.created_at, end_time=inc.closed_at)
        log.info("Injected negative space into %d/%d medium/high incidents",
                 len(victims), len(pool))
