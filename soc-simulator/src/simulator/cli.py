"""CLI: python -m simulator generate|validate|summary."""
from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from simulator.config import SimConfig
from simulator.exporters.io import export_csv, export_json, export_sqlite
from simulator.scenarios.registry import REGISTRY, build_scenario
from simulator.schemas.enums import ScenarioName
from simulator.validation.integrity import validate_dataset


def _add_common(p: argparse.ArgumentParser) -> None:
    p.add_argument("--scenario", choices=[s.value for s in ScenarioName] + ["all"],
                   default="healthy")
    p.add_argument("--events", type=int, default=None)
    p.add_argument("--socs", type=int, default=None)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--config", type=Path, default=None)
    p.add_argument("--out", type=Path, default=Path("datasets"))
    p.add_argument("--format", choices=["json", "csv", "sqlite", "all"],
                   default="json")
    p.add_argument("-v", "--verbose", action="store_true")


def cmd_generate(args: argparse.Namespace) -> int:
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(levelname)s %(name)s: %(message)s")
    scenarios = [s.value for s in ScenarioName] if args.scenario == "all" else [args.scenario]
    for scen in scenarios:
        cfg = SimConfig.load(args.config)
        cfg.seed = args.seed
        cfg.scenario = ScenarioName(scen)
        if args.events:
            cfg.events = args.events
        if args.socs:
            cfg.soc_count = args.socs
        print(f"[+] Generating scenario '{scen}' (events={cfg.events}, seed={cfg.seed})...")
        ds = build_scenario(scen, cfg)
        out_dir = args.out / scen
        export_json(ds, out_dir)
        if args.format in ("csv", "all"):
            export_csv(ds, out_dir / "csv")
        if args.format in ("sqlite", "all"):
            export_sqlite(ds, out_dir / "sqlite")
        m = ds.metadata
        print(f"  events={m.event_count} alerts={m.alert_count} incidents="
              f"{m.incident_count} investigations={m.investigation_count} "
              f"escalations={m.escalation_count} actions={m.action_count} "
              f"ground_truth={m.ground_truth_count}")
    return 0


def cmd_validate(args: argparse.Namespace) -> int:
    rep = validate_dataset(Path(args.dataset))
    print(rep.render())
    return 0 if rep.valid else 1


def cmd_summary(args: argparse.Namespace) -> int:
    meta = json.loads((Path(args.dataset) / "metadata.json").read_text(encoding="utf-8"))
    gt = json.loads((Path(args.dataset) / "ground_truth.json").read_text(encoding="utf-8"))
    print(f"Dataset   : {meta['dataset_id']}")
    print(f"Scenario  : {meta['scenario']}  (seed {meta['seed']})")
    for k in ("soc_count", "analyst_count", "asset_count", "event_count",
              "alert_count", "incident_count", "investigation_count",
              "escalation_count", "action_count"):
        print(f"{k.replace('_count', '').ljust(14)}: {meta[k]}")
    print(f"{'ground truth':<14}: {len(gt)} entries")
    findings: dict[str, int] = {}
    for g in gt:
        for f in g["expected_findings"]:
            findings[f] = findings.get(f, 0) + 1
    for f, n in sorted(findings.items(), key=lambda kv: -kv[1]):
        print(f"  - {f}: {n}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="simulator",
                                     description="ANVĪKṢA SOC Simulator")
    sub = parser.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("generate", help="generate datasets")
    _add_common(g)
    g.set_defaults(fn=cmd_generate)

    v = sub.add_parser("validate", help="validate a generated dataset directory")
    v.add_argument("dataset", type=Path)
    v.set_defaults(fn=cmd_validate)

    s = sub.add_parser("summary", help="print dataset summary")
    s.add_argument("dataset", type=Path)
    s.set_defaults(fn=cmd_summary)

    args = parser.parse_args(argv)
    try:
        return args.fn(args)
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr)
        return 130
