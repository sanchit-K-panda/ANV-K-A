"""Phase 4/7 — Analyst Workload Engine.

Detects abnormal workload concentration, single points of operational failure,
queue skew, and analyst bottlenecks across SOC shift teams.
"""
from __future__ import annotations

import statistics
from typing import Dict, List, Optional

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import AnalystFeatures, FeatureExtractor, IncidentTraceFeatures
from ml.schemas import FindingSeverity, FindingType, RawFinding


class WorkloadEngine:
    """Evaluates case distribution, critical queue concentration, and operational bottlenecking."""

    def __init__(self, dominant_share_threshold: float = 0.40, min_critical_incidents: int = 1):
        self.dominant_share_threshold = dominant_share_threshold
        self.min_critical_incidents = min_critical_incidents

    def analyze(
        self,
        dataset: LoadedDataset,
        traces: Optional[Dict[str, IncidentTraceFeatures]] = None,
        analyst_map: Optional[Dict[str, AnalystFeatures]] = None,
    ) -> List[RawFinding]:
        if traces is None:
            traces = FeatureExtractor.extract_incident_traces(dataset)
        if analyst_map is None:
            analyst_map = FeatureExtractor.extract_analyst_features(dataset, traces)

        findings: List[RawFinding] = []

        # Group analysts by SOC
        soc_analysts: Dict[str, List[AnalystFeatures]] = {}
        for af in analyst_map.values():
            soc_analysts.setdefault(af.soc_id, []).append(af)

        for soc_id, analysts in soc_analysts.items():
            active_analysts = [a for a in analysts if a.role != "SUPERVISOR"] or analysts
            if len(active_analysts) < 2:
                continue

            total_criticals = sum(a.critical_incidents for a in active_analysts)
            if total_criticals < 3:
                continue

            expected_share = round(1.0 / len(active_analysts), 3)

            for af in active_analysts:
                actual_share = af.critical_case_share
                
                # Check for disproportionate concentration:
                # Must hold >= 2 critical cases with >=50% of the SOC critical queue
                is_concentrated = (
                    af.critical_incidents >= 2
                    and actual_share >= 0.50
                    and len(active_analysts) >= 3
                ) or (af.critical_incidents >= 3 and actual_share >= 0.40)

                if is_concentrated:
                    other_shares = [
                        a.critical_incidents / total_criticals
                        for a in active_analysts
                        if a.analyst_id != af.analyst_id
                    ]
                    mean_other = round(statistics.mean(other_shares), 4) if other_shares else 0.0

                    affected_inc_ids = [
                        t.incident_id
                        for t in traces.values()
                        if t.assigned_analyst_id == af.analyst_id and t.severity == "CRITICAL"
                    ]

                    finding = RawFinding(
                        engine_name="WorkloadEngine",
                        finding_type=FindingType.WORKLOAD_IMBALANCE,
                        severity=FindingSeverity.HIGH if actual_share >= 0.60 else FindingSeverity.MEDIUM,
                        confidence=0.94,
                        title=f"Workload Imbalance: Analyst {af.name} ({af.analyst_id}) carries {int(actual_share * 100)}% of critical cases",
                        description=(
                            f"Analyst {af.name} ({af.analyst_id}) has been assigned {af.critical_incidents} out of "
                            f"{total_criticals} ({int(actual_share * 100)}%) critical security incidents in SOC {soc_id}. "
                            f"Expected uniform distribution across the {len(active_analysts)} team members is {int(expected_share * 100)}% per analyst. "
                            f"This creates an extreme bottleneck and single point of operational vulnerability."
                        ),
                        entity_type="analyst",
                        entity_id=af.analyst_id,
                        affected_ids=affected_inc_ids,
                        evidence={
                            "analyst_id": af.analyst_id,
                            "analyst_name": af.name,
                            "soc_id": soc_id,
                            "critical_cases_assigned": af.critical_incidents,
                            "total_soc_critical_cases": total_criticals,
                            "dominant_share": actual_share,
                            "expected_uniform_share": expected_share,
                            "mean_other_analyst_share": mean_other,
                            "team_size": len(active_analysts),
                            "affected_incident_ids": affected_inc_ids,
                        },
                        baseline_metrics={
                            "expected_distribution": "UNIFORM",
                            "expected_per_analyst_share": expected_share,
                        },
                        observed_metrics={
                            "actual_dominant_share": actual_share,
                            "mean_other_share": mean_other,
                            "critical_incidents_assigned": af.critical_incidents,
                        },
                        recommended_action=(
                            f"Rebalance the incident dispatch queue immediately. Reassign critical cases from "
                            f"{af.name} to under-utilized tier-1/tier-2 analysts and implement automated capacity-based triage caps."
                        ),
                    )
                    findings.append(finding)

        return findings
