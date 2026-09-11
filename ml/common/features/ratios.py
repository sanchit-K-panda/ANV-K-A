"""Operational Ratios for ANVĪKṢA Feature Engine.

REMEDIATION.md P0-1 honesty policy: missing data is NEVER replaced with a
"healthy-looking" neutral (0.85 / 0.90 / 0.75). A window where no investigation was
completed must measure 0.0 — otherwise a SOC that skips its workflow looks identical
to one that performs it, and the anomaly signal is erased by the imputation itself.
"""
from __future__ import annotations

from typing import Dict


def compute_operational_ratios(
    volumes: Dict[str, int],
    prior_queue_depth: int = 0,
) -> Dict[str, float]:
    """Computes efficiency, escalation, and workload change ratios with safe division.

    All ratios are computed directly from observed window counts; when the numerator
    is zero the ratio is zero. No neutral-value imputation is applied anywhere.
    """
    alerts = volumes.get("alerts_received", 0)
    critical_alerts = volumes.get("critical_alerts", 0)
    inv_started = volumes.get("investigations_started", 0)
    inv_completed = volumes.get("investigations_completed", 0)
    inv_reopened = volumes.get("investigations_reopened", 0)
    escalations = volumes.get("escalations", 0)
    closures = volumes.get("closures", 0)
    active_cases = volumes.get("active_cases", 0)
    queue_depth = volumes.get("queue_depth", 0)

    # 17. investigation_rate = investigations_started / alerts observed
    investigation_rate = round(inv_started / alerts, 4) if alerts > 0 else 0.0

    # 18. completion_rate = investigations_completed / investigations started
    completion_rate = round(inv_completed / inv_started, 4) if inv_started > 0 else 0.0

    # 19. escalation_rate = escalations / investigations started
    escalation_rate = round(escalations / inv_started, 4) if inv_started > 0 else 0.0

    # 20. closure_rate = closures / (active cases + closures)
    total_handled = active_cases + closures
    closure_rate = round(closures / total_handled, 4) if total_handled > 0 else 0.0

    # 21. reopen_rate = investigations_reopened / investigations completed
    reopen_rate = round(inv_reopened / inv_completed, 4) if inv_completed > 0 else 0.0

    # 22. critical_alert_ratio = critical_alerts / alerts received
    critical_alert_ratio = round(critical_alerts / alerts, 4) if alerts > 0 else 0.0

    # 26. queue_growth_rate = (queue_depth - prior_queue_depth) / max(1, prior_queue_depth)
    if prior_queue_depth > 0:
        queue_growth_rate = round((queue_depth - prior_queue_depth) / prior_queue_depth, 4)
    else:
        queue_growth_rate = 0.0

    return {
        "investigation_rate": float(min(1.0, max(0.0, investigation_rate))),
        "completion_rate": float(min(1.0, max(0.0, completion_rate))),
        "escalation_rate": float(min(1.0, max(0.0, escalation_rate))),
        "closure_rate": float(min(1.0, max(0.0, closure_rate))),
        "reopen_rate": float(min(1.0, max(0.0, reopen_rate))),
        "critical_alert_ratio": float(min(1.0, max(0.0, critical_alert_ratio))),
        "queue_growth_rate": float(queue_growth_rate),
    }
