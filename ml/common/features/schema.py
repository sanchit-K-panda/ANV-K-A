"""Machine-readable Feature Schema definitions for ANVĪKṢA Behavioural Engine.

Defines all 31 operational features per prompt §12 and §13 with explicit metadata:
name, type, definition, source fields, aggregation, unit, missing-value strategy, version.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Any, Dict, List


@dataclass(frozen=True)
class FeatureDefinition:
    feature_name: str
    type: str  # "int" or "float"
    definition: str
    source_fields: List[str]
    aggregation: str
    unit: str
    missing_strategy: str  # "zero" (honest absence) or "baseline_median"
    default_missing_value: float
    version: str = "1.1"


# Canonical 31 behavioural features
FEATURE_DEFINITIONS: List[FeatureDefinition] = [
    # 1-3: Alert Counts
    FeatureDefinition(
        feature_name="alerts_received",
        type="int",
        definition="Total alerts arriving in time window",
        source_fields=["alert.created_at", "alert.alert_id"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="critical_alerts",
        type="int",
        definition="Total CRITICAL severity alerts in window",
        source_fields=["alert.severity"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="high_alerts",
        type="int",
        definition="Total HIGH severity alerts in window",
        source_fields=["alert.severity"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 4-8: Investigation & Workflow Volumes
    FeatureDefinition(
        feature_name="investigations_started",
        type="int",
        definition="Investigations initiated during window",
        source_fields=["investigation.started_at"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="investigations_completed",
        type="int",
        definition="Investigations concluded during window",
        source_fields=["investigation.completed_at"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="investigations_reopened",
        type="int",
        definition="Investigations reopened after prior closure",
        source_fields=["investigation.status", "action.action_type"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="escalations",
        type="int",
        definition="Incidents escalated to Tier-2 or Supervisor during window",
        source_fields=["escalation.timestamp"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="closures",
        type="int",
        definition="Incidents closed during window",
        source_fields=["incident.closed_at"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 9-10: Queues & Active Work
    FeatureDefinition(
        feature_name="active_cases",
        type="int",
        definition="Unclosed incidents assigned or open at end of window",
        source_fields=["incident.status", "incident.assigned_analyst_id"],
        aggregation="snapshot_count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="queue_depth",
        type="int",
        definition="Pending unassigned or open backlog at end of window",
        source_fields=["incident.status"],
        aggregation="snapshot_count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 11-13: Durations
    FeatureDefinition(
        feature_name="avg_investigation_duration",
        type="float",
        definition="Mean duration in minutes for investigations completed in window (0.0 when none completed)",
        source_fields=["investigation.started_at", "investigation.completed_at"],
        aggregation="mean",
        unit="minutes",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="median_investigation_duration",
        type="float",
        definition="Median duration in minutes for investigations completed in window (0.0 when none completed)",
        source_fields=["investigation.started_at", "investigation.completed_at"],
        aggregation="median",
        unit="minutes",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="p95_investigation_duration",
        type="float",
        definition="95th percentile duration in minutes for investigations completed in window (0.0 when none completed)",
        source_fields=["investigation.started_at", "investigation.completed_at"],
        aggregation="p95",
        unit="minutes",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 14-16: Response Latencies
    FeatureDefinition(
        feature_name="avg_time_to_assignment",
        type="float",
        definition="Mean minutes between incident creation and analyst assignment (0.0 when no incidents)",
        source_fields=["incident.created_at", "action.timestamp"],
        aggregation="mean",
        unit="minutes",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="avg_time_to_escalation",
        type="float",
        definition="Mean minutes between incident creation and escalation dispatch (0.0 when no escalations)",
        source_fields=["incident.created_at", "escalation.timestamp"],
        aggregation="mean",
        unit="minutes",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="avg_time_to_closure",
        type="float",
        definition="Mean minutes between incident creation and final resolution/closure (0.0 when no closures)",
        source_fields=["incident.created_at", "incident.closed_at"],
        aggregation="mean",
        unit="minutes",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 17-22: Efficiency & Escalation Ratios
    FeatureDefinition(
        feature_name="investigation_rate",
        type="float",
        definition="Ratio of investigations started to alerts/cases received",
        source_fields=["investigations_started", "alerts_received"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="completion_rate",
        type="float",
        definition="Ratio of investigations completed to investigations started",
        source_fields=["investigations_completed", "investigations_started"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="escalation_rate",
        type="float",
        definition="Ratio of escalations to investigations started",
        source_fields=["escalations", "investigations_started"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="closure_rate",
        type="float",
        definition="Ratio of closures to active cases handled in window",
        source_fields=["closures", "active_cases"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="reopen_rate",
        type="float",
        definition="Ratio of reopened investigations to completed investigations",
        source_fields=["investigations_reopened", "investigations_completed"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="critical_alert_ratio",
        type="float",
        definition="Proportion of alerts arriving that are CRITICAL severity",
        source_fields=["critical_alerts", "alerts_received"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 23-26: Workload Distribution & Dynamics
    FeatureDefinition(
        feature_name="alerts_per_analyst",
        type="float",
        definition="Alerts assigned to this analyst in window",
        source_fields=["alert.analyst_id"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="cases_per_analyst",
        type="float",
        definition="Incidents assigned to this analyst in window",
        source_fields=["incident.assigned_analyst_id"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="active_cases_per_analyst",
        type="float",
        definition="Active open cases assigned to this analyst at window end",
        source_fields=["incident.status", "incident.assigned_analyst_id"],
        aggregation="snapshot_count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="queue_growth_rate",
        type="float",
        definition="Net percentage change in queue depth over window: (end - start) / start",
        source_fields=["queue_depth"],
        aggregation="delta",
        unit="rate",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 27-31: Investigation Breadth & Recurrence
    FeatureDefinition(
        feature_name="unique_alert_types",
        type="int",
        definition="Count of distinct alert types handled in window",
        source_fields=["alert.alert_type"],
        aggregation="count_distinct",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="unique_assets_touched",
        type="int",
        definition="Count of distinct assets investigated in window",
        source_fields=["incident.asset_ids", "alert.asset_id"],
        aggregation="count_distinct",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="unique_users_touched",
        type="int",
        definition="Count of distinct usernames / entity owners investigated in window",
        source_fields=["event.analyst_id", "asset.owner"],
        aggregation="count_distinct",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="repeat_indicator_count",
        type="int",
        definition="Count of indicators observed multiple times in window",
        source_fields=["event.metadata.ioc", "threat.threat_id"],
        aggregation="count_repeat",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="repeat_campaign_count",
        type="int",
        definition="Count of known threats / campaigns recurring across incidents in window",
        source_fields=["incident.threat_ids"],
        aggregation="count_repeat",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),

    # 32-35 (schema v1.1, REMEDIATION.md P2-7): the three PS capability areas
    # Governance / Operational Discipline / Cyber Resilience as measurable indicators.
    FeatureDefinition(
        feature_name="escalation_signoff_rate",
        type="float",
        definition="GOVERNANCE: share of escalations in window with supervisor sign-off (RESOLVED status)",
        source_fields=["escalation.status"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="escalation_coverage_rate",
        type="float",
        definition="GOVERNANCE: share of critical incidents in window that were escalated at all (approval-skip detector)",
        source_fields=["incident.severity", "escalation.incident_id"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="investigation_documentation_rate",
        type="float",
        definition="OPERATIONAL DISCIPLINE: share of completed investigations in window with non-empty written notes",
        source_fields=["investigation.notes"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="threat_recurrence_rate",
        type="float",
        definition="CYBER RESILIENCE: share of closed incidents in window linked to a threat seen in more than one incident",
        source_fields=["incident.threat_ids", "incident.closed_at"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="closure_discipline_rate",
        type="float",
        definition="OPERATIONAL DISCIPLINE: share of incidents closed in window with a recorded investigation (closure-gaming detector)",
        source_fields=["incident.closed_at", "investigation.incident_id"],
        aggregation="ratio",
        unit="ratio",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="closures_without_investigation",
        type="int",
        definition="OPERATIONAL DISCIPLINE: count of incidents closed in window with NO recorded investigation (zero for idle windows)",
        source_fields=["incident.closed_at", "investigation.incident_id"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="critical_without_escalation",
        type="int",
        definition="GOVERNANCE: count of critical incidents created in window with no escalation anywhere in the record (zero for idle windows)",
        source_fields=["incident.severity", "escalation.incident_id"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
    FeatureDefinition(
        feature_name="closures_without_response",
        type="int",
        definition="OPERATIONAL DISCIPLINE: count of incidents closed in window with no RESPONSE action anywhere in the record (zero for idle windows)",
        source_fields=["incident.closed_at", "action.action_type"],
        aggregation="count",
        unit="count",
        missing_strategy="zero",
        default_missing_value=0.0,
    ),
]

FEATURE_MAP: Dict[str, FeatureDefinition] = {f.feature_name: f for f in FEATURE_DEFINITIONS}
FEATURE_NAMES: List[str] = [f.feature_name for f in FEATURE_DEFINITIONS]


def export_feature_schema_dict() -> Dict[str, Any]:
    return {
        "version": "1.1",
        "feature_count": len(FEATURE_DEFINITIONS),
        "changes_vs_1.0": [
            "missing-value policy: honest absence (0.0) replaces neutral-value imputation",
            "added governance indicators: escalation_signoff_rate, escalation_coverage_rate",
            "added discipline indicators: investigation_documentation_rate, closure_discipline_rate, closures_without_investigation, closures_without_response",
            "added governance indicator: critical_without_escalation",
            "added resilience indicator: threat_recurrence_rate",
        ],
        "features": [asdict(f) for f in FEATURE_DEFINITIONS],
    }


def export_feature_schema_json() -> str:
    return json.dumps(export_feature_schema_dict(), indent=2)
