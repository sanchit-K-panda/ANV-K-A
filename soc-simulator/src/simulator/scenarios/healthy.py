"""HEALTHY scenario — properly functioning SOC baseline, no injections."""
from __future__ import annotations

import logging

from simulator.scenarios.base import Scenario

log = logging.getLogger(__name__)


class HealthyScenario(Scenario):
    name = "healthy"

    def inject(self, tel) -> None:
        # No abnormalities injected. Ground truth stays empty by design:
        # a healthy dataset must produce zero findings.
        log.info("Healthy scenario: no injections, ground truth empty")
