"""Scenario base class. A scenario builds a full Dataset for one named scenario."""
from __future__ import annotations

import logging
import random
from datetime import datetime, timezone

from simulator.config import SimConfig
from simulator.generators.telemetry import TelemetryGenerator
from simulator.generators.world import World
from simulator.ground_truth.builder import GroundTruthBuilder
from simulator.schemas.entities import Dataset, DatasetMetadata

log = logging.getLogger(__name__)


class Scenario:
    """Base scenario: builds the healthy baseline; subclasses inject abnormalities.

    Injection contract: subclass hooks run AFTER the healthy workflow exists and may
    remove/alter records, but must record expected-vs-actual in ground truth so the
    truth file always preserves what *should* have happened.
    """
    name = "base"

    def __init__(self, cfg: SimConfig):
        self.cfg = cfg
        self.rng = random.Random(cfg.seed)
        self.start = datetime(2026, 8, 1, tzinfo=timezone.utc)
        self.world = World(cfg, self.rng, self.start)
        self.gt = GroundTruthBuilder(self.name)

    def build(self) -> Dataset:
        log.info("Building world (socs=%d events=%d seed=%d)",
                 self.cfg.soc_count, self.cfg.events, self.cfg.seed)
        self.world.build()
        tel = TelemetryGenerator(self.world)
        tel.generate_events()
        tel.generate_alerts()
        log.info("Baseline: %d alerts, %d incidents", len(tel.alerts), len(tel.incidents))
        self.inject(tel)
        return self._assemble(tel)

    def inject(self, tel: TelemetryGenerator) -> None:
        """Override in subclasses to inject abnormalities + ground truth."""

    def _assemble(self, tel: TelemetryGenerator) -> Dataset:
        meta = DatasetMetadata(
            dataset_id=f"DS-{self.name.upper()}-{self.cfg.seed}",
            scenario=self.name, seed=self.cfg.seed,
            generated_at=datetime.now(timezone.utc),
            config=self.cfg.__dict__ | {"scenario": str(self.name)},
            soc_count=len(self.world.socs), analyst_count=len(self.world.analysts),
            asset_count=len(self.world.assets), event_count=len(tel.events),
            alert_count=len(tel.alerts), incident_count=len(tel.incidents),
            investigation_count=len(tel.investigations),
            escalation_count=len(tel.escalations), action_count=len(tel.actions),
            ground_truth_count=len(self.gt))
        return Dataset(
            socs=self.world.socs, analysts=self.world.analysts, devices=self.world.devices,
            assets=self.world.assets, threats=self.world.threats, events=tel.events,
            alerts=tel.alerts, incidents=tel.incidents,
            investigations=tel.investigations, escalations=tel.escalations,
            actions=tel.actions, ground_truth=self.gt.entries(), metadata=meta)
