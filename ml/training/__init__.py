"""ML training subsystem for ANVĪKṢA.

Offline, deterministic, air-gapped model training:
- `corpus`        — in-memory SOC telemetry corpora via the bundled soc-simulator
- `sample_builder`— labeled analyst-level samples from simulator datasets
- `train`         — CLI: train → evaluate → persist artifacts + report

Trained artifacts are consumed through `ml.models.registry.ModelRegistry`.
"""
