"""ANALYST_OVERLOAD — one analyst receives a disproportionate share of critical cases."""
from __future__ import annotations

import logging
import statistics
from datetime import timedelta

from simulator.scenarios.base import Scenario
from simulator.schemas.enums import Severity

log = logging.getLogger(__name__)


class AnalystOverloadScenario(Scenario):
    name = "analyst_overload"

    def inject(self, tel) -> None:
        # Pick the SOC with the critical incidents to ensure realistic overload
        soc_crit_counts = {s.soc_id: len([i for i in tel.incidents if i.severity == Severity.CRITICAL and i.soc_id == s.soc_id]) for s in self.world.socs}
        soc = max(soc_crit_counts, key=soc_crit_counts.get) if any(soc_crit_counts.values()) else self.world.socs[0].soc_id
        analysts = [a for a in self.world.analysts_of(soc) if a.role != "SUPERVISOR"]
        dominant = self.rng.choice(analysts)
        others = [a for a in analysts if a.analyst_id != dominant.analyst_id]
        criticals = [i for i in tel.incidents if i.severity == Severity.CRITICAL
                     and i.soc_id == soc]

        # Reassign critical incidents: dominant share to `dominant`, rest spread.
        n_dom = max(1, int(len(criticals) * self.cfg.overload_dominant_share)) if criticals else 0
        picked = set(i.incident_id for i in self.rng.sample(
            criticals, min(n_dom, len(criticals)))) if criticals else set()
        other_ids = [a.analyst_id for a in others] or [dominant.analyst_id]
        oi = 0
        for inc in criticals:
            if inc.incident_id in picked:
                inc.assigned_analyst_id = dominant.analyst_id
                tel.traces[inc.incident_id].analyst_id = dominant.analyst_id
                for iv in tel.investigations:
                    if iv.incident_id == inc.incident_id:
                        iv.analyst_id = dominant.analyst_id
                for act in tel.actions:
                    if act.incident_id == inc.incident_id:
                        act.analyst_id = dominant.analyst_id
                # overloaded → slower investigations/closures
                delay = timedelta(minutes=self.rng.uniform(30, 90))
                if inc.closed_at:
                    inc.closed_at += delay
                    tel.traces[inc.incident_id].closed_at = inc.closed_at
            else:
                assignee = other_ids[oi % len(other_ids)]
                oi += 1
                inc.assigned_analyst_id = assignee

        actual_counts = {aid: sum(1 for i in criticals if i.assigned_analyst_id == aid)
                         for aid in {a.analyst_id for a in analysts}}
        total = max(sum(actual_counts.values()), 1)
        expected_share = round(1.0 / len(analysts), 3)
        self.gt.add(
            entity_type="analyst", entity_id=dominant.analyst_id,
            expected_behaviour={
                "critical_case_share": {"expected_uniform": True,
                                        "per_analyst_share": expected_share},
                "distribution": "uniform"},
            actual_behaviour={
                "critical_cases_total": total,
                "dominant_share": round(actual_counts[dominant.analyst_id] / total, 3),
                "mean_other_share": round(statistics.mean(
                    v / total for k, v in actual_counts.items()
                    if k != dominant.analyst_id) if len(actual_counts) > 1 else 0.0, 4),
                "affected_incident_ids": [i.incident_id for i in criticals
                                          if i.assigned_analyst_id == dominant.analyst_id]},
            expected_findings=["WORKLOAD_IMBALANCE", "ANALYST_BOTTLENECK"],
            severity=Severity.HIGH,
            start_time=self.world.start, end_time=self.world.end)
        log.info("Injected overload: %s now holds %.0f%% of %d critical cases",
                 dominant.analyst_id, 100 * actual_counts[dominant.analyst_id] / total,
                 len(criticals))
