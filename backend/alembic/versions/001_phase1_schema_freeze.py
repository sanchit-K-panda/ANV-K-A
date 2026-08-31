"""phase1 schema freeze — 22 tables

Revision ID: 001_phase1
Revises:
Create Date: 2026-08-28

Phase 1 — Scaffold + Schema Freeze per Phases.md
Tables: users, biometric_profiles, user_devices, sessions, audit_logs,
        socs, analysts, devices (SOC), assets, threats, events, alerts,
        incidents, incident_alerts/threats/assets, investigations, escalations,
        analyst_actions, findings, risk_assessments, recommendations
Hash-chain integrity for audit_logs (Rules.md §7), no cloud deps.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_phase1"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Identity & Access
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("role", sa.Enum("SUPERVISOR", "ADMIN", "ANALYST", name="user_role"), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="ACTIVE"),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "biometric_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("protected_template", sa.LargeBinary(), nullable=False),
        sa.Column("encryption_key_reference", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_biometric_profiles_user_id", "biometric_profiles", ["user_id"])

    op.create_table(
        "user_devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("device_identifier", sa.String(255), nullable=False, unique=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trust_status", sa.String(50), nullable=False, server_default="UNVERIFIED"),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_user_devices_user_id", "user_devices", ["user_id"])
    op.create_index("ix_user_devices_trust_status", "user_devices", ["trust_status"])

    op.create_table(
        "sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("user_devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_status", sa.String(50), nullable=False, server_default="ACTIVE"),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("session_credential", sa.String(512), nullable=False),
        sa.Column("permissions", sa.Text(), nullable=False, server_default="{}"),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index("ix_sessions_device_id", "sessions", ["device_id"])
    op.create_index("ix_sessions_status", "sessions", ["session_status"])
    op.create_index("ix_sessions_credential", "sessions", ["session_credential"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource", sa.String(255), nullable=False),
        sa.Column("resource_id", sa.String(255), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("user_devices.id", ondelete="SET NULL"), nullable=True),
        sa.Column("identity_status", sa.String(50), nullable=False, server_default="UNKNOWN"),
        sa.Column("previous_hash", sa.String(64), nullable=True),
        sa.Column("current_hash", sa.String(64), nullable=False),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_session_id", "audit_logs", ["session_id"])
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])

    # SOC core
    op.create_table(
        "socs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("environment", sa.String(50), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("timezone", sa.String(100), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_socs_status", "socs", ["status"])

    op.create_table(
        "analysts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("TIER1", "TIER2", "TIER3", "SUPERVISOR", name="analyst_role"), nullable=False),
        sa.Column("skill_level", sa.Integer(), nullable=False),
        sa.Column("shift", sa.Enum("MORNING", "EVENING", "NIGHT", name="shift"), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_analysts_soc_id", "analysts", ["soc_id"])
    op.create_index("ix_analysts_role", "analysts", ["role"])

    op.create_table(
        "devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hostname", sa.String(255), nullable=False),
        sa.Column("device_type", sa.Enum("SIEM", "EDR", "IDS", "FIREWALL", "CASE_MANAGEMENT", name="device_type"), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("os", sa.String(100), nullable=False),
        sa.Column("criticality", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="criticality"), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="ONLINE"),
    )
    op.create_index("ix_devices_soc_id", "devices", ["soc_id"])
    op.create_index("ix_devices_type", "devices", ["device_type"])

    op.create_table(
        "assets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hostname", sa.String(255), nullable=False),
        sa.Column("asset_type", sa.Enum("SERVER", "WORKSTATION", "DATABASE", "NETWORK_DEVICE", "CLOUD_INSTANCE", "IOT", name="asset_type"), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("criticality", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="criticality"), nullable=False),
        sa.Column("business_unit", sa.String(255), nullable=False),
        sa.Column("owner", sa.String(255), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="ACTIVE"),
    )
    op.create_index("ix_assets_soc_id", "assets", ["soc_id"])
    op.create_index("ix_assets_type", "assets", ["asset_type"])
    op.create_index("ix_assets_criticality", "assets", ["criticality"])

    op.create_table(
        "threats",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", name="severity"), nullable=False),
        sa.Column("mitre_techniques", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("first_seen", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="ACTIVE"),
    )
    op.create_index("ix_threats_severity", "threats", ["severity"])
    op.create_index("ix_threats_status", "threats", ["status"])

    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("devices.id", ondelete="SET NULL"), nullable=True),
        sa.Column("analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", name="severity"), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("metadata", sa.Text(), nullable=False, server_default="{}"),
    )
    op.create_index("ix_events_soc_id", "events", ["soc_id"])
    op.create_index("ix_events_timestamp", "events", ["timestamp"])
    op.create_index("ix_events_severity", "events", ["severity"])
    op.create_index("ix_events_type", "events", ["event_type"])

    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", name="severity"), nullable=False),
        sa.Column("alert_type", sa.String(100), nullable=False),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.Enum("NEW", "TRIAGED", "CLOSED", name="alert_status"), nullable=False, server_default="NEW"),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_alerts_soc_id", "alerts", ["soc_id"])
    op.create_index("ix_alerts_timestamp", "alerts", ["timestamp"])
    op.create_index("ix_alerts_severity", "alerts", ["severity"])
    op.create_index("ix_alerts_status", "alerts", ["status"])
    op.create_index("ix_alerts_analyst_id", "alerts", ["analyst_id"])

    op.create_table(
        "incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", name="severity"), nullable=False),
        sa.Column("status", sa.Enum("OPEN", "INVESTIGATING", "ESCALATED", "RESOLVED", "CLOSED", name="incident_status"), nullable=False, server_default="OPEN"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("assigned_analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_incidents_soc_id", "incidents", ["soc_id"])
    op.create_index("ix_incidents_severity", "incidents", ["severity"])
    op.create_index("ix_incidents_status", "incidents", ["status"])
    op.create_index("ix_incidents_assigned_analyst_id", "incidents", ["assigned_analyst_id"])
    op.create_index("ix_incidents_created_at", "incidents", ["created_at"])

    op.create_table(
        "incident_alerts",
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("alert_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("alerts.id", ondelete="CASCADE"), primary_key=True),
    )
    op.create_table(
        "incident_threats",
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("threat_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("threats.id", ondelete="CASCADE"), primary_key=True),
    )
    op.create_table(
        "incident_assets",
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("assets.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "investigations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Enum("IN_PROGRESS", "COMPLETED", "ABANDONED", name="investigation_status"), nullable=False, server_default="IN_PROGRESS"),
        sa.Column("evidence_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
    )
    op.create_index("ix_investigations_incident_id", "investigations", ["incident_id"])
    op.create_index("ix_investigations_analyst_id", "investigations", ["analyst_id"])
    op.create_index("ix_investigations_status", "investigations", ["status"])

    op.create_table(
        "escalations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("escalated_to", sa.String(255), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.Enum("OPEN", "ACKNOWLEDGED", "RESOLVED", name="escalation_status"), nullable=False, server_default="OPEN"),
    )
    op.create_index("ix_escalations_incident_id", "escalations", ["incident_id"])
    op.create_index("ix_escalations_analyst_id", "escalations", ["analyst_id"])
    op.create_index("ix_escalations_timestamp", "escalations", ["timestamp"])

    op.create_table(
        "analyst_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("soc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("socs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action_type", sa.String(100), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("metadata", sa.Text(), nullable=False, server_default="{}"),
    )
    op.create_index("ix_analyst_actions_analyst_id", "analyst_actions", ["analyst_id"])
    op.create_index("ix_analyst_actions_soc_id", "analyst_actions", ["soc_id"])
    op.create_index("ix_analyst_actions_incident_id", "analyst_actions", ["incident_id"])
    op.create_index("ix_analyst_actions_timestamp", "analyst_actions", ["timestamp"])
    op.create_index("ix_analyst_actions_type", "analyst_actions", ["action_type"])

    # Analytics
    op.create_table(
        "findings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("type", sa.Enum("EXECUTION_GAP", "NEGATIVE_SPACE", "BEHAVIOURAL_ANOMALY", "RECURRING_THREAT", "WORKLOAD_IMBALANCE", "KPI_MANIPULATION", "IDENTITY_ANOMALY", name="finding_type"), nullable=False),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="finding_severity"), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("evidence", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.Enum("OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED", name="finding_status"), nullable=False, server_default="OPEN"),
        sa.Column("assigned_analyst_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("what", sa.Text(), nullable=False),
        sa.Column("why", sa.Text(), nullable=False),
        sa.Column("when", sa.DateTime(timezone=True), nullable=False),
        sa.Column("where", sa.String(500), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=False),
    )
    op.create_index("ix_findings_type", "findings", ["type"])
    op.create_index("ix_findings_severity", "findings", ["severity"])
    op.create_index("ix_findings_status", "findings", ["status"])
    op.create_index("ix_findings_incident_id", "findings", ["incident_id"])
    op.create_index("ix_findings_created_at", "findings", ["created_at"])

    op.create_table(
        "risk_assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("severity", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", name="risk_severity"), nullable=False),
        sa.Column("factors", sa.Text(), nullable=False),
        sa.Column("calculated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_risk_assessments_finding_id", "risk_assessments", ["finding_id"])
    op.create_index("ix_risk_assessments_score", "risk_assessments", ["score"])

    op.create_table(
        "recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("status", sa.String(50), nullable=False, server_default="PENDING"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_recommendations_finding_id", "recommendations", ["finding_id"])
    op.create_index("ix_recommendations_status", "recommendations", ["status"])


def downgrade() -> None:
    op.drop_table("recommendations")
    op.drop_table("risk_assessments")
    op.drop_table("findings")
    op.drop_table("analyst_actions")
    op.drop_table("escalations")
    op.drop_table("investigations")
    op.drop_table("incident_assets")
    op.drop_table("incident_threats")
    op.drop_table("incident_alerts")
    op.drop_table("incidents")
    op.drop_table("alerts")
    op.drop_table("events")
    op.drop_table("threats")
    op.drop_table("assets")
    op.drop_table("devices")
    op.drop_table("analysts")
    op.drop_table("socs")
    op.drop_table("audit_logs")
    op.drop_table("sessions")
    op.drop_table("user_devices")
    op.drop_table("biometric_profiles")
    op.drop_table("users")
    # Drop enums
    for name in ["user_role", "analyst_role", "shift", "device_type", "criticality", "severity", "alert_status", "incident_status", "investigation_status", "escalation_status", "finding_type", "finding_severity", "finding_status", "risk_severity", "asset_type"]:
        sa.Enum(name=name).drop(op.get_bind(), checkfirst=True)
