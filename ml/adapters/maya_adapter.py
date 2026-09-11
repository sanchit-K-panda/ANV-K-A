"""Adapter for MĀYĀ SOC Simulator data ingestion.

Ingests MĀYĀ scenario artifacts into normalized internal schemas while strictly
isolating ground truth as an evaluation oracle per prompt §4 and §11.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from ml.common.normalization.identifiers import normalize_identifier
from ml.common.normalization.pipeline import NormalizationPipeline
from ml.common.normalization.severity import normalize_severity
from ml.common.normalization.timestamps import normalize_timestamp
from ml.common.schemas.internal import (
    Alert,
    AnalystAction,
    Asset,
    Escalation,
    Event,
    GroundTruthReference,
    Incident,
    Investigation,
    Threat,
)


@dataclass
class MayaObservations:
    """Observed telemetry accessible to feature engineering and VIKĀRA model."""
    events: List[Event] = field(default_factory=list)
    alerts: List[Alert] = field(default_factory=list)
    incidents: List[Incident] = field(default_factory=list)
    investigations: List[Investigation] = field(default_factory=list)
    actions: List[AnalystAction] = field(default_factory=list)
    escalations: List[Escalation] = field(default_factory=list)
    assets: List[Asset] = field(default_factory=list)
    threats: List[Threat] = field(default_factory=list)


@dataclass
class MayaDatasetBundle:
    """Full dataset bundle keeping observed data strictly separated from ground truth."""
    scenario: str
    observations: MayaObservations
    ground_truth: List[GroundTruthReference]
    metadata: Dict[str, Any] = field(default_factory=dict)


class MayaAdapter:
    """Translates MĀYĀ simulator output into normalized internal structures."""

    def __init__(self, pipeline: Optional[NormalizationPipeline] = None) -> None:
        self._shared_pipeline = pipeline

    def _get_pipeline(self) -> NormalizationPipeline:
        return self._shared_pipeline or NormalizationPipeline(default_source="maya_soc_simulator")

    def _read_json_list(self, path: Path) -> List[Dict[str, Any]]:
        if not path.exists():
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict):
                    return [data]
                return []
        except Exception:
            return []

    def _read_json_dict(self, path: Path) -> Dict[str, Any]:
        if not path.exists():
            return {}
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, dict) else {}
        except Exception:
            return {}

    def load_from_directory(self, scenario_dir: str | Path) -> MayaDatasetBundle:
        dir_path = Path(scenario_dir)
        if not dir_path.exists():
            raise FileNotFoundError(f"Scenario directory does not exist: {scenario_dir}")

        scenario_name = dir_path.name
        metadata = self._read_json_dict(dir_path / "metadata.json")
        if not metadata:
            metadata = {"scenario": scenario_name}

        pipeline = self._get_pipeline()
        obs = MayaObservations()

        # 1. Events
        for raw in self._read_json_list(dir_path / "events.json"):
            evt = pipeline.normalize_event(raw)
            if evt:
                obs.events.append(evt)

        # 2. Alerts
        for raw in self._read_json_list(dir_path / "alerts.json"):
            alt = pipeline.normalize_alert(raw)
            if alt:
                obs.alerts.append(alt)

        # 3. Incidents
        for raw in self._read_json_list(dir_path / "incidents.json"):
            inc = pipeline.normalize_incident(raw)
            if inc:
                obs.incidents.append(inc)

        # 4. Actions
        for raw in self._read_json_list(dir_path / "analyst_actions.json"):
            act = pipeline.normalize_action(raw)
            if act:
                obs.actions.append(act)

        # 5. Investigations
        for raw in self._read_json_list(dir_path / "investigations.json"):
            inv_id = normalize_identifier("investigation", raw.get("investigation_id"))
            inc_id = normalize_identifier("incident", raw.get("incident_id"))
            ana_id = normalize_identifier("analyst", raw.get("analyst_id"))
            started_at = normalize_timestamp(raw.get("started_at"))
            completed_at = normalize_timestamp(raw["completed_at"]) if raw.get("completed_at") else None
            prov = pipeline.create_provenance("maya_soc_simulator", inv_id, started_at)

            obs.investigations.append(
                Investigation(
                    investigation_id=inv_id,
                    incident_id=inc_id,
                    analyst_id=ana_id,
                    started_at=started_at,
                    completed_at=completed_at,
                    status=str(raw.get("status", "COMPLETED")),
                    evidence_count=int(raw.get("evidence_count", 0)),
                    notes=str(raw.get("notes", "")),
                    provenance=prov,
                )
            )

        # 6. Escalations
        for raw in self._read_json_list(dir_path / "escalations.json"):
            esc_id = normalize_identifier("escalation", raw.get("escalation_id"))
            inc_id = normalize_identifier("incident", raw.get("incident_id"))
            ana_id = normalize_identifier("analyst", raw.get("analyst_id"))
            ts = normalize_timestamp(raw.get("timestamp"))
            prov = pipeline.create_provenance("maya_soc_simulator", esc_id, ts)

            obs.escalations.append(
                Escalation(
                    escalation_id=esc_id,
                    incident_id=inc_id,
                    analyst_id=ana_id,
                    escalated_to=str(raw.get("escalated_to", "SUPERVISOR")),
                    reason=str(raw.get("reason", "")),
                    timestamp=ts,
                    status=str(raw.get("status", "ACCEPTED")),
                    provenance=prov,
                )
            )

        # 7. Assets
        for raw in self._read_json_list(dir_path / "assets.json"):
            ast_id = normalize_identifier("asset", raw.get("asset_id"))
            prov = pipeline.create_provenance("maya_soc_simulator", ast_id)
            obs.assets.append(
                Asset(
                    asset_id=ast_id,
                    soc_id=str(raw.get("soc_id", "SOC-001")),
                    hostname=str(raw.get("hostname", "")),
                    asset_type=str(raw.get("asset_type", "WORKSTATION")),
                    ip_address=str(raw.get("ip_address", "127.0.0.1")),
                    criticality=normalize_severity(raw.get("criticality", "MEDIUM")),
                    business_unit=str(raw.get("business_unit", "SECURITY")),
                    owner=str(raw.get("owner", "IT_OPS")),
                    status=str(raw.get("status", "ACTIVE")),
                    provenance=prov,
                )
            )

        # 8. Threats
        for raw in self._read_json_list(dir_path / "threats.json"):
            thr_id = normalize_identifier("threat", raw.get("threat_id"))
            fs = normalize_timestamp(raw.get("first_seen"))
            ls = normalize_timestamp(raw.get("last_seen"))
            prov = pipeline.create_provenance("maya_soc_simulator", thr_id, fs)
            obs.threats.append(
                Threat(
                    threat_id=thr_id,
                    name=str(raw.get("name", "")),
                    category=str(raw.get("category", "")),
                    severity=normalize_severity(raw.get("severity", "MEDIUM")),
                    mitre_techniques=list(raw.get("mitre_techniques", [])),
                    first_seen=fs,
                    last_seen=ls,
                    status=str(raw.get("status", "ACTIVE")),
                    provenance=prov,
                )
            )

        # Ground truth oracle (STRICTLY ISOLATED)
        gt_references: List[GroundTruthReference] = []
        for raw in self._read_json_list(dir_path / "ground_truth.json"):
            truth_id = normalize_identifier("ground_truth", raw.get("truth_id"))
            start_t = normalize_timestamp(raw["start_time"]) if raw.get("start_time") else None
            end_t = normalize_timestamp(raw["end_time"]) if raw.get("end_time") else None
            prov = pipeline.create_provenance("maya_soc_simulator", truth_id, start_t)

            gt_references.append(
                GroundTruthReference(
                    truth_id=truth_id,
                    scenario_id=str(raw.get("scenario_id", scenario_name)),
                    entity_type=str(raw.get("entity_type", "")),
                    entity_id=str(raw.get("entity_id", "")),
                    expected_behaviour=raw.get("expected_behaviour", {}),
                    actual_behaviour=raw.get("actual_behaviour", {}),
                    expected_findings=list(raw.get("expected_findings", [])),
                    severity=normalize_severity(raw.get("severity", "HIGH")),
                    injected=bool(raw.get("injected", True)),
                    start_time=start_t,
                    end_time=end_t,
                    provenance=prov,
                )
            )

        return MayaDatasetBundle(
            scenario=scenario_name,
            observations=obs,
            ground_truth=gt_references,
            metadata=metadata,
        )
