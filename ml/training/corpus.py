"""Offline training-corpus generation for ANVĪKṢA ML models.

Generates deterministic SOC telemetry corpora in memory via the bundled
soc-simulator (Rules.md §5: fully air-gapped — no external data sources,
no downloads, seed-reproducible). Each generated dataset is converted to a
`LoadedDataset` that is byte-equivalent to the JSON files the simulator
exports on disk, so engines cannot tell training data from eval data.
"""
from __future__ import annotations

import logging
import pickle
import sys
import time
from pathlib import Path
from typing import Iterator, List, Optional, Sequence, Tuple

from ml.preprocessing.dataset_loader import LoadedDataset

log = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[2]
SIMULATOR_SRC = REPO_ROOT / "soc-simulator" / "src"
DEFAULT_CACHE_DIR = REPO_ROOT / "ml" / "training_data"

ALL_SCENARIOS: Tuple[str, ...] = (
    "healthy",
    "investigation_gap",
    "negative_space",
    "kpi_manipulation",
    "analyst_overload",
    "recurring_threat",
    "identity_anomaly",
)

# Denser-than-default telemetry for ML corpora (Memory.md Phase 2 tuning note:
# the default funnel is thin at ~20 incidents per 10k events; raising
# alert_rate/incident_rate yields more analysts with enough history to learn from).
DENSE_OVERRIDES = {"alert_rate": 0.30, "incident_rate": 0.50}


def _ensure_simulator_importable() -> None:
    if str(SIMULATOR_SRC) not in sys.path:
        sys.path.insert(0, str(SIMULATOR_SRC))


def generate_dataset(
    scenario: str,
    seed: int,
    events: int = 10_000,
    soc_count: int = 2,
    dense: bool = True,
) -> LoadedDataset:
    """Builds one simulator dataset in memory and returns it as a LoadedDataset."""
    _ensure_simulator_importable()
    from simulator.config import SimConfig  # noqa: PLC0415 — offline path bootstrap
    from simulator.scenarios.registry import build_scenario  # noqa: PLC0415
    from simulator.schemas.enums import ScenarioName  # noqa: PLC0415

    cfg = SimConfig()
    cfg.scenario = ScenarioName(scenario)
    cfg.seed = seed
    cfg.events = events
    cfg.soc_count = soc_count
    if dense:
        cfg.alert_rate = DENSE_OVERRIDES["alert_rate"]
        cfg.incident_rate = DENSE_OVERRIDES["incident_rate"]

    sim_ds = build_scenario(scenario, cfg)

    ds = LoadedDataset(
        scenario=scenario,
        socs=[m.model_dump(mode="json") for m in sim_ds.socs],
        analysts=[m.model_dump(mode="json") for m in sim_ds.analysts],
        devices=[m.model_dump(mode="json") for m in sim_ds.devices],
        assets=[m.model_dump(mode="json") for m in sim_ds.assets],
        threats=[m.model_dump(mode="json") for m in sim_ds.threats],
        events=[m.model_dump(mode="json") for m in sim_ds.events],
        alerts=[m.model_dump(mode="json") for m in sim_ds.alerts],
        incidents=[m.model_dump(mode="json") for m in sim_ds.incidents],
        investigations=[m.model_dump(mode="json") for m in sim_ds.investigations],
        escalations=[m.model_dump(mode="json") for m in sim_ds.escalations],
        analyst_actions=[m.model_dump(mode="json") for m in sim_ds.actions],
        ground_truth=[m.model_dump(mode="json") for m in sim_ds.ground_truth],
        metadata=sim_ds.metadata.model_dump(mode="json"),
    )
    ds.build_indexes()
    return ds


def _cache_key(scenario: str, seed: int, events: int, soc_count: int, dense: bool) -> str:
    return f"{scenario}_seed{seed}_ev{events}_soc{soc_count}_dense{int(dense)}"


def _cache_path(cache_dir: Path, key: str) -> Path:
    return cache_dir / f"{key}.pkl"


def iter_corpus(
    scenarios: Sequence[str],
    seeds: Sequence[int],
    events: int = 10_000,
    soc_count: int = 2,
    dense: bool = True,
    cache: bool = False,
    cache_dir: Optional[Path] = None,
) -> Iterator[Tuple[str, int, LoadedDataset]]:
    """Yields (scenario, seed, dataset) for every scenario/seed pair, generating lazily.

    With cache=True, generated datasets are pickled under cache_dir so repeat
    training runs skip generation entirely.
    """
    total = len(scenarios) * len(seeds)
    done = 0
    for scenario in scenarios:
        for seed in seeds:
            done += 1
            key = _cache_key(scenario, seed, events, soc_count, dense)
            cdir = cache_dir if cache_dir is not None else DEFAULT_CACHE_DIR
            cpath = _cache_path(Path(cdir), key)
            if cache and cpath.exists():
                with open(cpath, "rb") as fh:
                    ds = pickle.load(fh)  # noqa: S301 — local, self-produced cache
                log.info("[%d/%d] %s seed=%d (cache)", done, total, scenario, seed)
            else:
                t0 = time.perf_counter()
                ds = generate_dataset(scenario, seed, events=events, soc_count=soc_count, dense=dense)
                log.info(
                    "[%d/%d] %s seed=%d — %d incidents, %d actions, %.1fs",
                    done, total, scenario, seed, len(ds.incidents), len(ds.analyst_actions),
                    time.perf_counter() - t0,
                )
                if cache:
                    cpath.parent.mkdir(parents=True, exist_ok=True)
                    with open(cpath, "wb") as fh:
                        pickle.dump(ds, fh, protocol=pickle.HIGHEST_PROTOCOL)
            yield scenario, seed, ds


def generate_corpus(
    scenarios: Sequence[str],
    seeds: Sequence[int],
    events: int = 10_000,
    soc_count: int = 2,
    dense: bool = True,
    cache: bool = False,
    cache_dir: Optional[Path] = None,
) -> List[Tuple[str, int, LoadedDataset]]:
    """Materializes the full corpus as a list of (scenario, seed, dataset)."""
    return list(iter_corpus(scenarios, seeds, events, soc_count, dense, cache, cache_dir))
