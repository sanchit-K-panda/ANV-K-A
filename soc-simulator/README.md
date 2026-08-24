# ANVĪKṢA SOC Simulator

Deterministic synthetic Security Operations Centre telemetry with ground-truth
labels — the data foundation for ANVĪKṢA (SIH26157, SAT-SA).

The simulator generates a realistic SOC (analysts, devices, assets, threats) and
a coherent operational timeline (events → alerts → incidents → investigations →
escalations → analyst actions), then injects scenario-specific abnormalities and
records **ground truth**: what should have happened vs. what actually happened.

> The simulator does NOT do detection. It produces data + truth; ANVĪKṢA must
> discover the injected failures independently.

## Setup

```bash
cd soc-simulator
pip install -e .[dev]        # or just set PYTHONPATH=src
pytest                       # run test suite
```

Requires Python 3.11+ and Pydantic 2.x. Fully local, no network access.

## Usage

```bash
# generate one scenario (default seed 42 → reproducible)
python -m simulator generate --scenario healthy --events 10000

# the first milestone command
python -m simulator generate --scenario investigation_gap --events 10000 --seed 42

# all seven scenarios
python -m simulator generate --scenario all --events 10000 --seed 42

# validate + summarize a dataset
python -m simulator validate datasets/investigation_gap
python -m simulator summary datasets/investigation_gap

# other formats / scale knobs
python -m simulator generate --scenario kpi_manipulation --events 50000 \
    --format all --config config.toml --out datasets
```

## Scenarios

| Scenario | Injected failure | Expected findings in ground truth |
|---|---|---|
| healthy | none (baseline) | — |
| investigation_gap | critical incidents closed without investigation | EXECUTION_GAP, NEGATIVE_SPACE, CLOSURE_WITHOUT_INVESTIGATION |
| negative_space | expected workflow steps silently missing | NEGATIVE_SPACE |
| kpi_manipulation | suspiciously fast closures + dropped evidence | POTENTIAL_KPI_MANIPULATION |
| analyst_overload | one analyst holds ~65% of critical cases | WORKLOAD_IMBALANCE, ANALYST_BOTTLENECK |
| recurring_threat | same threat recurs, never remediated | RECURRING_THREAT |
| identity_anomaly | mid-session identity mismatch → session lock | IDENTITY_ANOMALY |

## Output layout

```
datasets/<scenario>/
├── socs.json analysts.json devices.json assets.json threats.json
├── events.json alerts.json incidents.json
├── investigations.json escalations.json analyst_actions.json
├── ground_truth.json      # machine-readable expected-vs-actual records
├── metadata.json          # counts, seed, dataset id
└── csv/ sqlite/           # with --format csv|all / sqlite|all
```

Same seed + same config = byte-identical entity IDs and structure.

## Configuration

All tunables (scale, distributions, per-scenario injection rates) live in
`src/simulator/config.py` defaults and can be overridden via a TOML file:
`--config my.toml`. See `DEFAULTS_TOML` for the schema.

## Data contract

Pydantic models in `src/simulator/schemas/entities.py` are the frozen contract.
Validation checks five layers: schema, referential integrity, temporal
integrity, scenario integrity, ground-truth integrity.

## Design rule

```
Simulator → "I intentionally injected an investigation gap." → Dataset + truth
ANVĪKṢA   → "Did ANVĪKṢA discover it?" → precision/recall/F1
```
