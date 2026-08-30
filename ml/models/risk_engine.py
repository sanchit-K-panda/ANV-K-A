"""Phase 8 — Risk Engine.

Calculates composite risk scores strictly as an explicit sum of weighted, named contributing factors
(Architecture.md §5 and Rules.md §6). Never outputs an opaque or unexplained number.
"""
from __future__ import annotations

from typing import List, Tuple
from ml.schemas import FindingSeverity, FindingType, RawFinding, RiskAssessmentResult, RiskFactor


class RiskEngine:
    """Additive, itemized factor-sum risk scoring engine."""

    @staticmethod
    def calculate_risk(
        primary_type: FindingType,
        severity: FindingSeverity,
        confidence: float,
        detections: List[RawFinding],
    ) -> RiskAssessmentResult:
        factors: List[RiskFactor] = []
        breakdown: dict[str, int] = {}

        # 1. Base Severity Factor
        sev_points = {
            FindingSeverity.CRITICAL: 32,
            FindingSeverity.HIGH: 22,
            FindingSeverity.MEDIUM: 14,
            FindingSeverity.LOW: 8,
            FindingSeverity.INFO: 2,
        }.get(severity, 10)

        factors.append(
            RiskFactor(
                name="Severity Impact",
                weight=sev_points,
                category="SEVERITY",
                description=f"Base risk score derived from {severity.value} security finding classification.",
            )
        )
        breakdown["Severity Impact"] = sev_points

        # 2. Execution Gap Factor
        has_exec_gap = any(d.finding_type == FindingType.EXECUTION_GAP for d in detections)
        if has_exec_gap:
            pts = 28
            factors.append(
                RiskFactor(
                    name="Investigation Gap",
                    weight=pts,
                    category="WORKFLOW_INTEGRITY",
                    description="Mandatory investigation and containment steps were bypassed prior to closure.",
                )
            )
            breakdown["Investigation Gap"] = pts

        # 3. Negative Space Omission Factor
        has_neg_space = any(d.finding_type == FindingType.NEGATIVE_SPACE for d in detections)
        if has_neg_space:
            pts = 18
            factors.append(
                RiskFactor(
                    name="Negative Space",
                    weight=pts,
                    category="WORKFLOW_INTEGRITY",
                    description="Silent omission of standard lifecycle transitions and evidence verification.",
                )
            )
            breakdown["Negative Space"] = pts

        # 4. Behavioural Deviation & KPI Manipulation Factor
        has_kpi = any(d.finding_type == FindingType.KPI_MANIPULATION for d in detections)
        has_behaviour = any(d.finding_type == FindingType.BEHAVIOURAL_ANOMALY for d in detections)
        if has_kpi or has_behaviour:
            pts = 22 if has_kpi else 14
            factors.append(
                RiskFactor(
                    name="Closure & KPI Anomaly",
                    weight=pts,
                    category="BEHAVIOUR",
                    description="Operational velocity or metrics exhibit statistical gaming or extreme peer divergence.",
                )
            )
            breakdown["Closure & KPI Anomaly"] = pts

        # 5. Threat Recurrence Penalty
        has_recurrence = any(d.finding_type == FindingType.RECURRING_THREAT for d in detections)
        if has_recurrence:
            pts = 24
            factors.append(
                RiskFactor(
                    name="Repeated Unresolved Threats",
                    weight=pts,
                    category="PERSISTENCE",
                    description="Threat entity persists and resurfaces across multiple assets without remediation.",
                )
            )
            breakdown["Repeated Unresolved Threats"] = pts

        # 6. Workload & Capacity Skew Factor
        has_workload = any(d.finding_type == FindingType.WORKLOAD_IMBALANCE for d in detections)
        if has_workload:
            pts = 16
            factors.append(
                RiskFactor(
                    name="Workload Concentration",
                    weight=pts,
                    category="CAPACITY",
                    description="Disproportionate critical queue burden concentrated on a single operational bottleneck.",
                )
            )
            breakdown["Workload Concentration"] = pts

        # 7. Identity Breaches & Tamper Factor
        has_identity = any(d.finding_type == FindingType.IDENTITY_ANOMALY for d in detections)
        if has_identity:
            pts = 35
            factors.append(
                RiskFactor(
                    name="Identity Security Breach",
                    weight=pts,
                    category="AUTHENTICATION",
                    description="Unauthorized biometric drift or operator substitution during active session.",
                )
            )
            breakdown["Identity Security Breach"] = pts

        # 8. Evidence & Confidence Weight
        conf_pts = int(round(confidence * 10))
        factors.append(
            RiskFactor(
                name="Confidence Weight",
                weight=conf_pts,
                category="EVIDENCE_CONFIDENCE",
                description=f"Detection confidence calibration (+{conf_pts} pts for {int(confidence*100)}% certainty).",
            )
        )
        breakdown["Confidence Weight"] = conf_pts

        # Calculate final composite score bounded [0, 100]
        total_score = min(100, max(5, sum(f.weight for f in factors)))

        # Determine composite risk severity
        if total_score >= 85:
            risk_sev = FindingSeverity.CRITICAL
        elif total_score >= 65:
            risk_sev = FindingSeverity.HIGH
        elif total_score >= 40:
            risk_sev = FindingSeverity.MEDIUM
        else:
            risk_sev = FindingSeverity.LOW

        return RiskAssessmentResult(
            score=total_score,
            severity=risk_sev,
            factors=factors,
            breakdown=breakdown,
        )
