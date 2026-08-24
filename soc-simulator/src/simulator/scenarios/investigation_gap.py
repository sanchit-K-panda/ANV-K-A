"""INVESTIGATION_GAP — critical incidents closed without the expected investigation."""
from __future__ import annotations

import logging

from simulator.scenarios.base import Scenario
from simulator.schemas.enums import Severity

log = logging.getLogger(__name__)


class InvestigationGapScenario(Scenario):
    name = "investigation_gap"

    def inject(self, tel) -> None:
        criticals = [i for i in tel.incidents if i.severity == Severity.CRITICAL]
        n = int(len(criticals) * self.cfg.ig_fraction_critical)
        victims = self.rng.sample(criticals, min(n, len(criticals))) if criticals else []
        # Guarantee at least one injection so the scenario is always satisfiable.
        if not victims:
            pool = [i for i in tel.incidents if i.severity == Severity.HIGH] or tel.incidents
            if pool:
                victims = [self.rng.choice(pool)]
                victims[0].severity = Severity.CRITICAL
        victim_ids = {i.incident_id for i in victims}

        # Remove investigation/escalation/response records for chosen incidents;
        # keep them closed (that is the violation: closed without investigation).
        tel.investigations = [iv for iv in tel.investigations if iv.incident_id not in victim_ids]
        tel.escalations = [es for es in tel.escalations if es.incident_id not in victim_ids]
        for act in tel.actions:
            if act.incident_id in victim_ids and act.action_type in (
                    "INVESTIGATION_START", "ESCALATION", "RESPONSE"):
                act.metadata = act.metadata | {"removed_by_scenario": True}
        tel.actions = [a for a in tel.actions if not a.metadata.get("removed_by_scenario")]

        for inc in victims:
            trace = tel.traces[inc.incident_id]
            missing = [a for a in trace.expected_actions
                       if a in ("INVESTIGATION", "ESCALATION", "RESPONSE")]
            self.gt.add(
                entity_type="incident", entity_id=inc.incident_id,
                expected_behaviour={"workflow": trace.expected_actions,
                                    "investigation_required": True,
                                    "escalation_required": True},
                actual_behaviour={"actions_done": ["TRIAGE", "CLOSURE"],
                                  "investigation_exists": False,
                                  "escalation_exists": False},
                expected_findings=["EXECUTION_GAP", "NEGATIVE_SPACE",
                                   "CLOSURE_WITHOUT_INVESTIGATION"],
                severity=Severity.CRITICAL,
                start_time=inc.created_at, end_time=inc.closed_at)
        log.info("Injected investigation gap into %d/%d critical incidents",
                 len(victims), len(criticals))
