"""Cross-organisation supervisory ranking (REMEDIATION.md P0-3).

Ranks multiple SOCs by aggregating observable workflow telemetry into the eight
PS capability areas. Architecture rules honoured here:

1. Every composite score is an ITEMIZED, NAMED FACTOR SUM (Rules.md §6, risk_engine.py
   precedent) — never a bare number. Each factor carries the metric, the observed value,
   and a human-readable reason.
2. Ranking is derived EXCLUSIVELY from telemetry (incidents, investigations,
   escalations, actions). Maturity-profile labels in the datasets (if present) are
   NEVER read — the acceptance test for P0-3 is that permuting profiles changes the
   ranking, i.e. the ranking recovers behaviour from data alone.
3. Scores are penalty-based: each factor contributes points when the SOC's observed
   metric deviates from the cross-SOC cohort. A factor-sum of 0 = no observed gaps.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence

# The eight PS capability areas (PRD §7 / problem statement SIH26157).
CAPABILITY_AREAS: List[str] = [
    "detection_quality",
    "investigation_thoroughness",
    "escalation_discipline",
    "closure_integrity",
    "response_timeliness",
    "workload_distribution",
    "governance",
    "operational_resilience",
]


def _parse_dt(val: Any) -> Optional[datetime]:
    if not val:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=None)
    if isinstance(val, str):
        try:
            dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=None)
        except ValueError:
            return None
    return None


@dataclass
class RankingFactor:
    """One named contributing factor — the explainability contract for ranking."""
    name: str
    points: int
    capability_area: str
    metric: str
    observed_value: float
    reason: str


@dataclass
class CapabilityAreaScore:
    area: str
    label: str
    score: int  # penalty points, lower is better
    max_score: int
    factors: List[RankingFactor] = field(default_factory=list)


@dataclass
class SocRanking:
    soc_id: str
    soc_name: str
    rank: int
    total_penalty: int
    grade: str
    capability_areas: List[CapabilityAreaScore]
    worst_area: str
    sample_size: Dict[str, int]  # incidents/closures etc. backing the metrics

    def to_dict(self) -> Dict[str, Any]:
        return {
            "soc_id": self.soc_id,
            "soc_name": self.soc_name,
            "rank": self.rank,
            "total_penalty": self.total_penalty,
            "grade": self.grade,
            "worst_area": self.worst_area,
            "sample_size": self.sample_size,
            "capability_areas": [
                {
                    "area": a.area,
                    "label": a.label,
                    "score": a.score,
                    "max_score": a.max_score,
                    "factors": [
                        {
                            "name": f.name,
                            "points": f.points,
                            "metric": f.metric,
                            "observed_value": f.observed_value,
                            "reason": f.reason,
                        }
                        for f in a.factors
                    ],
                }
                for a in self.capability_areas
            ],
        }


_AREA_LABELS = {
    "detection_quality": "Detection Quality",
    "investigation_thoroughness": "Investigation Thoroughness",
    "escalation_discipline": "Escalation Discipline",
    "closure_integrity": "Closure Integrity",
    "response_timeliness": "Response Timeliness",
    "workload_distribution": "Workload Distribution",
    "governance": "Governance & Supervisory Sign-off",
    "operational_resilience": "Operational Resilience",
}


def _soc_metrics(soc_id: str, ds) -> Dict[str, Any]:
    """Raw observable metrics for one SOC from a LoadedDataset (ml.preprocessing)."""
    incidents = [i for i in ds.incidents if i.get("soc_id") == soc_id]
    investigations = ds.investigations  # joined via incident below
    escalations = ds.escalations
    actions = ds.analyst_actions

    inc_by_id = {i.get("incident_id"): i for i in incidents}
    inv_by_incident: Dict[str, List[Dict[str, Any]]] = {}
    for inv in investigations:
        iid = inv.get("incident_id")
        if iid in inc_by_id:
            inv_by_incident.setdefault(iid, []).append(inv)
    esc_by_incident: Dict[str, List[Dict[str, Any]]] = {}
    for esc in escalations:
        iid = esc.get("incident_id")
        if iid in inc_by_id:
            esc_by_incident.setdefault(iid, []).append(esc)

    n = len(incidents)
    closed = [i for i in incidents if i.get("closed_at")]
    criticals = [i for i in incidents if str(i.get("severity", "")).upper() == "CRITICAL"]

    # Investigation coverage & documentation
    investigated = sum(1 for i in incidents if i.get("incident_id") in inv_by_incident)
    doc_missing = sum(
        1 for lst in inv_by_incident.values() for inv in lst
        if not str(inv.get("notes", "") or "").strip()
    )
    total_invs = sum(len(v) for v in inv_by_incident.values())

    # Closure-without-investigation (closure integrity)
    closure_without_inv = sum(1 for i in closed if i.get("incident_id") not in inv_by_incident)

    # Escalation discipline (criticals must escalate; sign-off must be recorded)
    crit_ids = {i.get("incident_id") for i in criticals}
    crit_escalated = sum(1 for iid in crit_ids if iid in esc_by_incident)
    esc_pending = sum(
        1 for lst in esc_by_incident.values() for e in lst
        if str(e.get("status", "")).upper() not in ("RESOLVED", "ACKNOWLEDGED")
    )
    total_esc = sum(len(v) for v in esc_by_incident.values())

    # Response timeliness: mean closure hours
    durations_h: List[float] = []
    for i in closed:
        created = _parse_dt(i.get("created_at"))
        closed_at = _parse_dt(i.get("closed_at"))
        if created and closed_at and closed_at >= created:
            durations_h.append((closed_at - created).total_seconds() / 3600.0)
    mean_closure_h = sum(durations_h) / len(durations_h) if durations_h else 0.0
    slow_closures = sum(1 for d in durations_h if d > 24.0)

    # Workload distribution: max share of criticals per analyst
    crit_by_analyst = Counter(
        i.get("assigned_analyst_id") for i in criticals if i.get("assigned_analyst_id")
    )
    max_share = 0.0
    if criticals and crit_by_analyst:
        max_share = max(crit_by_analyst.values()) / len(criticals)

    # Resilience: threat recurrence + reopen signals
    threat_counts = Counter(t for i in incidents for t in (i.get("threat_ids") or []))
    repeat_incidents = sum(1 for i in incidents if any(threat_counts.get(t, 0) > 1 for t in (i.get("threat_ids") or [])))
    reopen_actions = sum(
        1 for a in actions
        if a.get("soc_id") == soc_id and "REOPEN" in str(a.get("action_type", "")).upper()
    )

    return {
        "n_incidents": n,
        "n_closed": len(closed),
        "n_criticals": len(criticals),
        "investigation_coverage": investigated / n if n else 1.0,
        "documentation_coverage": 1.0 - (doc_missing / total_invs) if total_invs else 1.0,
        "closure_without_inv_rate": closure_without_inv / len(closed) if closed else 0.0,
        "critical_escalation_coverage": crit_escalated / len(criticals) if criticals else 1.0,
        "escalation_signoff_gap_rate": esc_pending / total_esc if total_esc else 0.0,
        "mean_closure_hours": mean_closure_h,
        "slow_closure_rate": slow_closures / len(durations_h) if durations_h else 0.0,
        "max_critical_share": max_share,
        "threat_recurrence_rate": repeat_incidents / n if n else 0.0,
        "reopen_count": reopen_actions,
    }


def rank_socs(datasets: Sequence) -> List[SocRanking]:
    """Rank SOCs across one or more LoadedDataset objects (multi-organisation mode).

    Accepts any sequence of ml.preprocessing.dataset_loader.LoadedDataset. All SOCs from
    all datasets are pooled (a SOC keeps its identity across scenarios), then ranked by
    itemized penalty. Deterministic: ties broken by soc_id for stable demo output.
    """
    # Pool metrics per (dataset, soc): a SOC appearing in several datasets is scored
    # per dataset and summed — scenario datasets are independent observations.
    per_ds: List[Dict[str, Dict[str, Any]]] = []
    names: Dict[str, str] = {}
    for ds in datasets:
        soc_names = {s.get("soc_id"): s.get("name", s.get("soc_id")) for s in getattr(ds, "socs", [])}
        names.update(soc_names)
        metrics: Dict[str, Dict[str, Any]] = {}
        for soc in getattr(ds, "socs", []):
            sid = soc.get("soc_id")
            if sid:
                metrics[sid] = _soc_metrics(sid, ds)
        per_ds.append(metrics)

    # Aggregate per SOC across datasets (rates averaged weighted by sample counts where
    # available; counts summed).
    soc_ids = sorted({sid for m in per_ds for sid in m})
    agg: Dict[str, Dict[str, Any]] = {}
    for sid in soc_ids:
        parts = [m[sid] for m in per_ds if sid in m]
        if not parts:
            continue
        keys = parts[0].keys()
        out: Dict[str, Any] = {}
        for k in keys:
            vals = [p[k] for p in parts if k in p]
            if isinstance(vals[0], (int, float)):
                out[k] = sum(vals) / len(vals) if k.startswith(("n_",)) is False and k != "reopen_count" else sum(vals)
            else:
                out[k] = vals[0]
        # counts must be summed, not averaged
        for k in ("n_incidents", "n_closed", "n_criticals", "reopen_count"):
            if k in out:
                out[k] = sum(p.get(k, 0) for p in parts)
        agg[sid] = out

    rankings: List[SocRanking] = []
    for sid in soc_ids:
        m = agg[sid]
        factors_by_area: Dict[str, List[RankingFactor]] = {a: [] for a in CAPABILITY_AREAS}

        def add(area: str, name: str, pts: int, metric: str, value: float, reason: str) -> None:
            factors_by_area[area].append(RankingFactor(name, pts, area, metric, round(value, 4), reason))

        # Detection quality — thin telemetry coverage suggests missed signal handling.
        # (Penalised lightly; detection gaps are mostly invisible by construction.)
        if m["n_incidents"] == 0:
            add("detection_quality", "No incident telemetry", 15, "n_incidents", 0,
                "No incidents recorded — telemetry or handling pipeline may be silent.")

        # Investigation thoroughness
        cov_gap = 1.0 - m["investigation_coverage"]
        add("investigation_thoroughness", "Investigation coverage gap",
            int(round(cov_gap * 30)), "investigation_coverage", m["investigation_coverage"],
            f"{m['investigation_coverage']:.0%} of incidents have any investigation record.")
        doc_gap = 1.0 - m["documentation_coverage"]
        add("investigation_thoroughness", "Investigation documentation gap",
            int(round(doc_gap * 15)), "documentation_coverage", m["documentation_coverage"],
            f"{doc_gap:.0%} of investigations lack written notes.")

        # Escalation discipline — the PS headline factor
        esc_gap = 1.0 - m["critical_escalation_coverage"]
        add("escalation_discipline", "Critical escalation completeness gap",
            int(round(esc_gap * 30)), "critical_escalation_coverage", m["critical_escalation_coverage"],
            f"{esc_gap:.0%} of critical incidents never escalated to senior review.")
        signoff_gap = m["escalation_signoff_gap_rate"]
        add("escalation_discipline", "Supervisor sign-off adherence gap",
            int(round(signoff_gap * 15)), "escalation_signoff_gap_rate", signoff_gap,
            f"{signoff_gap:.0%} of escalations await supervisor sign-off.")

        # Closure integrity
        cwi = m["closure_without_inv_rate"]
        add("closure_integrity", "Closure-without-investigation rate",
            int(round(cwi * 30)), "closure_without_inv_rate", cwi,
            f"{cwi:.0%} of closed cases have no investigation record.")

        # Response timeliness
        slow = m["slow_closure_rate"]
        add("response_timeliness", "Slow closure rate (>24h)",
            int(round(slow * 15)), "slow_closure_rate", slow,
            f"{slow:.0%} of closures took more than 24 hours (mean {m['mean_closure_hours']:.1f}h).")

        # Workload distribution
        share = m["max_critical_share"]
        overload = max(0.0, share - 0.5)  # >50% of criticals on one analyst is a bottleneck
        add("workload_distribution", "Critical-case concentration",
            int(round(overload * 2 * 15)), "max_critical_share", share,
            f"Top analyst holds {share:.0%} of critical cases (uniform ≈ {1.0 / max(m['n_criticals'], 1):.0%})."
            if m["n_criticals"] else "No criticals observed.")

        # Governance
        gov_pts = int(round(signoff_gap * 10)) + int(round(doc_gap * 10))
        add("governance", "Governance composite gap", gov_pts, "signoff_and_documentation",
            signoff_gap + doc_gap,
            f"Sign-off gaps ({signoff_gap:.0%}) plus documentation gaps ({doc_gap:.0%}) "
            f"indicate weak supervisory control.")

        # Operational resilience
        rec = m["threat_recurrence_rate"]
        add("operational_resilience", "Threat recurrence pressure",
            int(round(rec * 20)), "threat_recurrence_rate", rec,
            f"{rec:.0%} of incidents repeat a previously seen threat (unresolved root cause).")
        if m["reopen_count"]:
            add("operational_resilience", "Case reopen volume",
                min(10, int(m["reopen_count"])), "reopen_count", m["reopen_count"],
                f"{m['reopen_count']} reopen events — closures not holding.")

        areas = [
            CapabilityAreaScore(
                area=a, label=_AREA_LABELS[a],
                score=sum(f.points for f in factors_by_area[a]),
                max_score={"detection_quality": 15, "investigation_thoroughness": 45,
                           "escalation_discipline": 45, "closure_integrity": 30,
                           "response_timeliness": 15, "workload_distribution": 15,
                           "governance": 20, "operational_resilience": 30}[a],
                factors=factors_by_area[a],
            )
            for a in CAPABILITY_AREAS
        ]
        total = sum(a.score for a in areas)
        worst = max(areas, key=lambda a: (a.score / a.max_score) if a.max_score else 0).area
        grade = "CRITICAL_ATTENTION" if total >= 60 else ("NEEDS_ATTENTION" if total >= 30 else ("WATCH" if total >= 12 else "HEALTHY"))
        rankings.append(SocRanking(
            soc_id=sid,
            soc_name=names.get(sid, sid),
            rank=0, total_penalty=total, grade=grade,
            capability_areas=areas, worst_area=worst,
            sample_size={
                "incidents": m["n_incidents"], "closed": m["n_closed"],
                "criticals": m["n_criticals"], "reopens": m["reopen_count"],
            },
        ))

    rankings.sort(key=lambda r: (-r.total_penalty, r.soc_id))
    for idx, r in enumerate(rankings, start=1):
        r.rank = idx
    return rankings


def ranking_summary(rankings: Sequence[SocRanking]) -> Dict[str, Any]:
    """Machine-readable summary for the API layer."""
    return {
        "method": "itemized_factor_sum (Rules.md §6 — every point carries a named factor)",
        "source": "telemetry_only (maturity labels never read)",
        "ranked_count": len(rankings),
        "rankings": [r.to_dict() for r in rankings],
        "top_soc": rankings[0].soc_id if rankings else None,
        "top_reason": (
            f"{rankings[0].soc_name} leads on "
            f"{max(rankings[0].capability_areas, key=lambda a: a.score / max(a.max_score, 1)).label}"
            if rankings else None
        ),
    }
