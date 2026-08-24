"""Scenario registry — maps scenario names to classes."""
from __future__ import annotations

from simulator.config import SimConfig
from simulator.scenarios.analyst_overload import AnalystOverloadScenario
from simulator.scenarios.base import Scenario
from simulator.scenarios.healthy import HealthyScenario
from simulator.scenarios.identity_anomaly import IdentityAnomalyScenario
from simulator.scenarios.investigation_gap import InvestigationGapScenario
from simulator.scenarios.kpi_manipulation import KpiManipulationScenario
from simulator.scenarios.negative_space import NegativeSpaceScenario
from simulator.scenarios.recurring_threat import RecurringThreatScenario
from simulator.schemas.enums import ScenarioName

REGISTRY: dict[str, type[Scenario]] = {
    ScenarioName.HEALTHY: HealthyScenario,
    ScenarioName.INVESTIGATION_GAP: InvestigationGapScenario,
    ScenarioName.NEGATIVE_SPACE: NegativeSpaceScenario,
    ScenarioName.KPI_MANIPULATION: KpiManipulationScenario,
    ScenarioName.ANALYST_OVERLOAD: AnalystOverloadScenario,
    ScenarioName.RECURRING_THREAT: RecurringThreatScenario,
    ScenarioName.IDENTITY_ANOMALY: IdentityAnomalyScenario,
}


def build_scenario(name: str, cfg: SimConfig) -> Dataset:  # noqa: F821
    from simulator.schemas.entities import Dataset
    cls = REGISTRY[ScenarioName(name)]
    return cls(cfg).build()
