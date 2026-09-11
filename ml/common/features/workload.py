"""Workload and Entity Breadth Metrics for ANVĪKṢA Feature Engine."""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Dict, Optional, Sequence

from ml.common.schemas.internal import (
    Alert,
    Event,
    Incident,
    Threat,
)


def compute_workload_and_breadth(
    alerts: Sequence[Alert],
    incidents: Sequence[Incident],
    events: Sequence[Event],
    threats: Sequence[Threat],
    t_start: datetime,
    t_end: datetime,
    analyst_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Computes individual analyst workload, asset diversity, and recurring threat patterns."""
    # Alerts in window
    w_alerts = [
        a for a in alerts
        if t_start <= a.timestamp <= t_end
        and (analyst_id is None or a.analyst_id == analyst_id)
    ]
    alerts_per_analyst = len(w_alerts)

    # Incidents created/assigned in window
    w_incidents = [
        inc for inc in incidents
        if t_start <= inc.created_at <= t_end
        and (analyst_id is None or inc.assigned_analyst_id == analyst_id)
    ]
    cases_per_analyst = len(w_incidents)

    # Active cases assigned at t_end
    active_cases_per_analyst = sum(
        1 for inc in incidents
        if inc.created_at <= t_end
        and (inc.closed_at is None or inc.closed_at > t_end)
        and (analyst_id is None or inc.assigned_analyst_id == analyst_id)
    )

    # Unique alert types
    unique_alert_types = len({a.alert_type for a in w_alerts if a.alert_type})

    # Unique assets touched in incidents or alerts
    assets_touched = set()
    for a in w_alerts:
        if a.asset_id:
            assets_touched.add(a.asset_id)
    for inc in w_incidents:
        for aid in inc.asset_ids:
            assets_touched.add(aid)
    unique_assets_touched = len(assets_touched)

    # Unique users / accounts touched from events
    w_events = [
        e for e in events
        if t_start <= e.timestamp <= t_end
        and (analyst_id is None or e.analyst_id == analyst_id)
    ]
    users_touched = set()
    for e in w_events:
        user = e.raw_payload.get("user") or e.raw_payload.get("username") or e.analyst_id
        if user:
            users_touched.add(str(user))
    unique_users_touched = len(users_touched)

    # Repeat indicators observed in window
    ioc_counter: Counter[str] = Counter()
    for e in w_events:
        ioc = e.raw_payload.get("ioc") or e.raw_payload.get("ip") or e.raw_payload.get("domain")
        if ioc:
            ioc_counter[str(ioc)] += 1
    repeat_indicator_count = sum(1 for cnt in ioc_counter.values() if cnt > 1)

    # Repeat threat/campaign count across incidents
    threat_counter: Counter[str] = Counter()
    for inc in w_incidents:
        for tid in inc.threat_ids:
            threat_counter[tid] += 1
    repeat_campaign_count = sum(1 for cnt in threat_counter.values() if cnt > 1)

    return {
        "alerts_per_analyst": float(alerts_per_analyst),
        "cases_per_analyst": float(cases_per_analyst),
        "active_cases_per_analyst": float(active_cases_per_analyst),
        "unique_alert_types": unique_alert_types,
        "unique_assets_touched": unique_assets_touched,
        "unique_users_touched": unique_users_touched,
        "repeat_indicator_count": repeat_indicator_count,
        "repeat_campaign_count": repeat_campaign_count,
    }
