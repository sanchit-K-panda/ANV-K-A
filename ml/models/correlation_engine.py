"""Phase 7 — Correlation Engine.

Correlates disparate engine-level detections into unified, coherent, and actionable supervisory findings.
Prevents alarm fatigue by synthesizing co-occurring workflow violations, behavioural outliers,
and recurrence patterns into structured macro findings.
"""
from __future__ import annotations

from typing import Dict, List, Set

from ml.schemas import FindingSeverity, FindingType, RawFinding


class CorrelatedFindingGroup:
    def __init__(self, key: str, primary_detection: RawFinding):
        self.key = key
        self.primary_type: FindingType = primary_detection.finding_type
        self.severity: FindingSeverity = primary_detection.severity
        self.confidence: float = primary_detection.confidence
        self.entity_type: str = primary_detection.entity_type
        self.entity_id: str = primary_detection.entity_id
        self.affected_ids: Set[str] = set(primary_detection.affected_ids)
        self.detections: List[RawFinding] = [primary_detection]
        self.title: str = primary_detection.title
        self.description: str = primary_detection.description

    def add_detection(self, det: RawFinding) -> None:
        self.detections.append(det)
        self.affected_ids.update(det.affected_ids)

        # Upgrade severity if secondary detection is higher
        sev_rank = {
            FindingSeverity.INFO: 0,
            FindingSeverity.LOW: 1,
            FindingSeverity.MEDIUM: 2,
            FindingSeverity.HIGH: 3,
            FindingSeverity.CRITICAL: 4,
        }
        if sev_rank.get(det.severity, 0) > sev_rank.get(self.severity, 0):
            self.severity = det.severity
            self.primary_type = det.finding_type

        # Confidence increases with corroborating evidence from multiple engines
        self.confidence = min(0.99, max(self.confidence, det.confidence) + 0.02)


class CorrelationEngine:
    """Correlates and deduplicates raw detections into consolidated findings."""

    def correlate(self, raw_detections: List[RawFinding]) -> List[CorrelatedFindingGroup]:
        if not raw_detections:
            return []

        # 1. First pass: Index groups by primary entity (entity_type, entity_id)
        groups: Dict[str, CorrelatedFindingGroup] = {}

        # Sort detections so high-priority macro detections (KPI_MANIPULATION, WORKLOAD, RECURRING_THREAT) take lead
        priority = {
            FindingType.KPI_MANIPULATION: 10,
            FindingType.WORKLOAD_IMBALANCE: 9,
            FindingType.RECURRING_THREAT: 8,
            FindingType.IDENTITY_ANOMALY: 7,
            FindingType.EXECUTION_GAP: 6,
            FindingType.NEGATIVE_SPACE: 5,
            FindingType.BEHAVIOURAL_ANOMALY: 4,
        }
        sorted_detections = sorted(
            raw_detections, key=lambda d: priority.get(d.finding_type, 0), reverse=True
        )

        for det in sorted_detections:
            group_key = f"{det.entity_type}:{det.entity_id}"
            
            # Check if this detection belongs to an existing analyst or group cluster
            attached = False
            if det.entity_type == "incident":
                # Check if this incident is part of an existing KPI or Workload finding's affected_ids
                for g in groups.values():
                    if g.primary_type in (FindingType.KPI_MANIPULATION, FindingType.WORKLOAD_IMBALANCE):
                        if det.entity_id in g.affected_ids or any(aid in g.entity_id.split(",") for aid in [det.evidence.get("assigned_analyst_id", "")]):
                            g.add_detection(det)
                            attached = True
                            break

            elif det.entity_type == "analyst":
                # Check if analyst is in an analyst_group
                for g in groups.values():
                    if g.entity_type == "analyst_group" and det.entity_id in g.entity_id.split(","):
                        g.add_detection(det)
                        attached = True
                        break

            if not attached:
                if group_key in groups:
                    groups[group_key].add_detection(det)
                else:
                    groups[group_key] = CorrelatedFindingGroup(group_key, det)

        return list(groups.values())
