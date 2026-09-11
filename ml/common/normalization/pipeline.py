"""Normalization Pipeline for ANVĪKṢA Data Layer.

Composes timestamps, identifiers, severity, indicators, and entities normalization
with source-aware deduplication and provenance metadata tracking.
"""
from __future__ import annotations

from typing import Any, Dict, Generic, List, Optional, Set, Tuple, Type, TypeVar
from pydantic import BaseModel

from ml.common.normalization.identifiers import compute_deterministic_hash, normalize_identifier
from ml.common.normalization.severity import normalize_severity
from ml.common.normalization.timestamps import normalize_timestamp, utc_now
from ml.common.schemas.internal import (
    Alert,
    AnalystAction,
    Asset,
    BaseEntity,
    Escalation,
    Event,
    Incident,
    Indicator,
    Investigation,
    Provenance,
    SeverityLevel,
    Threat,
)

T = TypeVar("T", bound=BaseEntity)


class SourceAwareDeduplicator:
    """Maintains source-aware observation records instead of destructive deduplication.

    Rule per prompt §31:
    'Do not blindly deduplicate identical-looking records from different sources.
     Maintain indicator + source + observation timestamp as a relationship rather than deleting one.'
    """

    def __init__(self) -> None:
        self._seen_signatures: Set[str] = set()
        self.duplicate_count: int = 0

    def is_duplicate(self, record: Dict[str, Any], entity_type: str, source: str) -> bool:
        """Determines if this exact observation from this exact source has already been recorded."""
        record_copy = dict(record)
        record_copy["__entity_type__"] = entity_type
        record_copy["__source__"] = source
        sig = compute_deterministic_hash(record_copy, include_source=True)
        if sig in self._seen_signatures:
            self.duplicate_count += 1
            return True
        self._seen_signatures.add(sig)
        return False


class NormalizationPipeline:
    """Central normalization orchestrator converting raw dictionary data into validated internal models."""

    def __init__(self, default_source: str = "maya_soc_simulator", license_name: str = "MIT") -> None:
        self.default_source = default_source
        self.license_name = license_name
        self.deduplicator = SourceAwareDeduplicator()

    def create_provenance(
        self,
        source: Optional[str] = None,
        source_record_id: Optional[str] = None,
        event_timestamp: Optional[Any] = None,
        source_confidence: float = 1.0,
    ) -> Provenance:
        ts = normalize_timestamp(event_timestamp) if event_timestamp else None
        return Provenance(
            source=source or self.default_source,
            source_record_id=str(source_record_id) if source_record_id is not None else None,
            event_timestamp=ts,
            source_confidence=source_confidence,
            license=self.license_name,
        )

    def normalize_event(self, raw: Dict[str, Any], source: Optional[str] = None) -> Optional[Event]:
        src = source or raw.get("source") or self.default_source
        if self.deduplicator.is_duplicate(raw, "event", src):
            return None

        event_id = normalize_identifier("event", raw.get("event_id"))
        ts = normalize_timestamp(raw.get("timestamp"))
        sev = normalize_severity(raw.get("severity"))
        prov = self.create_provenance(src, event_id, ts)

        return Event(
            event_id=event_id,
            soc_id=str(raw.get("soc_id", "SOC-001")),
            timestamp=ts,
            event_type=str(raw.get("event_type", "UNKNOWN")),
            source=str(raw.get("source", src)),
            asset_id=normalize_identifier("asset", raw["asset_id"]) if raw.get("asset_id") else None,
            device_id=normalize_identifier("device", raw["device_id"]) if raw.get("device_id") else None,
            analyst_id=normalize_identifier("analyst", raw["analyst_id"]) if raw.get("analyst_id") else None,
            severity=sev,
            description=str(raw.get("description", "")),
            raw_payload=raw.get("metadata", {}),
            provenance=prov,
        )

    def normalize_alert(self, raw: Dict[str, Any], source: Optional[str] = None) -> Optional[Alert]:
        src = source or raw.get("source") or self.default_source
        if self.deduplicator.is_duplicate(raw, "alert", src):
            return None

        alert_id = normalize_identifier("alert", raw.get("alert_id"))
        ts = normalize_timestamp(raw.get("timestamp") or raw.get("created_at"))
        created_at = normalize_timestamp(raw.get("created_at") or ts)
        closed_at = normalize_timestamp(raw["closed_at"]) if raw.get("closed_at") else None
        sev = normalize_severity(raw.get("severity"))
        prov = self.create_provenance(src, alert_id, ts)

        event_ids = [normalize_identifier("event", eid) for eid in raw.get("event_ids", [])]

        return Alert(
            alert_id=alert_id,
            soc_id=str(raw.get("soc_id", "SOC-001")),
            timestamp=ts,
            source=str(raw.get("source", src)),
            severity=sev,
            alert_type=str(raw.get("alert_type", "ANOMALY")),
            asset_id=normalize_identifier("asset", raw.get("asset_id", "AST-UNKNOWN")),
            event_ids=event_ids,
            analyst_id=normalize_identifier("analyst", raw["analyst_id"]) if raw.get("analyst_id") else None,
            status=str(raw.get("status", "NEW")),
            priority=int(raw.get("priority", 3)),
            created_at=created_at,
            closed_at=closed_at,
            provenance=prov,
        )

    def normalize_incident(self, raw: Dict[str, Any], source: Optional[str] = None) -> Optional[Incident]:
        src = source or self.default_source
        if self.deduplicator.is_duplicate(raw, "incident", src):
            return None

        inc_id = normalize_identifier("incident", raw.get("incident_id"))
        created_at = normalize_timestamp(raw.get("created_at"))
        closed_at = normalize_timestamp(raw["closed_at"]) if raw.get("closed_at") else None
        sev = normalize_severity(raw.get("severity"))
        prov = self.create_provenance(src, inc_id, created_at)

        alert_ids = [normalize_identifier("alert", aid) for aid in raw.get("alert_ids", [])]
        threat_ids = [normalize_identifier("threat", tid) for tid in raw.get("threat_ids", [])]
        asset_ids = [normalize_identifier("asset", aid) for aid in raw.get("asset_ids", [])]

        return Incident(
            incident_id=inc_id,
            soc_id=str(raw.get("soc_id", "SOC-001")),
            alert_ids=alert_ids,
            threat_ids=threat_ids,
            asset_ids=asset_ids,
            severity=sev,
            status=str(raw.get("status", "OPEN")),
            created_at=created_at,
            closed_at=closed_at,
            assigned_analyst_id=normalize_identifier("analyst", raw.get("assigned_analyst_id", "ANA-UNASSIGNED")),
            provenance=prov,
        )

    def normalize_action(self, raw: Dict[str, Any], source: Optional[str] = None) -> Optional[AnalystAction]:
        src = source or self.default_source
        if self.deduplicator.is_duplicate(raw, "analyst_action", src):
            return None

        act_id = normalize_identifier("analyst_action", raw.get("action_id"))
        ts = normalize_timestamp(raw.get("timestamp"))
        prov = self.create_provenance(src, act_id, ts)

        inc_id = normalize_identifier("incident", raw["incident_id"]) if raw.get("incident_id") else None

        return AnalystAction(
            action_id=act_id,
            analyst_id=normalize_identifier("analyst", raw.get("analyst_id", "ANA-UNKNOWN")),
            soc_id=str(raw.get("soc_id", "SOC-001")),
            incident_id=inc_id,
            action_type=str(raw.get("action_type", "UNKNOWN")),
            timestamp=ts,
            duration_seconds=int(raw.get("duration_seconds", 0)),
            metadata=raw.get("metadata", {}),
            provenance=prov,
        )
