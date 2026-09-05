"""Labeled sample construction for behaviour-model training.

Converts simulator datasets into analyst-level feature rows. Labels come
exclusively from simulator ground truth (entity_type `analyst` /
`analyst_group`) — the ML never sees the injection code, only the same
telemetry the detection engines see.

Label contract:
- Positive (1): the analyst is directly implicated by ground truth.
- Negative (0): all other active analysts, including every analyst in the
  `healthy` scenario datasets (benign by construction).
- Incident-level ground truth (e.g. investigation_gap) does NOT propagate to
  the assigned analyst: a process-level gap closed by a well-behaving analyst
  would poison behaviour labels.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Set, Tuple

import numpy as np

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import AnalystFeatures, FeatureExtractor

# Feature vector for the (semi-supervised) Isolation Forest — trained on
# benign `healthy` corpora only, applied unchanged at inference.
BEHAVIOUR_IF_FEATURES: Tuple[str, ...] = (
    "mean_closure_minutes",
    "investigation_rate",
    "escalation_rate_critical",
    "mean_actions_per_incident",
)

# Richer feature vector for the supervised behaviour classifier.
BEHAVIOUR_CLF_FEATURES: Tuple[str, ...] = (
    "mean_closure_minutes",
    "median_closure_minutes",
    "investigation_rate",
    "escalation_rate_critical",
    "mean_actions_per_incident",
    "critical_case_share",
    "closure_completeness",
    "total_incidents",
    "critical_incidents",
    "total_actions",
)


@dataclass
class AnalystSample:
    scenario: str
    seed: int
    analyst_id: str
    soc_id: str
    features: Dict[str, float]
    label: int  # 1 = implicated by ground truth, 0 = benign


def ground_truth_analyst_ids(dataset: LoadedDataset) -> Set[str]:
    """Analyst ids directly implicated by a dataset's ground truth entries."""
    implicated: Set[str] = set()
    for gt in dataset.ground_truth:
        if gt.get("entity_type") in ("analyst", "analyst_group"):
            for part in str(gt.get("entity_id", "")).split(","):
                part = part.strip()
                if part:
                    implicated.add(part)
    return implicated


def analyst_feature_row(af: AnalystFeatures) -> Dict[str, float]:
    """Canonical feature dict for one analyst (superset of both model vectors)."""
    row = {
        "mean_closure_minutes": float(af.mean_closure_minutes),
        "median_closure_minutes": float(af.median_closure_minutes),
        "investigation_rate": float(af.investigation_rate),
        "escalation_rate_critical": float(af.escalation_rate_critical),
        "mean_actions_per_incident": float(af.mean_actions_per_incident),
        "critical_case_share": float(af.critical_case_share),
        "closure_completeness": (
            af.closed_incidents / af.total_incidents if af.total_incidents > 0 else 0.0
        ),
        "total_incidents": float(af.total_incidents),
        "critical_incidents": float(af.critical_incidents),
        "total_actions": float(af.total_actions),
    }
    return {k: (0.0 if not np.isfinite(v) else float(v)) for k, v in row.items()}


def build_samples(datasets: Iterable[LoadedDataset]) -> List[AnalystSample]:
    """Builds labeled analyst samples from an iterable of datasets."""
    samples: List[AnalystSample] = []
    for ds in datasets:
        seed = int(ds.metadata.get("seed", 0)) if ds.metadata else 0
        traces = FeatureExtractor.extract_incident_traces(ds)
        analyst_map = FeatureExtractor.extract_analyst_features(ds, traces)
        positives = ground_truth_analyst_ids(ds)

        for af in analyst_map.values():
            if af.role == "SUPERVISOR" or af.total_incidents == 0:
                continue
            samples.append(
                AnalystSample(
                    scenario=ds.scenario,
                    seed=seed,
                    analyst_id=af.analyst_id,
                    soc_id=af.soc_id,
                    features=analyst_feature_row(af),
                    label=1 if af.analyst_id in positives else 0,
                )
            )
    return samples


def feature_matrix(
    samples: Sequence[AnalystSample], feature_names: Sequence[str]
) -> np.ndarray:
    """Stacks sample dicts into an (n, len(feature_names)) float32 matrix."""
    return np.array(
        [[s.features[name] for name in feature_names] for s in samples],
        dtype=np.float32,
    )
