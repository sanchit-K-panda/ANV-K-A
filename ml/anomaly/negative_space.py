"""Phase 5 — Negative Space Engine.

The product's primary differentiator: Detects what SHOULD have happened but DID NOT.
Identifies silent omission of expected workflow steps (investigation, escalation, response, evidence collection)
across incidents that otherwise appear cleanly closed or processed on conventional dashboards.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import FeatureExtractor, IncidentTraceFeatures
from ml.schemas import FindingSeverity, FindingType, RawFinding


class NegativeSpaceEngine:
    """Detects missing expected actions, vanished escalation patterns, and truncated operational lifecycles."""

    def __init__(self, high_severity_threshold: float = 0.5):
        self.high_severity_threshold = high_severity_threshold

    def analyze(
        self, dataset: LoadedDataset, traces: Optional[Dict[str, IncidentTraceFeatures]] = None
    ) -> List[RawFinding]:
        if traces is None:
            traces = FeatureExtractor.extract_incident_traces(dataset)

        findings: List[RawFinding] = []

        for inc_id, trace in traces.items():
            # If incident has missing expected actions
            if trace.missing_actions:
                # Filter out standard non-critical cases that are only missing escalation if not expected
                missing_significant = [
                    step for step in trace.missing_actions if step in ("INVESTIGATION", "ESCALATION", "RESPONSE")
                ]
                
                if not missing_significant:
                    continue

                # Compute omission severity
                if trace.severity == "CRITICAL" or len(missing_significant) >= 2:
                    sev = FindingSeverity.HIGH if trace.severity != "CRITICAL" else FindingSeverity.CRITICAL
                    conf = 0.95
                else:
                    sev = FindingSeverity.MEDIUM if trace.severity == "MEDIUM" else FindingSeverity.HIGH
                    conf = 0.88

                missing_str = ", ".join(missing_significant)
                finding = RawFinding(
                    engine_name="NegativeSpaceEngine",
                    finding_type=FindingType.NEGATIVE_SPACE,
                    severity=sev,
                    confidence=conf,
                    title=f"Negative-Space Anomaly: Missing {missing_str} on incident {inc_id}",
                    description=(
                        f"Analysis of incident {inc_id} ({trace.severity}) reveals {len(missing_significant)} expected "
                        f"workflow actions were silently omitted: [{missing_str}]. Despite being closed, no record of "
                        f"these expected lifecycle transitions exists in operational telemetry."
                    ),
                    entity_type="incident",
                    entity_id=inc_id,
                    affected_ids=[inc_id],
                    timestamp=trace.closed_at or trace.created_at,
                    evidence={
                        "incident_id": inc_id,
                        "severity": trace.severity,
                        "assigned_analyst_id": trace.assigned_analyst_id,
                        "expected_workflow": trace.expected_actions,
                        "actual_workflow": trace.actions_done,
                        "missing_actions": missing_significant,
                        "omission_rate": round(len(missing_significant) / len(trace.expected_actions), 3),
                        "evidence_count": trace.evidence_count,
                    },
                    baseline_metrics={
                        "expected_workflow_steps": trace.expected_actions,
                        "expected_step_count": len(trace.expected_actions),
                    },
                    observed_metrics={
                        "executed_steps": trace.actions_done,
                        "missing_steps": missing_significant,
                        "executed_step_count": len(trace.actions_done),
                    },
                    recommended_action=(
                        f"Investigate why expected lifecycle actions ({missing_str}) were skipped on incident {inc_id}. "
                        f"Verify whether containment and root cause analysis were completed out-of-band."
                    ),
                )
                findings.append(finding)

        return findings
