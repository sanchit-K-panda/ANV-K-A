"""Ingestion service — validation → normalization → correlation IDs → persist.

Handles deterministic UUID mapping for simulator string IDs, FK ordering,
idempotent upserts, and bulk inserts for thousands of records.
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.ingestion.normalize import dumps_json
from app.models.analytics import Finding, Recommendation, RiskAssessment
from app.models.identity import AuditLog, BiometricProfile, Session, User, UserDevice
from app.models.soc import (
    Alert,
    Analyst,
    AnalystAction,
    Asset,
    Criticality,
    Device,
    Escalation,
    Event,
    Incident,
    IncidentAlert,
    IncidentAsset,
    IncidentThreat,
    Investigation,
    Soc,
    Threat,
)
from app.schemas.ingestion import (
    AlertIngest,
    AnalystActionIngest,
    AnalystIngest,
    AssetIngest,
    BatchIngestRequest,
    DeviceIngest,
    EscalationIngest,
    EventIngest,
    IncidentIngest,
    InvestigationIngest,
    SocIngest,
    ThreatIngest,
    to_uuid,
)

logger = logging.getLogger(__name__)


# ---------- Helpers: idempotent upsert ----------

async def _upsert_soc(db: AsyncSession, data: SocIngest) -> bool:
    """Returns True if inserted/updated, False if skipped due error."""
    try:
        uid = to_uuid(data.soc_id)
        existing = await db.get(Soc, uid)
        if existing:
            # Update
            existing.name = data.name
            existing.environment = data.environment
            existing.location = data.location
            existing.timezone = data.timezone
            existing.status = data.status
            existing.created_at = data.created_at
        else:
            db.add(Soc(
                id=uid,
                name=data.name,
                environment=data.environment,
                location=data.location,
                timezone=data.timezone,
                status=data.status,
                created_at=data.created_at,
            ))
        return True
    except Exception as e:
        logger.warning("Soc upsert failed %s: %s", data.soc_id, e)
        return False


async def _upsert_analyst(db: AsyncSession, data: AnalystIngest) -> bool:
    try:
        uid = to_uuid(data.analyst_id)
        soc_uid = to_uuid(data.soc_id)
        existing = await db.get(Analyst, uid)
        if existing:
            existing.soc_id = soc_uid
            existing.name = data.name
            existing.role = data.role
            existing.skill_level = data.skill_level
            existing.shift = data.shift
            existing.status = data.status
            existing.created_at = data.created_at
        else:
            db.add(Analyst(
                id=uid,
                soc_id=soc_uid,
                name=data.name,
                role=data.role,
                skill_level=data.skill_level,
                shift=data.shift,
                status=data.status,
                created_at=data.created_at,
            ))
        return True
    except Exception as e:
        logger.warning("Analyst upsert failed %s: %s", data.analyst_id, e)
        return False


async def _upsert_device(db: AsyncSession, data: DeviceIngest) -> bool:
    try:
        uid = to_uuid(data.device_id)
        soc_uid = to_uuid(data.soc_id)
        existing = await db.get(Device, uid)
        if existing:
            existing.soc_id = soc_uid
            existing.hostname = data.hostname
            existing.device_type = data.device_type
            existing.ip_address = data.ip_address
            existing.os = data.os
            existing.criticality = data.criticality
            existing.status = data.status
        else:
            db.add(Device(
                id=uid,
                soc_id=soc_uid,
                hostname=data.hostname,
                device_type=data.device_type,
                ip_address=data.ip_address,
                os=data.os,
                criticality=data.criticality,
                status=data.status,
            ))
        return True
    except Exception as e:
        logger.warning("Device upsert failed %s: %s", data.device_id, e)
        return False


async def _upsert_asset(db: AsyncSession, data: AssetIngest) -> bool:
    try:
        uid = to_uuid(data.asset_id)
        soc_uid = to_uuid(data.soc_id)
        existing = await db.get(Asset, uid)
        if existing:
            existing.soc_id = soc_uid
            existing.hostname = data.hostname
            existing.asset_type = data.asset_type
            existing.ip_address = data.ip_address
            existing.criticality = data.criticality
            existing.business_unit = data.business_unit
            existing.owner = data.owner
            existing.status = data.status
        else:
            db.add(Asset(
                id=uid,
                soc_id=soc_uid,
                hostname=data.hostname,
                asset_type=data.asset_type,
                ip_address=data.ip_address,
                criticality=data.criticality,
                business_unit=data.business_unit,
                owner=data.owner,
                status=data.status,
            ))
        return True
    except Exception as e:
        logger.warning("Asset upsert failed %s: %s", data.asset_id, e)
        return False


async def _upsert_threat(db: AsyncSession, data: ThreatIngest) -> bool:
    try:
        uid = to_uuid(data.threat_id)
        existing = await db.get(Threat, uid)
        mitre: str = dumps_json(data.mitre_techniques) if data.mitre_techniques else "[]"
        if existing:
            existing.name = data.name
            existing.category = data.category
            existing.severity = data.severity
            existing.mitre_techniques = mitre  # type: ignore
            existing.first_seen = data.first_seen
            existing.last_seen = data.last_seen
            existing.status = data.status
        else:
            db.add(Threat(
                id=uid,
                name=data.name,
                category=data.category,
                severity=data.severity,
                mitre_techniques=mitre,  # type: ignore[arg-type]
                first_seen=data.first_seen,
                last_seen=data.last_seen,
                status=data.status,
            ))
        return True
    except Exception as e:
        logger.warning("Threat upsert failed %s: %s", data.threat_id, e)
        return False


async def _upsert_event(db: AsyncSession, data: EventIngest) -> bool:
    try:
        uid = to_uuid(data.event_id)
        soc_uid = to_uuid(data.soc_id)
        asset_uid = to_uuid(data.asset_id) if data.asset_id else None
        device_uid = to_uuid(data.device_id) if data.device_id else None
        analyst_uid = to_uuid(data.analyst_id) if data.analyst_id else None
        existing = await db.get(Event, uid)
        meta = dumps_json(data.metadata)
        if existing:
            existing.soc_id = soc_uid
            existing.timestamp = data.timestamp
            existing.event_type = data.event_type
            existing.source = data.source
            existing.asset_id = asset_uid
            existing.device_id = device_uid
            existing.analyst_id = analyst_uid
            existing.severity = data.severity
            existing.description = data.description
            existing.extra_data = meta
        else:
            db.add(Event(
                id=uid,
                soc_id=soc_uid,
                timestamp=data.timestamp,
                event_type=data.event_type,
                source=data.source,
                asset_id=asset_uid,
                device_id=device_uid,
                analyst_id=analyst_uid,
                severity=data.severity,
                description=data.description,
                extra_data=meta,
            ))
        return True
    except Exception as e:
        logger.warning("Event upsert failed %s: %s", data.event_id, e)
        return False


_DEVICE_CACHE: dict[uuid.UUID, uuid.UUID] = {}


async def _resolve_device_for_alert(db: AsyncSession, soc_uid: uuid.UUID, asset_uid: uuid.UUID) -> uuid.UUID | None:
    """Resolve source_device_id for alert: try asset's device, else first device of SOC (cached)."""
    if soc_uid in _DEVICE_CACHE:
        return _DEVICE_CACHE[soc_uid]
    result = await db.execute(select(Device.id).where(Device.soc_id == soc_uid).limit(1))
    row = result.scalar_one_or_none()
    if row:
        _DEVICE_CACHE[soc_uid] = row
        return row
    fallback = to_uuid(f"DEV-FALLBACK-{soc_uid}")
    _DEVICE_CACHE[soc_uid] = fallback
    return fallback


async def _upsert_alert(db: AsyncSession, data: AlertIngest) -> bool:
    try:
        uid = to_uuid(data.alert_id)
        soc_uid = to_uuid(data.soc_id)
        asset_uid = to_uuid(data.asset_id)
        analyst_uid = to_uuid(data.analyst_id)
        existing = await db.get(Alert, uid)
        event_ids_str: str = dumps_json([str(to_uuid(eid)) for eid in data.event_ids] if data.event_ids else [])
        # Resolve device
        source_device_id = await _resolve_device_for_alert(db, soc_uid, asset_uid)
        if source_device_id is None:
            logger.warning("Alert %s: could not resolve source_device_id, skipping", data.alert_id)
            return False
        if existing:
            existing.soc_id = soc_uid
            existing.timestamp = data.timestamp
            existing.source = data.source
            existing.severity = data.severity
            existing.alert_type = data.alert_type
            existing.asset_id = asset_uid
            existing.source_device_id = source_device_id
            existing.event_ids = event_ids_str  # type: ignore
            existing.analyst_id = analyst_uid
            existing.status = data.status
            existing.priority = data.priority
            existing.created_at = data.created_at
            existing.closed_at = data.closed_at
        else:
            # If fallback device doesn't exist, create dummy device
            if source_device_id:
                dev = await db.get(Device, source_device_id)
                if not dev:
                    # Create minimal dummy device so FK holds
                    # Only if fallback UUID
                    dummy_soc = await db.get(Soc, soc_uid)
                    if dummy_soc:
                        db.add(Device(
                            id=source_device_id,
                            soc_id=soc_uid,
                            hostname=f"fallback-{str(source_device_id)[:8]}",
                            device_type="SIEM",
                            ip_address="0.0.0.0",
                            os="Unknown",
                            criticality="LOW",
                            status="ONLINE",
                        ))
                        await db.flush()
            db.add(Alert(
                id=uid,
                soc_id=soc_uid,
                timestamp=data.timestamp,
                source=data.source,
                severity=data.severity,
                alert_type=data.alert_type,
                asset_id=asset_uid,
                source_device_id=source_device_id,
                event_ids=event_ids_str,
                analyst_id=analyst_uid,
                status=data.status,
                priority=data.priority,
                created_at=data.created_at,
                closed_at=data.closed_at,
            ))
        return True
    except Exception as e:
        logger.warning("Alert upsert failed %s: %s", data.alert_id, e, exc_info=True)
        return False


async def _upsert_incident(db: AsyncSession, data: IncidentIngest) -> bool:
    try:
        uid = to_uuid(data.incident_id)
        soc_uid = to_uuid(data.soc_id)
        analyst_uid = to_uuid(data.assigned_analyst_id)
        existing = await db.get(Incident, uid)
        if existing:
            existing.soc_id = soc_uid
            existing.severity = data.severity
            existing.status = data.status
            existing.created_at = data.created_at
            existing.closed_at = data.closed_at
            existing.assigned_analyst_id = analyst_uid
        else:
            db.add(Incident(
                id=uid,
                soc_id=soc_uid,
                severity=data.severity,
                status=data.status,
                created_at=data.created_at,
                closed_at=data.closed_at,
                assigned_analyst_id=analyst_uid,
            ))
            await db.flush()  # need ID for junctions

        # Handle junction tables — clear and re-add to ensure idempotency
        # For simplicity, delete existing junctions for this incident
        await db.execute(delete(IncidentAlert).where(IncidentAlert.incident_id == uid))
        await db.execute(delete(IncidentThreat).where(IncidentThreat.incident_id == uid))
        await db.execute(delete(IncidentAsset).where(IncidentAsset.incident_id == uid))

        for aid in data.alert_ids:
            try:
                alert_uid = to_uuid(aid)
                # Only add if alert exists (or allow dangling)
                db.add(IncidentAlert(incident_id=uid, alert_id=alert_uid))
            except Exception:
                continue
        for tid in data.threat_ids:
            try:
                tid_uid = to_uuid(tid)
                db.add(IncidentThreat(incident_id=uid, threat_id=tid_uid))
            except Exception:
                continue
        for asid in data.asset_ids:
            try:
                as_uid = to_uuid(asid)
                db.add(IncidentAsset(incident_id=uid, asset_id=as_uid))
            except Exception:
                continue

        return True
    except Exception as e:
        logger.warning("Incident upsert failed %s: %s", data.incident_id, e, exc_info=True)
        return False


async def _upsert_investigation(db: AsyncSession, data: InvestigationIngest) -> bool:
    try:
        uid = to_uuid(data.investigation_id)
        incident_uid = to_uuid(data.incident_id)
        analyst_uid = to_uuid(data.analyst_id)
        existing = await db.get(Investigation, uid)
        if existing:
            existing.incident_id = incident_uid
            existing.analyst_id = analyst_uid
            existing.started_at = data.started_at
            existing.completed_at = data.completed_at
            existing.status = data.status
            existing.evidence_count = data.evidence_count
            existing.notes = data.notes
        else:
            db.add(Investigation(
                id=uid,
                incident_id=incident_uid,
                analyst_id=analyst_uid,
                started_at=data.started_at,
                completed_at=data.completed_at,
                status=data.status,
                evidence_count=data.evidence_count,
                notes=data.notes,
            ))
        return True
    except Exception as e:
        logger.warning("Investigation upsert failed %s: %s", data.investigation_id, e)
        return False


async def _upsert_escalation(db: AsyncSession, data: EscalationIngest) -> bool:
    try:
        uid = to_uuid(data.escalation_id)
        incident_uid = to_uuid(data.incident_id)
        analyst_uid = to_uuid(data.analyst_id)
        existing = await db.get(Escalation, uid)
        if existing:
            existing.incident_id = incident_uid
            existing.analyst_id = analyst_uid
            existing.escalated_to = data.escalated_to
            existing.reason = data.reason
            existing.timestamp = data.timestamp
            existing.status = data.status
        else:
            db.add(Escalation(
                id=uid,
                incident_id=incident_uid,
                analyst_id=analyst_uid,
                escalated_to=data.escalated_to,
                reason=data.reason,
                timestamp=data.timestamp,
                status=data.status,
            ))
        return True
    except Exception as e:
        logger.warning("Escalation upsert failed %s: %s", data.escalation_id, e)
        return False


async def _upsert_action(db: AsyncSession, data: AnalystActionIngest) -> bool:
    try:
        uid = to_uuid(data.action_id)
        analyst_uid = to_uuid(data.analyst_id)
        soc_uid = to_uuid(data.soc_id)
        incident_uid = to_uuid(data.incident_id) if data.incident_id else None
        existing = await db.get(AnalystAction, uid)
        meta = dumps_json(data.metadata)
        if existing:
            existing.analyst_id = analyst_uid
            existing.soc_id = soc_uid
            existing.incident_id = incident_uid
            existing.action_type = data.action_type
            existing.timestamp = data.timestamp
            existing.duration_seconds = data.duration_seconds
            existing.extra_data = meta
        else:
            db.add(AnalystAction(
                id=uid,
                analyst_id=analyst_uid,
                soc_id=soc_uid,
                incident_id=incident_uid,
                action_type=data.action_type,
                timestamp=data.timestamp,
                duration_seconds=data.duration_seconds,
                extra_data=meta,
            ))
        return True
    except Exception as e:
        logger.warning("Action upsert failed %s: %s", data.action_id, e)
        return False


# ---------- Batch orchestrator ----------

async def ingest_batch(db: AsyncSession, payload: BatchIngestRequest) -> dict[str, int]:
    """Ingest full batch in FK-safe order, returns counts per entity."""
    counts: dict[str, int] = {}

    # Order matters for FKs
    # 1 Socs
    c = 0
    for item in payload.socs:
        if await _upsert_soc(db, item):
            c += 1
    if c:
        await db.flush()
    counts["socs"] = c

    # 2 Threats (no FK)
    c = 0
    for item in payload.threats:
        if await _upsert_threat(db, item):
            c += 1
    if c:
        await db.flush()
    counts["threats"] = c

    # 3 Analysts + Devices + Assets (depend on Socs)
    c = 0
    for item in payload.analysts:
        if await _upsert_analyst(db, item):
            c += 1
    await db.flush()
    counts["analysts"] = c

    c = 0
    for item in payload.devices:
        if await _upsert_device(db, item):
            c += 1
    if c:
        await db.flush()
    counts["devices"] = c

    c = 0
    for item in payload.assets:
        if await _upsert_asset(db, item):
            c += 1
    if c:
        await db.flush()
    counts["assets"] = c

    # 4 Events (depend on soc/asset/device/analyst)
    c = 0
    for item in payload.events:
        if await _upsert_event(db, item):
            c += 1
            # flush in batches to avoid large transaction
            if c % 500 == 0:
                await db.flush()
    if c:
        await db.flush()
    counts["events"] = c

    # 5 Alerts (depend on soc/asset/analyst/event)
    c = 0
    for item in payload.alerts:
        if await _upsert_alert(db, item):
            c += 1
            if c % 500 == 0:
                await db.flush()
    if c:
        await db.flush()
    counts["alerts"] = c

    # 6 Incidents + junctions (depend on soc/analyst/alert)
    c = 0
    for item in payload.incidents:
        if await _upsert_incident(db, item):
            c += 1
            if c % 100 == 0:
                await db.flush()
    if c:
        await db.flush()
    counts["incidents"] = c

    # 7 Investigations / Escalations / Actions
    c = 0
    for item in payload.investigations:
        if await _upsert_investigation(db, item):
            c += 1
            if c % 500 == 0:
                await db.flush()
    if c:
        await db.flush()
    counts["investigations"] = c

    c = 0
    for item in payload.escalations:
        if await _upsert_escalation(db, item):
            c += 1
            if c % 500 == 0:
                await db.flush()
    if c:
        await db.flush()
    counts["escalations"] = c

    c = 0
    for item in payload.analyst_actions:
        if await _upsert_action(db, item):
            c += 1
            if c % 500 == 0:
                await db.flush()
    if c:
        await db.flush()
    counts["analyst_actions"] = c

    await db.commit()
    return counts


async def get_stats(db: AsyncSession) -> dict[str, int]:
    from sqlalchemy import func

    stats: dict[str, int] = {}
    for model, key in [
        (Soc, "socs"),
        (Analyst, "analysts"),
        (Device, "devices"),
        (Asset, "assets"),
        (Threat, "threats"),
        (Event, "events"),
        (Alert, "alerts"),
        (Incident, "incidents"),
        (Investigation, "investigations"),
        (Escalation, "escalations"),
        (AnalystAction, "analyst_actions"),
    ]:
        result = await db.execute(select(func.count()).select_from(model))
        stats[key] = result.scalar_one()
    return stats
