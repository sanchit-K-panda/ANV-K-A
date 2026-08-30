"""Feature Extraction for ANVĪKṢA Analytics and ML Models."""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from ml.preprocessing.dataset_loader import LoadedDataset, _parse_dt


@dataclass
class AnalystFeatures:
    analyst_id: str
    soc_id: str
    name: str
    role: str
    total_incidents: int = 0
    critical_incidents: int = 0
    high_incidents: int = 0
    closed_incidents: int = 0
    investigated_incidents: int = 0
    escalated_critical_incidents: int = 0
    
    # Computed metrics
    critical_case_share: float = 0.0
    mean_closure_minutes: float = 0.0
    median_closure_minutes: float = 0.0
    investigation_rate: float = 0.0
    escalation_rate_critical: float = 0.0
    total_actions: int = 0
    mean_actions_per_incident: float = 0.0
    closure_durations: List[float] = field(default_factory=list)


@dataclass
class IncidentTraceFeatures:
    incident_id: str
    soc_id: str
    severity: str
    status: str
    assigned_analyst_id: str
    created_at: Optional[datetime]
    closed_at: Optional[datetime]
    closure_minutes: Optional[float]
    
    # Workflow action presence
    actions_done: List[str] = field(default_factory=list)
    has_triage: bool = False
    has_investigation: bool = False
    has_escalation: bool = False
    has_response: bool = False
    has_closure: bool = False
    
    # Expected vs Actual
    expected_actions: List[str] = field(default_factory=list)
    missing_actions: List[str] = field(default_factory=list)
    investigation_count: int = 0
    evidence_count: int = 0


class FeatureExtractor:
    """Extracts high-dimensional analytical feature representations from a LoadedDataset."""

    @staticmethod
    def extract_incident_traces(dataset: LoadedDataset) -> Dict[str, IncidentTraceFeatures]:
        traces: Dict[str, IncidentTraceFeatures] = {}

        for inc in dataset.incidents:
            inc_id = inc["incident_id"]
            sev = inc.get("severity", "MEDIUM")
            created_at = _parse_dt(inc.get("created_at"))
            closed_at = _parse_dt(inc.get("closed_at"))
            
            closure_min = None
            if created_at and closed_at:
                closure_min = max(0.0, (closed_at - created_at).total_seconds() / 60.0)

            # Actions done
            acts = dataset.actions_by_incident.get(inc_id, [])
            action_types = [a.get("action_type") for a in acts if "action_type" in a]
            
            # Investigations
            invs = dataset.investigations_by_incident.get(inc_id, [])
            evidence_sum = sum(iv.get("evidence_count", 0) for iv in invs)
            has_inv = len(invs) > 0 or "INVESTIGATION_START" in action_types or "INVESTIGATION" in action_types
            
            # Escalations
            escs = dataset.escalations_by_incident.get(inc_id, [])
            has_esc = len(escs) > 0 or "ESCALATION" in action_types

            # Expected actions based on severity
            if sev == "CRITICAL":
                expected = ["TRIAGE", "INVESTIGATION", "ESCALATION", "RESPONSE", "CLOSURE"]
            elif sev == "HIGH":
                expected = ["TRIAGE", "INVESTIGATION", "RESPONSE", "CLOSURE"]
            else:
                expected = ["TRIAGE", "INVESTIGATION", "CLOSURE"]

            # Map actual actions done into canonical workflow step names
            canonical_done = set()
            for at in action_types:
                if at in ("TRIAGE",):
                    canonical_done.add("TRIAGE")
                elif at in ("INVESTIGATION_START", "INVESTIGATION", "EVIDENCE_COLLECTION"):
                    canonical_done.add("INVESTIGATION")
                elif at in ("ESCALATION",):
                    canonical_done.add("ESCALATION")
                elif at in ("RESPONSE",):
                    canonical_done.add("RESPONSE")
                elif at in ("CLOSURE",):
                    canonical_done.add("CLOSURE")

            if has_inv:
                canonical_done.add("INVESTIGATION")
            if has_esc:
                canonical_done.add("ESCALATION")
            if inc.get("status") in ("RESOLVED", "CLOSED") or closed_at is not None:
                canonical_done.add("CLOSURE")
            # If incident exists and has alerts/actions, triage occurred
            if len(acts) > 0 or len(inc.get("alert_ids", [])) > 0:
                canonical_done.add("TRIAGE")

            # Missing steps from expected
            missing = [step for step in expected if step not in canonical_done]

            trace = IncidentTraceFeatures(
                incident_id=inc_id,
                soc_id=inc.get("soc_id", ""),
                severity=sev,
                status=inc.get("status", "CLOSED"),
                assigned_analyst_id=inc.get("assigned_analyst_id", ""),
                created_at=created_at,
                closed_at=closed_at,
                closure_minutes=closure_min,
                actions_done=list(canonical_done),
                has_triage="TRIAGE" in canonical_done,
                has_investigation=has_inv,
                has_escalation=has_esc,
                has_response="RESPONSE" in canonical_done,
                has_closure="CLOSURE" in canonical_done,
                expected_actions=expected,
                missing_actions=missing,
                investigation_count=len(invs),
                evidence_count=evidence_sum,
            )
            traces[inc_id] = trace

        return traces

    @staticmethod
    def extract_analyst_features(
        dataset: LoadedDataset, traces: Optional[Dict[str, IncidentTraceFeatures]] = None
    ) -> Dict[str, AnalystFeatures]:
        if traces is None:
            traces = FeatureExtractor.extract_incident_traces(dataset)

        total_soc_criticals = sum(1 for t in traces.values() if t.severity == "CRITICAL")
        analyst_map: Dict[str, AnalystFeatures] = {}

        for a in dataset.analysts:
            aid = a["analyst_id"]
            analyst_map[aid] = AnalystFeatures(
                analyst_id=aid,
                soc_id=a.get("soc_id", ""),
                name=a.get("name", aid),
                role=a.get("role", "TIER1"),
            )

        # Aggregate incident assignments
        for t in traces.values():
            aid = t.assigned_analyst_id
            if not aid:
                continue
            if aid not in analyst_map:
                analyst_map[aid] = AnalystFeatures(
                    analyst_id=aid,
                    soc_id=t.soc_id,
                    name=aid,
                    role="UNKNOWN",
                )
            af = analyst_map[aid]
            af.total_incidents += 1
            if t.severity == "CRITICAL":
                af.critical_incidents += 1
                if t.has_escalation:
                    af.escalated_critical_incidents += 1
            elif t.severity == "HIGH":
                af.high_incidents += 1

            if t.has_closure:
                af.closed_incidents += 1
            if t.has_investigation:
                af.investigated_incidents += 1
            if t.closure_minutes is not None:
                af.closure_durations.append(t.closure_minutes)

        # Calculate final ratios and metrics
        for af in analyst_map.values():
            soc_criticals = sum(
                1 for t in traces.values() if t.severity == "CRITICAL" and t.soc_id == af.soc_id
            )
            if soc_criticals > 0:
                af.critical_case_share = round(af.critical_incidents / soc_criticals, 4)
            elif total_soc_criticals > 0:
                af.critical_case_share = round(af.critical_incidents / total_soc_criticals, 4)
            if af.total_incidents > 0:
                af.investigation_rate = round(af.investigated_incidents / af.total_incidents, 4)
            if af.critical_incidents > 0:
                af.escalation_rate_critical = round(
                    af.escalated_critical_incidents / af.critical_incidents, 4
                )
            if af.closure_durations:
                af.mean_closure_minutes = round(statistics.mean(af.closure_durations), 2)
                af.median_closure_minutes = round(statistics.median(af.closure_durations), 2)

            # Actions count
            analyst_acts = dataset.actions_by_analyst.get(af.analyst_id, [])
            af.total_actions = len(analyst_acts)
            if af.total_incidents > 0:
                af.mean_actions_per_incident = round(af.total_actions / af.total_incidents, 2)

        return analyst_map
