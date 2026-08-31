"""Phase 4 — Execution Gap Engine.

Deterministic workflow violation detection engine.
Compares the expected SOC workflow (Alert -> Triage -> Investigation -> Escalation -> Response -> Closure)
against actual executed actions to catch critical security incidents closed without required procedure.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import FeatureExtractor, IncidentTraceFeatures
from ml.schemas import FindingSeverity, FindingType, RawFinding


class ExecutionGapEngine:
    """Detects mandatory workflow action omissions on critical and high security incidents."""

    def __init__(self, critical_investigation_mandatory: bool = True, critical_escalation_mandatory: bool = True):
        self.critical_investigation_mandatory = critical_investigation_mandatory
        self.critical_escalation_mandatory = critical_escalation_mandatory

    def analyze(
        self, dataset: LoadedDataset, traces: Optional[Dict[str, IncidentTraceFeatures]] = None
    ) -> List[RawFinding]:
        if traces is None:
            traces = FeatureExtractor.extract_incident_traces(dataset)

        findings: List[RawFinding] = []

        for inc_id, trace in traces.items():
            # Rule 1: CRITICAL or HIGH incident closed without investigation
            if trace.severity in ("CRITICAL", "HIGH") and trace.has_closure and not trace.has_investigation:
                sev = FindingSeverity.CRITICAL if trace.severity == "CRITICAL" else FindingSeverity.HIGH
                
                missing_workflow = [s for s in ["INVESTIGATION", "ESCALATION", "RESPONSE"] if s in trace.missing_actions]
                
                finding = RawFinding(
                    engine_name="ExecutionGapEngine",
                    finding_type=FindingType.EXECUTION_GAP,
                    severity=sev,
                    confidence=0.98,
                    title=f"Execution Gap: {trace.severity} incident {inc_id} closed without investigation",
                    description=(
                        f"Incident {inc_id} ({trace.severity}) was marked closed/resolved by analyst "
                        f"{trace.assigned_analyst_id or 'Unknown'} without any corresponding investigation record or "
                        f"evidence collection."
                    ),
                    entity_type="incident",
                    entity_id=inc_id,
                    affected_ids=[inc_id],
                    timestamp=trace.closed_at or trace.created_at,
                    evidence={
                        "incident_id": inc_id,
                        "severity": trace.severity,
                        "assigned_analyst_id": trace.assigned_analyst_id,
                        "created_at": trace.created_at.isoformat() if trace.created_at else None,
                        "closed_at": trace.closed_at.isoformat() if trace.closed_at else None,
                        "closure_minutes": trace.closure_minutes,
                        "expected_actions": trace.expected_actions,
                        "actual_actions": trace.actions_done,
                        "missing_actions": missing_workflow or ["INVESTIGATION"],
                        "investigation_exists": False,
                        "escalation_exists": trace.has_escalation,
                        "violation_type": "CLOSURE_WITHOUT_INVESTIGATION",
                    },
                    baseline_metrics={
                        "expected_investigation_required": True,
                        "expected_workflow": trace.expected_actions,
                    },
                    observed_metrics={
                        "investigation_exists": False,
                        "actions_executed": trace.actions_done,
                        "missing_actions": missing_workflow,
                    },
                    recommended_action=(
                        f"Immediately reopen incident {inc_id} for mandatory formal investigation, "
                        f"collect forensic artifacts, and review analyst {trace.assigned_analyst_id} adherence."
                    ),
                )
                findings.append(finding)

            # Rule 2: CRITICAL incident with investigation, but completely missing escalation and response
            elif (
                trace.severity == "CRITICAL"
                and trace.has_closure
                and not trace.has_escalation
                and not trace.has_response
                and self.critical_escalation_mandatory
            ):
                finding = RawFinding(
                    engine_name="ExecutionGapEngine",
                    finding_type=FindingType.EXECUTION_GAP,
                    severity=FindingSeverity.HIGH,
                    confidence=0.92,
                    title=f"Execution Gap: Critical incident {inc_id} closed without escalation or response",
                    description=(
                        f"Critical incident {inc_id} reached closure without recorded escalation to Tier-2/3 "
                        f"or active threat response actions."
                    ),
                    entity_type="incident",
                    entity_id=inc_id,
                    affected_ids=[inc_id],
                    timestamp=trace.closed_at or trace.created_at,
                    evidence={
                        "incident_id": inc_id,
                        "severity": trace.severity,
                        "assigned_analyst_id": trace.assigned_analyst_id,
                        "expected_actions": trace.expected_actions,
                        "actual_actions": trace.actions_done,
                        "missing_actions": ["ESCALATION", "RESPONSE"],
                    },
                    baseline_metrics={"expected_escalation_required": True},
                    observed_metrics={"escalation_exists": False, "response_exists": False},
                    recommended_action=f"Review incident {inc_id} escalation triggers and verify remediation status.",
                )
                findings.append(finding)

        return findings
