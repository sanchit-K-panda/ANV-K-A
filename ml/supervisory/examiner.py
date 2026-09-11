"""Examiner sample prioritization (REMEDIATION.md P0-4).

The PS requires the tool to "prioritise which alert samples a human examiner should
review". This module deterministically scores cases for human review and returns a
capped, reasoned queue. Contract:

1. Every returned item carries a one-line, field-referencing REASON (timestamps,
   missing investigation IDs, velocities) — never a bare score (explainability
   contract, Rules.md §6 / risk_engine.py precedent).
2. Prioritization is derived strictly from telemetry; no ground truth is consulted.
3. Output is capped (default top 25) and sorted by review priority.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence

from ml.supervisory.ranking import _parse_dt


@dataclass
class ExaminerSample:
    """One prioritized case for human examiner review."""
    case_id: str
    soc_id: str
    analyst_id: str
    severity: str
    review_score: int          # 0-100, higher = review sooner
    reasons: List[str]         # field-referencing, human-readable
    factors: Dict[str, int]    # itemized point breakdown
    created_at: Optional[str]
    closed_at: Optional[str]
    incident_ref: Optional[str] = None
    alert_refs: List[str] = field(default_factory=list)
    asset_refs: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "soc_id": self.soc_id,
            "analyst_id": self.analyst_id,
            "severity": self.severity,
            "review_score": self.review_score,
            "reasons": self.reasons,
            "factors": self.factors,
            "created_at": self.created_at,
            "closed_at": self.closed_at,
            "incident_ref": self.incident_ref,
            "alert_refs": self.alert_refs,
            "asset_refs": self.asset_refs,
        }


def _closure_velocity_zscore(closure_hours: List[float], value: float) -> float:
    if len(closure_hours) < 3:
        return 0.0
    mu = statistics.mean(closure_hours)
    sd = statistics.pstdev(closure_hours)
    if sd <= 1e-9:
        return 0.0
    return (value - mu) / sd


def examiner_queue(
    dataset,
    soc_id: Optional[str] = None,
    top_n: int = 25,
) -> List[ExaminerSample]:
    """Build the prioritized examiner review queue for one LoadedDataset.

    Args:
        dataset: ml.preprocessing.dataset_loader.LoadedDataset (indexes prebuilt).
        soc_id:  restrict to one SOC (used by the drill-down endpoint).
        top_n:   cap the returned queue (PS flow: top 25).

    Scoring factors (itemized, additive, capped at 100):
      + 25  closure without any investigation record
      + 20  CRITICAL severity
      + 15  closure velocity z-score < -2 (suspiciously fast vs SOC baseline)
      + 12  escalation bypass on a critical (no escalation record)
      + 10  escalation awaiting supervisor sign-off
      +  8  linked threat recurs across other incidents
      +  6  investigation closed with no written notes
      +  4  closure took > 24h (backlog suffering)
    """
    incidents = [i for i in dataset.incidents if not soc_id or i.get("soc_id") == soc_id]
    if not incidents:
        return []

    inc_ids = {i.get("incident_id") for i in incidents}
    inv_by_incident: Dict[str, List[Dict[str, Any]]] = {}
    for inv in dataset.investigations:
        iid = inv.get("incident_id")
        if iid in inc_ids:
            inv_by_incident.setdefault(iid, []).append(inv)
    esc_by_incident: Dict[str, List[Dict[str, Any]]] = {}
    for esc in dataset.escalations:
        iid = esc.get("incident_id")
        if iid in inc_ids:
            esc_by_incident.setdefault(iid, []).append(esc)

    # Closure-velocity baseline across this dataset's closures
    closure_hours: List[float] = []
    for i in incidents:
        c, cl = _parse_dt(i.get("created_at")), _parse_dt(i.get("closed_at"))
        if c and cl and cl >= c:
            closure_hours.append((cl - c).total_seconds() / 3600.0)

    # Threat recurrence map
    threat_counts: Dict[str, int] = {}
    for i in dataset.incidents:
        for t in (i.get("threat_ids") or []):
            threat_counts[t] = threat_counts.get(t, 0) + 1

    alert_by_id = {a.get("alert_id"): a for a in dataset.alerts}

    samples: List[ExaminerSample] = []
    for inc in incidents:
        iid = inc.get("incident_id", "")
        c, cl = _parse_dt(inc.get("created_at")), _parse_dt(inc.get("closed_at"))
        if not cl:
            continue  # only closed cases enter the review queue (reviewable outcomes)

        reasons: List[str] = []
        factors: Dict[str, int] = {}

        has_inv = iid in inv_by_incident
        sev = str(inc.get("severity", "")).upper()
        crit = sev == "CRITICAL"

        if not has_inv:
            factors["closure_without_investigation"] = 25
            reasons.append(
                f"Closed at {cl.isoformat()} with no investigation record "
                f"(expected INV for {sev} case)"
            )
        else:
            notes_missing = all(
                not str(inv.get("notes", "") or "").strip() for inv in inv_by_incident[iid]
            )
            if notes_missing:
                factors["investigation_notes_missing"] = 6
                reasons.append(
                    f"Investigation {inv_by_incident[iid][0].get('investigation_id', '?')} "
                    f"completed without written notes"
                )

        if crit:
            factors["critical_severity"] = 20
            reasons.append(f"CRITICAL severity case created {inc.get('created_at', '?')}")

        escs = esc_by_incident.get(iid, [])
        if crit and not escs:
            factors["escalation_bypass"] = 12
            reasons.append("No escalation to senior review despite CRITICAL severity")
        elif escs and any(
            str(e.get("status", "")).upper() not in ("RESOLVED", "ACKNOWLEDGED") for e in escs
        ):
            factors["escalation_signoff_pending"] = 10
            reasons.append(
                f"Escalation {escs[0].get('escalation_id', '?')} awaiting supervisor sign-off"
            )

        duration_h = (cl - c).total_seconds() / 3600.0 if (c and cl >= c) else None
        if duration_h is not None:
            z = _closure_velocity_zscore(closure_hours, duration_h)
            if z < -2.0:
                factors["closure_velocity_outlier"] = 15
                reasons.append(
                    f"Closed in {duration_h:.1f}h vs {statistics.mean(closure_hours):.1f}h "
                    f"baseline (z={z:.1f})"
                )
            elif duration_h > 24.0:
                factors["slow_closure"] = 4
                reasons.append(f"Open for {duration_h:.1f}h before closure (backlog impact)")

        repeat_threats = [t for t in (inc.get("threat_ids") or []) if threat_counts.get(t, 0) > 1]
        if repeat_threats:
            factors["threat_recurrence"] = 8
            reasons.append(
                f"Threat {repeat_threats[0]} recurs across {threat_counts[repeat_threats[0]]} incidents"
            )

        if not factors:
            continue  # nothing reviewable about this case

        score = min(100, sum(factors.values()))
        alert_refs = [a for a in (inc.get("alert_ids") or []) if a]
        samples.append(ExaminerSample(
            case_id=iid,
            soc_id=inc.get("soc_id", ""),
            analyst_id=inc.get("assigned_analyst_id", ""),
            severity=sev,
            review_score=score,
            reasons=reasons,
            factors=factors,
            created_at=inc.get("created_at"),
            closed_at=inc.get("closed_at"),
            incident_ref=iid,
            alert_refs=alert_refs,
            asset_refs=list(inc.get("asset_ids") or []),
        ))

    samples.sort(key=lambda s: (-s.review_score, s.case_id))
    return samples[:top_n]


def examiner_queue_summary(
    dataset,
    soc_id: Optional[str] = None,
    top_n: int = 25,
) -> Dict[str, Any]:
    """Machine-readable summary for the API layer."""
    queue = examiner_queue(dataset, soc_id=soc_id, top_n=top_n)
    return {
        "method": "deterministic itemized review score (closure-without-investigation, "
                  "severity, closure-velocity z-score, escalation bypass/sign-off, "
                  "threat recurrence)",
        "soc_id": soc_id,
        "queue_size": len(queue),
        "cap": top_n,
        "queue": [s.to_dict() for s in queue],
    }
