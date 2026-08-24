"""RECURRING_THREAT — one threat repeatedly spawns incidents that get closed
without effective remediation."""
from __future__ import annotations

import logging

from simulator.scenarios.base import Scenario
from simulator.schemas.enums import Severity

log = logging.getLogger(__name__)


class RecurringThreatScenario(Scenario):
    name = "recurring_threat"

    def inject(self, tel) -> None:
        # Pick an existing threat and force it to recur across incidents.
        threat = self.rng.choice(self.world.threats)
        threat.status = "UNRESOLVED"
        threat.last_seen = self.world.end
        candidates = [i for i in tel.incidents if i.severity in (Severity.HIGH, Severity.CRITICAL)]
        k = min(self.cfg.recurrence_count, len(candidates))
        victims = self.rng.sample(candidates, k) if k else []
        for inc in victims:
            inc.threat_ids = [threat.threat_id]
            # closed but never remediated: no post-closure evidence of fix
            tel.actions.append(type(tel.actions[0])(
                action_id=self.world.next_id("ACT"),
                analyst_id=inc.assigned_analyst_id, soc_id=inc.soc_id,
                incident_id=inc.incident_id, action_type="CLOSURE",
                timestamp=inc.closed_at or inc.created_at,
                duration_seconds=self.rng.randint(30, 300),
                metadata={"closure_reason": "resolved", "remediation_applied": False}))
        self.gt.add(
            entity_type="threat", entity_id=threat.threat_id,
            expected_behaviour={"recurrence_after_remediation": 0,
                                "status_after_first_closure": "MITIGATED"},
            actual_behaviour={
                "incident_count": len(victims),
                "incident_ids": [i.incident_id for i in victims],
                "all_closed": True, "any_remediated": False},
            expected_findings=["RECURRING_THREAT", "REPEATED_UNRESOLVED_THREAT"],
            severity=Severity.CRITICAL,
            start_time=self.world.start, end_time=self.world.end)
        log.info("Injected recurring threat %s across %d incidents",
                 threat.threat_id, len(victims))
