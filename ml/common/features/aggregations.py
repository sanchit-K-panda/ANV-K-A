"""Window Aggregations for ANVĪKṢA Feature Engine."""
from __future__ import annotations

from datetime import datetime
import numpy as np
from typing import Any, Dict, List, Optional, Sequence

from ml.common.schemas.internal import (
    Alert,
    AnalystAction,
    Escalation,
    Incident,
    Investigation,
    SeverityLevel,
)


def compute_volume_aggregations(
    alerts: Sequence[Alert],
    incidents: Sequence[Incident],
    investigations: Sequence[Investigation],
    escalations: Sequence[Escalation],
    actions: Sequence[AnalystAction],
    t_start: datetime,
    t_end: datetime,
    analyst_id: Optional[str] = None,
) -> Dict[str, int]:
    """Calculates event counts and queue depths strictly bounded by window [t_start, t_end]."""
    # 1-3. Alerts arriving in window
    w_alerts = [a for a in alerts if t_start <= a.timestamp <= t_end]
    if analyst_id:
        w_alerts = [a for a in w_alerts if a.analyst_id == analyst_id]

    alerts_received = len(w_alerts)
    critical_alerts = sum(1 for a in w_alerts if a.severity == SeverityLevel.CRITICAL)
    high_alerts = sum(1 for a in w_alerts if a.severity == SeverityLevel.HIGH)

    # 4-6. Investigations
    w_inv_started = [
        inv for inv in investigations
        if t_start <= inv.started_at <= t_end
        and (analyst_id is None or inv.analyst_id == analyst_id)
    ]
    investigations_started = len(w_inv_started)

    w_inv_completed = [
        inv for inv in investigations
        if inv.completed_at and t_start <= inv.completed_at <= t_end
        and (analyst_id is None or inv.analyst_id == analyst_id)
    ]
    investigations_completed = len(w_inv_completed)

    # Reopened investigations or reopen actions
    reopen_actions = [
        act for act in actions
        if t_start <= act.timestamp <= t_end
        and "REOPEN" in act.action_type.upper()
        and (analyst_id is None or act.analyst_id == analyst_id)
    ]
    investigations_reopened = len(reopen_actions)

    # 7. Escalations
    w_escalations = [
        esc for esc in escalations
        if t_start <= esc.timestamp <= t_end
        and (analyst_id is None or esc.analyst_id == analyst_id)
    ]
    escalation_count = len(w_escalations)

    # 8. Closures
    w_closures = [
        inc for inc in incidents
        if inc.closed_at and t_start <= inc.closed_at <= t_end
        and (analyst_id is None or inc.assigned_analyst_id == analyst_id)
    ]
    closure_count = len(w_closures)

    # 9. Active cases at snapshot t_end (created <= t_end, and not closed or closed > t_end)
    active_cases = sum(
        1 for inc in incidents
        if inc.created_at <= t_end
        and (inc.closed_at is None or inc.closed_at > t_end)
        and (analyst_id is None or inc.assigned_analyst_id == analyst_id)
    )

    # 10. Queue depth (total unassigned or open backlog at t_end across SOC)
    queue_depth = sum(
        1 for inc in incidents
        if inc.created_at <= t_end
        and (inc.closed_at is None or inc.closed_at > t_end)
    )

    return {
        "alerts_received": alerts_received,
        "critical_alerts": critical_alerts,
        "high_alerts": high_alerts,
        "investigations_started": investigations_started,
        "investigations_completed": investigations_completed,
        "investigations_reopened": investigations_reopened,
        "escalations": escalation_count,
        "closures": closure_count,
        "active_cases": active_cases,
        "queue_depth": queue_depth,
    }


def compute_duration_aggregations(
    investigations: Sequence[Investigation],
    t_start: datetime,
    t_end: datetime,
    analyst_id: Optional[str] = None,
    default_median: float = 12.0,
) -> Dict[str, float]:
    """Computes investigation duration percentiles in minutes.

    REMEDIATION.md P0-1 honesty policy: when NO investigation completed in the window
    the features are 0.0, not synthetic defaults (15/12/30). Fabricated durations made
    skipped investigations indistinguishable from performed ones.
    """
    completed = [
        inv for inv in investigations
        if inv.completed_at and t_start <= inv.completed_at <= t_end
        and (analyst_id is None or inv.analyst_id == analyst_id)
    ]

    durations_min = [
        max(0.1, (inv.completed_at - inv.started_at).total_seconds() / 60.0)
        for inv in completed
        if inv.completed_at and inv.completed_at >= inv.started_at
    ]

    if not durations_min:
        return {
            "avg_investigation_duration": 0.0,
            "median_investigation_duration": 0.0,
            "p95_investigation_duration": 0.0,
        }

    arr = np.array(durations_min, dtype=np.float64)
    return {
        "avg_investigation_duration": round(float(np.mean(arr)), 2),
        "median_investigation_duration": round(float(np.median(arr)), 2),
        "p95_investigation_duration": round(float(np.percentile(arr, 95)), 2),
    }
