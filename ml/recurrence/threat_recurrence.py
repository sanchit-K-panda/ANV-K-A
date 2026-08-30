"""Phase 7 — Threat Analytics & Recurrence Engine.

Identifies cyber threats that repeatedly spawn incidents across assets without effective remediation,
surfacing systemic containment failures rather than isolated alert events.
"""
from __future__ import annotations

from typing import Dict, List, Optional, Set

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.schemas import FindingSeverity, FindingType, RawFinding


class ThreatRecurrenceEngine:
    """Detects recurring unresolved threats and ineffective remediation cycles."""

    def __init__(self, min_recurrence_threshold: int = 3):
        self.min_recurrence_threshold = min_recurrence_threshold

    def analyze(self, dataset: LoadedDataset) -> List[RawFinding]:
        findings: List[RawFinding] = []

        # Analyze each threat and its associated incidents
        for threat in dataset.threats:
            tid = threat.get("threat_id")
            if not tid:
                continue

            t_name = threat.get("name", tid)
            t_category = threat.get("category", "UNKNOWN")
            t_status = threat.get("status", "ACTIVE")

            associated_incidents = dataset.incidents_by_threat.get(tid, [])
            if len(associated_incidents) < 2:
                continue

            # Check if incidents were closed but threat status remained UNRESOLVED or no remediation was applied
            closed_incidents = [i for i in associated_incidents if i.get("status") in ("RESOLVED", "CLOSED")]
            
            # Check action metadata for closure remediation flag
            inc_ids = {i["incident_id"] for i in associated_incidents}
            remediation_flags = []
            for act in dataset.analyst_actions:
                if act.get("incident_id") in inc_ids and act.get("action_type") == "CLOSURE":
                    meta = act.get("metadata", {})
                    if "remediation_applied" in meta:
                        remediation_flags.append(meta.get("remediation_applied", True))

            any_remediated = any(r is True for r in remediation_flags) if remediation_flags else (t_status != "UNRESOLVED")
            has_explicit_unremediated = any(r is False for r in remediation_flags)
            is_unresolved = (t_status == "UNRESOLVED" and len(closed_incidents) >= self.min_recurrence_threshold) or has_explicit_unremediated

            if is_unresolved and len(closed_incidents) >= 2:
                affected_assets: Set[str] = set()
                for i in associated_incidents:
                    affected_assets.update(i.get("asset_ids", []))

                finding = RawFinding(
                    engine_name="ThreatRecurrenceEngine",
                    finding_type=FindingType.RECURRING_THREAT,
                    severity=FindingSeverity.CRITICAL,
                    confidence=0.96,
                    title=f"Recurring Unresolved Threat: '{t_name}' ({tid}) active across {len(associated_incidents)} incidents",
                    description=(
                        f"Threat '{t_name}' (Category: {t_category}, ID: {tid}) has recurred across "
                        f"{len(associated_incidents)} separate security incidents involving {len(affected_assets)} asset(s). "
                        f"All associated incidents reached closure status without recorded permanent remediation, "
                        f"indicating systemic remediation failure and persistence in the environment."
                    ),
                    entity_type="threat",
                    entity_id=tid,
                    affected_ids=list(inc_ids),
                    evidence={
                        "threat_id": tid,
                        "threat_name": t_name,
                        "category": t_category,
                        "threat_status": t_status,
                        "incident_count": len(associated_incidents),
                        "incident_ids": list(inc_ids),
                        "affected_asset_count": len(affected_assets),
                        "affected_assets": list(affected_assets),
                        "all_incidents_closed": len(closed_incidents) == len(associated_incidents),
                        "remediation_verified": any_remediated,
                        "violation_types": ["RECURRING_THREAT", "REPEATED_UNRESOLVED_THREAT"],
                    },
                    baseline_metrics={
                        "recurrence_after_remediation": 0,
                        "status_after_first_closure": "MITIGATED",
                    },
                    observed_metrics={
                        "incident_count": len(associated_incidents),
                        "incident_ids": list(inc_ids),
                        "all_closed": True,
                        "any_remediated": any_remediated,
                    },
                    recommended_action=(
                        f"Initiate enterprise threat hunt and root-cause analysis for {t_name} ({tid}). "
                        f"Quarantine affected assets {list(affected_assets)} and enforce verified patch/configuration "
                        f"deployment before incident closure sign-off."
                    ),
                )
                findings.append(finding)

        return findings
