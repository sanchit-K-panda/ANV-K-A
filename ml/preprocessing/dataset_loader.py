"""High-performance dataset loader and in-memory SOC Knowledge Model.

Loads synthetic SOC telemetry produced by the simulator or ingested into the DB,
indexing all entities and temporal traces for ultra-fast engine evaluation.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set


def _parse_dt(val: Any) -> Optional[datetime]:
    if not val:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, str):
        val = val.replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(val)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            return None
    return None


@dataclass
class LoadedDataset:
    scenario: str
    socs: List[Dict[str, Any]] = field(default_factory=list)
    analysts: List[Dict[str, Any]] = field(default_factory=list)
    devices: List[Dict[str, Any]] = field(default_factory=list)
    assets: List[Dict[str, Any]] = field(default_factory=list)
    threats: List[Dict[str, Any]] = field(default_factory=list)
    events: List[Dict[str, Any]] = field(default_factory=list)
    alerts: List[Dict[str, Any]] = field(default_factory=list)
    incidents: List[Dict[str, Any]] = field(default_factory=list)
    investigations: List[Dict[str, Any]] = field(default_factory=list)
    escalations: List[Dict[str, Any]] = field(default_factory=list)
    analyst_actions: List[Dict[str, Any]] = field(default_factory=list)
    ground_truth: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    # Indexed Lookups
    incidents_by_id: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    analysts_by_id: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    threats_by_id: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    investigations_by_incident: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    escalations_by_incident: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    actions_by_incident: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    actions_by_analyst: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    alerts_by_incident: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    incidents_by_analyst: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    incidents_by_threat: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)

    def build_indexes(self) -> None:
        """Builds multi-index lookups across all relational dimensions."""
        self.incidents_by_id = {i["incident_id"]: i for i in self.incidents if "incident_id" in i}
        self.analysts_by_id = {a["analyst_id"]: a for a in self.analysts if "analyst_id" in a}
        self.threats_by_id = {t["threat_id"]: t for t in self.threats if "threat_id" in t}

        self.investigations_by_incident.clear()
        for inv in self.investigations:
            inc_id = inv.get("incident_id")
            if inc_id:
                self.investigations_by_incident.setdefault(inc_id, []).append(inv)

        self.escalations_by_incident.clear()
        for esc in self.escalations:
            inc_id = esc.get("incident_id")
            if inc_id:
                self.escalations_by_incident.setdefault(inc_id, []).append(esc)

        self.actions_by_incident.clear()
        self.actions_by_analyst.clear()
        for act in self.analyst_actions:
            inc_id = act.get("incident_id")
            if inc_id:
                self.actions_by_incident.setdefault(inc_id, []).append(act)
            aid = act.get("analyst_id")
            if aid:
                self.actions_by_analyst.setdefault(aid, []).append(act)

        self.incidents_by_analyst.clear()
        self.incidents_by_threat.clear()
        for inc in self.incidents:
            aid = inc.get("assigned_analyst_id")
            if aid:
                self.incidents_by_analyst.setdefault(aid, []).append(inc)
            for tid in inc.get("threat_ids", []):
                self.incidents_by_threat.setdefault(tid, []).append(inc)


def load_dataset_from_dir(dataset_dir: str | Path) -> LoadedDataset:
    """Loads all JSON files from a dataset directory into a LoadedDataset."""
    path = Path(dataset_dir)
    if not path.exists():
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    scenario_name = path.name

    def _read_json(filename: str, default: Any = None) -> Any:
        fpath = path / filename
        if fpath.exists():
            with open(fpath, "r", encoding="utf-8") as f:
                return json.load(f)
        return default if default is not None else []

    ds = LoadedDataset(
        scenario=scenario_name,
        socs=_read_json("socs.json"),
        analysts=_read_json("analysts.json"),
        devices=_read_json("devices.json"),
        assets=_read_json("assets.json"),
        threats=_read_json("threats.json"),
        events=_read_json("events.json"),
        alerts=_read_json("alerts.json"),
        incidents=_read_json("incidents.json"),
        investigations=_read_json("investigations.json"),
        escalations=_read_json("escalations.json"),
        analyst_actions=_read_json("analyst_actions.json"),
        ground_truth=_read_json("ground_truth.json"),
        metadata=_read_json("metadata.json", default={}),
    )
    ds.build_indexes()
    return ds
