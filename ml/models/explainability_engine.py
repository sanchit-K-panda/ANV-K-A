"""Phase 9 — Explainability Engine & Unified Supervisory Pipeline.

Guarantees the non-negotiable 7-part explainability contract (Architecture.md §6, Rules.md §6):
WHAT, WHY (baseline vs observed), WHEN, WHERE, EVIDENCE, CONFIDENCE, RECOMMENDATION.
Combines all detection engines into a unified Supervisory Analytics Pipeline.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from ml.anomaly.execution_gap import ExecutionGapEngine
from ml.anomaly.negative_space import NegativeSpaceEngine
from ml.anomaly.workload import WorkloadEngine
from ml.behaviour.isolation_forest import BehavioralIsolationForest
from ml.behaviour.kpi_manipulation import KpiManipulationEngine
from ml.biometric.continuous_monitor import ContinuousIdentityMonitor
from ml.models.correlation_engine import CorrelatedFindingGroup, CorrelationEngine
from ml.models.registry import ModelRegistry, TrainedBehaviourModels
from ml.models.risk_engine import RiskEngine
from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import AnalystFeatures, FeatureExtractor, IncidentTraceFeatures
from ml.recurrence.threat_recurrence import ThreatRecurrenceEngine
from ml.schemas import (
    ExplainabilityCard,
    FindingOutput,
    FindingSeverity,
    FindingStatus,
    FindingType,
    RawFinding,
    utc_now,
)


class ExplainabilityEngine:
    """Generates structured 7-part explainability cards for correlated supervisory findings."""

    @staticmethod
    def build_explainability_card(group: CorrelatedFindingGroup) -> ExplainabilityCard:
        primary = group.detections[0]

        # WHAT: Concise description of the operational breakdown
        what_text = primary.title

        # WHY: Clear baseline vs observed delta
        why_parts = []
        for det in group.detections:
            b = det.baseline_metrics
            o = det.observed_metrics
            if b and o:
                b_str = ", ".join(f"{k}={v}" for k, v in b.items())
                o_str = ", ".join(f"{k}={v}" for k, v in o.items())
                why_parts.append(f"[{det.engine_name}] Expected ({b_str}) vs Observed ({o_str})")
            else:
                why_parts.append(det.description)

        why_text = " | ".join(why_parts) if why_parts else primary.description

        # WHEN: Timestamp of earliest detection or occurrence
        when_time = primary.timestamp or utc_now()

        # WHERE: Entity domain (SOC / Asset / Incident / Analyst)
        where_text = f"{primary.entity_type.upper()}:{primary.entity_id}"
        if len(group.affected_ids) > 1:
            where_text += f" (Scope: {len(group.affected_ids)} affected items)"

        # EVIDENCE: Comprehensive structured payload
        consolidated_evidence = {
            "primary_entity": {"type": primary.entity_type, "id": primary.entity_id},
            "affected_entities": list(group.affected_ids),
            "corroborating_detections": [
                {
                    "engine": d.engine_name,
                    "type": d.finding_type.value,
                    "severity": d.severity.value,
                    "confidence": d.confidence,
                    "evidence": d.evidence,
                }
                for d in group.detections
            ],
        }

        # CONFIDENCE
        confidence_val = round(group.confidence, 3)

        # RECOMMENDATION
        recommendations = [d.recommended_action for d in group.detections if d.recommended_action]
        rec_text = (
            " ".join(dict.fromkeys(recommendations))
            if recommendations
            else f"Review operational logs for {where_text} and take corrective action."
        )

        return ExplainabilityCard(
            what=what_text,
            why=why_text,
            when=when_time,
            where=where_text,
            evidence=consolidated_evidence,
            confidence=confidence_val,
            recommendation=rec_text,
        )


class SupervisoryAnalyticsPipeline:
    """Master analytical pipeline orchestrating all Person 1 AI/Data engines.

    When trained behaviour artifacts exist (ml/models/artifacts/, committed for
    air-gapped deployments) they are loaded automatically and used by the
    behavioural detector; otherwise the pipeline falls back to per-cohort
    statistical fitting. Pass `auto_load=False` plus explicit `trained_models`
    to control the model set manually (tests, benchmarks, A/B).
    """

    def __init__(
        self,
        trained_models: Optional[TrainedBehaviourModels] = None,
        auto_load: bool = True,
    ):
        self.exec_gap_engine = ExecutionGapEngine()
        self.negative_space_engine = NegativeSpaceEngine()
        self.workload_engine = WorkloadEngine()
        self.kpi_engine = KpiManipulationEngine()
        self.isolation_forest = BehavioralIsolationForest()
        self.recurrence_engine = ThreatRecurrenceEngine()
        self.identity_monitor = ContinuousIdentityMonitor()
        self.correlation_engine = CorrelationEngine()
        if trained_models is None and auto_load:
            trained_models = ModelRegistry().load()
        self.trained_models = trained_models

    def run(self, dataset: LoadedDataset) -> List[FindingOutput]:
        """Runs all detection engines, correlates outputs, computes risks, and renders explainable findings."""
        # 1. Feature Extraction
        traces = FeatureExtractor.extract_incident_traces(dataset)
        analyst_map = FeatureExtractor.extract_analyst_features(dataset, traces)

        # 2. Run all individual detection engines
        raw_detections: List[RawFinding] = []

        # Phase 4: Execution Gap
        raw_detections.extend(self.exec_gap_engine.analyze(dataset, traces))

        # Phase 5: Negative Space
        raw_detections.extend(self.negative_space_engine.analyze(dataset, traces))

        # Phase 4/7: Workload
        raw_detections.extend(self.workload_engine.analyze(dataset, traces, analyst_map))

        # Phase 6: KPI Manipulation
        raw_detections.extend(self.kpi_engine.analyze(dataset, traces, analyst_map))

        # Phase 6: Unsupervised Isolation Forest (trained artifacts used when available)
        raw_detections.extend(
            self.isolation_forest.analyze_analysts(dataset, analyst_map, trained=self.trained_models)
        )

        # Phase 7: Threat Recurrence
        raw_detections.extend(self.recurrence_engine.analyze(dataset))

        # Phase 11: Biometric & Identity Monitoring
        raw_detections.extend(self.identity_monitor.analyze(dataset))

        # 3. Correlate detections
        correlated_groups = self.correlation_engine.correlate(raw_detections)

        # 4. Score Risk and Assemble Final Explainable Findings
        final_findings: List[FindingOutput] = []

        for group in correlated_groups:
            # Calculate additive risk
            risk_result = RiskEngine.calculate_risk(
                primary_type=group.primary_type,
                severity=group.severity,
                confidence=group.confidence,
                detections=group.detections,
            )

            # Build 7-part explainability card
            explainability_card = ExplainabilityEngine.build_explainability_card(group)

            finding = FindingOutput(
                type=group.primary_type,
                severity=group.severity,
                status=FindingStatus.OPEN,
                confidence=group.confidence,
                title=group.title,
                description=group.description,
                entity_type=group.entity_type,
                entity_id=group.entity_id,
                affected_ids=list(group.affected_ids),
                created_at=explainability_card.when,
                explainability=explainability_card,
                risk=risk_result,
                raw_detections=group.detections,
            )
            final_findings.append(finding)

        # Sort findings by risk score descending
        final_findings.sort(key=lambda f: f.risk.score, reverse=True)
        return final_findings
