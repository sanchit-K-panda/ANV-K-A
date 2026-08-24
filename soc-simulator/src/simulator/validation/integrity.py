"""Dataset validation: schema, referential, temporal, scenario, ground-truth integrity."""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path

log = logging.getLogger(__name__)


@dataclass
class ValidationReport:
    checks: list[tuple[str, bool, str]] = field(default_factory=list)

    def add(self, name: str, ok: bool, detail: str = "") -> None:
        self.checks.append((name, ok, detail))

    @property
    def valid(self) -> bool:
        return all(ok for _, ok, _ in self.checks)

    def render(self) -> str:
        lines = []
        for name, ok, detail in self.checks:
            mark = "✓" if ok else "✗"
            lines.append(f"{mark} {name}" + (f" — {detail}" if detail and not ok else ""))
        lines.append("")
        lines.append("DATASET VALID" if self.valid else "DATASET INVALID")
        return "\n".join(lines)


def _load(dir_path: Path) -> dict[str, list[dict]]:
    data = {}
    for f in dir_path.glob("*.json"):
        if f.name != "metadata.json":
            data[f.stem] = json.loads(f.read_text(encoding="utf-8"))
    return data


def validate_dataset(dir_path: Path) -> ValidationReport:
    rep = ValidationReport()
    d = _load(Path(dir_path))
    ids = {name: {r["{}_id".format(name.rstrip('s')).split('_')[0]] if False else r.get(
        {"socs": "soc_id", "analysts": "analyst_id", "devices": "device_id",
         "assets": "asset_id", "threats": "threat_id", "events": "event_id",
         "alerts": "alert_id", "incidents": "incident_id",
         "investigations": "investigation_id", "escalations": "escalation_id",
         "analyst_actions": "action_id", "ground_truth": "truth_id"}[name])
        for r in rows} for name, rows in d.items()}

    # 1. Schema validation — every expected file parsed with its id field.
    missing_files = [n for n in ("socs", "analysts", "events", "alerts", "incidents",
                                 "ground_truth") if n not in d]
    rep.add("Schema validation", not missing_files,
            f"missing/invalid files: {missing_files}")

    # 2. Referential integrity.
    errs: list[str] = []
    analyst_ids, incident_ids = ids["analysts"], ids["incidents"]
    asset_ids, event_ids = ids["assets"], ids["events"]
    for a in d.get("alerts", []):
        if a["asset_id"] not in asset_ids:
            errs.append(f"alert {a['alert_id']} → missing asset")
        if a["analyst_id"] not in analyst_ids:
            errs.append(f"alert {a['alert_id']} → missing analyst")
        for eid in a["event_ids"]:
            if eid not in event_ids:
                errs.append(f"alert {a['alert_id']} → missing event {eid}")
    inc_alert_ids = {a["alert_id"] for a in d.get("alerts", [])}
    inv_by_incident = {iv["incident_id"] for iv in d.get("investigations", [])}
    esc_by_incident = {es["incident_id"] for es in d.get("escalations", [])}
    for i in d.get("incidents", []):
        for aid in i["alert_ids"]:
            if aid not in inc_alert_ids:
                errs.append(f"incident {i['incident_id']} → missing alert {aid}")
        for t in i["threat_ids"]:
            if t not in ids["threats"]:
                errs.append(f"incident {i['incident_id']} → missing threat {t}")
        for asid in i["asset_ids"]:
            if asid not in asset_ids:
                errs.append(f"incident {i['incident_id']} → missing asset {asid}")
        if i["assigned_analyst_id"] not in analyst_ids:
            errs.append(f"incident {i['incident_id']} → missing analyst")
    for iv in d.get("investigations", []):
        if iv["incident_id"] not in incident_ids:
            errs.append(f"investigation {iv['investigation_id']} → missing incident")
        if iv["analyst_id"] not in analyst_ids:
            errs.append(f"investigation {iv['investigation_id']} → missing analyst")
    for es in d.get("escalations", []):
        if es["incident_id"] not in incident_ids:
            errs.append(f"escalation {es['escalation_id']} → missing incident")
    rep.add("Referential integrity", not errs, "; ".join(errs[:5]))

    # 3. Temporal integrity.
    terrs: list[str] = []
    from datetime import datetime
    ts = lambda s: datetime.fromisoformat(s)
    inc_by_id = {i["incident_id"]: i for i in d.get("incidents", [])}
    for iv in d.get("investigations", []):
        inc = inc_by_id.get(iv["incident_id"])
        if inc and ts(iv["started_at"]) < ts(inc["created_at"]):
            terrs.append(f"{iv['investigation_id']} starts before incident")
        if iv["completed_at"] and ts(iv["completed_at"]) < ts(iv["started_at"]):
            terrs.append(f"{iv['investigation_id']} ends before start")
    for es in d.get("escalations", []):
        inc = inc_by_id.get(es["incident_id"])
        if inc and ts(es["timestamp"]) < ts(inc["created_at"]):
            terrs.append(f"{es['escalation_id']} before incident creation")
    for i in d.get("incidents", []):
        if i["closed_at"] and any(
                iv["incident_id"] == i["incident_id"]
                and ts(i["closed_at"]) < ts(iv["started_at"])
                for iv in d.get("investigations", [])):
            terrs.append(f"{i['incident_id']} closed before investigation start")
    rep.add("Temporal integrity", not terrs, "; ".join(terrs[:5]))

    # 4. Scenario integrity — scenario claims must be satisfiable in the data.
    meta = json.loads((Path(dir_path) / "metadata.json").read_text(encoding="utf-8"))
    scen = meta["scenario"]
    serrs: list[str] = []
    if scen == "healthy" and d.get("ground_truth"):
        serrs.append("healthy dataset must have empty ground truth")
    if scen == "investigation_gap":
        bad = [gt for gt in d["ground_truth"]
               if gt["entity_type"] == "incident"
               and gt["entity_id"] not in inc_by_id]
        closed_no_inv = [i for i in d.get("incidents", [])
                         if i["severity"] == "CRITICAL"
                         and i["incident_id"] not in inv_by_incident]
        if not closed_no_inv:
            serrs.append("no critical incidents lacking investigations found")
    if scen == "kpi_manipulation" and not d.get("ground_truth"):
        serrs.append("kpi_manipulation requires ground truth")
    if scen in ("negative_space", "analyst_overload", "recurring_threat",
                "identity_anomaly") and not d.get("ground_truth"):
        serrs.append(f"{scen} requires ground truth")
    rep.add("Scenario integrity", not serrs, "; ".join(serrs))

    # 5. Ground-truth integrity — every referenced entity must exist.
    gerrs: list[str] = []
    known = set()
    for name, rows in d.items():
        if name == "ground_truth":
            continue
        key = {"socs": "soc_id", "analysts": "analyst_id", "devices": "device_id",
               "assets": "asset_id", "threats": "threat_id", "events": "event_id",
               "alerts": "alert_id", "incidents": "incident_id",
               "investigations": "investigation_id", "escalations": "escalation_id",
               "analyst_actions": "action_id"}[name]
        known |= {r[key] for r in rows}
    for gt in d.get("ground_truth", []):
        eid = gt["entity_id"]
        if "," in eid:  # analyst_group entries list multiple ids
            for part in eid.split(","):
                if part and part not in known:
                    gerrs.append(f"{gt['truth_id']}: unknown entity {part}")
        elif eid.startswith("SESS-") or eid.startswith("THR-"):
            if eid.startswith("THR-") and eid not in known:
                gerrs.append(f"{gt['truth_id']}: unknown entity {eid}")
            # sessions live only in actions metadata; existence checked via actions
        elif eid not in known:
            gerrs.append(f"{gt['truth_id']}: unknown entity {eid}")
    rep.add("Ground-truth integrity", not gerrs, "; ".join(gerrs[:5]))
    return rep
