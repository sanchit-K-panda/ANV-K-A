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
from simulator.schemas.enums import Severity

log = logging.getLogger(__name__)


class Scenario:
    """Base scenario: builds the healthy baseline; subclasses inject abnormalities.

    Injection contract: subclass hooks run AFTER the healthy workflow exists and may
    remove/alter records, but must record expected-vs-actual in ground truth so the
    truth file always preserves what *should* have happened.
    """
    name = "base"

    def __init__(self, cfg: SimConfig, multi_soc_profiles: bool = False):
        self.cfg = cfg
        self.multi_soc_profiles = multi_soc_profiles
        self.rng = random.Random(cfg.seed)
        self.start = datetime(2026, 8, 1, tzinfo=timezone.utc)
        self.world = World(cfg, self.rng, self.start)
        self.gt = GroundTruthBuilder(self.name)

    def build(self) -> Dataset:
        log.info("Building world (socs=%d events=%d seed=%d profiles=%s)",
                 self.cfg.soc_count, self.cfg.events, self.cfg.seed,
                 self.multi_soc_profiles)
        self.world.build(multi_soc_profiles=self.multi_soc_profiles)
        tel = TelemetryGenerator(self.world)
        tel.generate_events()
        tel.generate_alerts()
        log.info("Baseline: %d alerts, %d incidents", len(tel.alerts), len(tel.incidents))
        self.inject(tel)
        self._record_profile_gaps(tel)
        return self._assemble(tel)

    def _record_profile_gaps(self, tel: TelemetryGenerator) -> None:
        """Record maturity-profile-driven workflow dysfunctions as ground truth.

        Injection contract (class docstring): EVERY deviation the generator introduces
        must land in ground truth, or correct detections count as false positives and
        evaluators disagree (REMEDIATION.md P0-2). Profile degradation (skipped
        investigations/escalations on non-balanced SOCs) is such a deviation. This also
        de-vacuates the healthy scenario: with --soc-profiles, 'healthy' becomes an
        honest multi-SOC baseline where discipline gaps exist and are labelled.
        """
        if not self.multi_soc_profiles or not self.world.profiles:
            return

        # Incidents already covered by scenario-injection GT must not be double-recorded
        # (one GT entry must match exactly one finding or its twin becomes a false FN).
        covered: set[str] = set()
        for entry in self.gt.entries():
            covered.update(part for part in str(entry.entity_id).split(",") if part)

        recorded = 0
        for inc in tel.incidents:
            if inc.incident_id in covered:
                continue
            profile = self.world.profiles.get(inc.soc_id)
            if profile is None or profile.profile_id == "balanced":
                continue
            if inc.closed_at is None:
                continue  # profile gaps are about skipped steps on processed incidents
            # Derive missing steps from FINAL telemetry — scenario inject() hooks run
            # before this method and may add/remove records (e.g. fabricated
            # investigations), so any trace snapshot taken during generation is stale
            # and would label intents instead of reality (REMEDIATION.md P0-2).
            missing = self._missing_workflow_steps(tel, inc)
            if not missing:
                continue
            expected_findings: list[str] = []
            if "INVESTIGATION" in missing and inc.severity in (Severity.HIGH, Severity.CRITICAL):
                expected_findings += ["EXECUTION_GAP", "CLOSURE_WITHOUT_INVESTIGATION"]
            if "ESCALATION" in missing or "RESPONSE" in missing or (
                "INVESTIGATION" in missing and not expected_findings
            ):
                expected_findings += ["NEGATIVE_SPACE"]
            self.gt.add(
                entity_type="incident",
                entity_id=inc.incident_id,
                expected_behaviour={
                    "workflow": self._expected_workflow(inc),
                    "soc_maturity_profile": profile.profile_id,
                },
                actual_behaviour={
                    "actions_done": sorted(self._done_steps(tel, inc)),
                    "missing_actions": missing,
                },
                expected_findings=expected_findings,
                severity=Severity.HIGH,
                start_time=inc.created_at,
                end_time=inc.closed_at,
            )
            recorded += 1
        if recorded:
            log.info("Recorded %d profile-driven workflow gaps in ground truth", recorded)

    @staticmethod
    def _expected_workflow(inc) -> list[str]:
        """Expected workflow per severity — MUST mirror the ML extractor's expectation
        (ml/preprocessing/feature_extraction.py) so GT and detections agree by
        construction rather than by coincidence."""
        if inc.severity == Severity.CRITICAL:
            return ["TRIAGE", "INVESTIGATION", "ESCALATION", "RESPONSE", "CLOSURE"]
        if inc.severity == Severity.HIGH:
            return ["TRIAGE", "INVESTIGATION", "RESPONSE", "CLOSURE"]
        return ["TRIAGE", "INVESTIGATION", "CLOSURE"]

    @staticmethod
    def _done_steps(tel: TelemetryGenerator, inc) -> set[str]:
        done: set[str] = set()
        for a in tel.actions:
            if a.incident_id != inc.incident_id:
                continue
            at = str(a.action_type)
            if at == "TRIAGE":
                done.add("TRIAGE")
            elif at in ("INVESTIGATION_START", "INVESTIGATION", "EVIDENCE_COLLECTION"):
                done.add("INVESTIGATION")
            elif at == "ESCALATION":
                done.add("ESCALATION")
            elif at == "RESPONSE":
                done.add("RESPONSE")
            elif at == "CLOSURE":
                done.add("CLOSURE")
        if any(i.incident_id == inc.incident_id for i in tel.investigations):
            done.add("INVESTIGATION")
        if any(e.incident_id == inc.incident_id for e in tel.escalations):
            done.add("ESCALATION")
        if inc.closed_at is not None:
            done.add("CLOSURE")
        return done

    def _missing_workflow_steps(self, tel: TelemetryGenerator, inc) -> list[str]:
        expected = self._expected_workflow(inc)
        done = self._done_steps(tel, inc)
        return [step for step in expected if step not in done]

    def inject(self, tel: TelemetryGenerator) -> None:
        """Override in subclasses to inject abnormalities + ground truth."""

    def _assemble(self, tel: TelemetryGenerator) -> Dataset:
        meta = DatasetMetadata(
            dataset_id=f"DS-{self.name.upper()}-{self.cfg.seed}",
            scenario=self.name, seed=self.cfg.seed,
            generated_at=datetime.now(timezone.utc),
            config=self.cfg.__dict__ | {
                "scenario": str(self.name),
                "multi_soc_profiles": self.multi_soc_profiles,
            },
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
