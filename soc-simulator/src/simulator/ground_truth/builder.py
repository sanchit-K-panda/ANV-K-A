"""Ground-truth builder: collects expected-vs-actual records for injected abnormalities."""
from __future__ import annotations

from datetime import datetime

from simulator.schemas.entities import GroundTruthEntry
from simulator.schemas.enums import Severity


class GroundTruthBuilder:
    """Accumulates ground-truth entries during scenario generation.

    The simulator NEVER labels healthy behaviour as a finding — entries are only
    added when a scenario explicitly injects an abnormality.
    """

    def __init__(self, scenario_id: str):
        self.scenario_id = scenario_id
        self._entries: list[GroundTruthEntry] = []

    def add(self, entity_type: str, entity_id: str,
            expected_behaviour: dict, actual_behaviour: dict,
            expected_findings: list[str], severity: Severity = Severity.HIGH,
            start_time: datetime | None = None, end_time: datetime | None = None) -> None:
        self._entries.append(GroundTruthEntry(
            truth_id=f"GT-{len(self._entries) + 1:04d}", scenario_id=self.scenario_id,
            entity_type=entity_type, entity_id=entity_id,
            expected_behaviour=expected_behaviour, actual_behaviour=actual_behaviour,
            expected_findings=expected_findings, severity=severity, injected=True,
            start_time=start_time, end_time=end_time))

    def entries(self) -> list[GroundTruthEntry]:
        return self._entries

    def __len__(self) -> int:
        return len(self._entries)
