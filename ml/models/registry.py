"""Model registry — persistence and loading of trained ANVĪKṢA behaviour models.

Artifacts live under `ml/models/artifacts/` and are committed to the repo so
that every deployment (including fully air-gapped ones) ships with trained
models and never trains at inference time. Loading is graceful: a missing or
incompatible artifact set returns `None` and the pipeline falls back to its
legacy per-cohort statistical fit.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from ml.training.sample_builder import BEHAVIOUR_CLF_FEATURES, BEHAVIOUR_IF_FEATURES

log = logging.getLogger(__name__)

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
IF_FILENAME = "behaviour_isolation_forest.joblib"
CLF_FILENAME = "behaviour_classifier.joblib"
REGISTRY_FILENAME = "registry.json"
REPORT_FILENAME = "training_report.json"


@dataclass
class TrainedBehaviourModels:
    """Container for the trained behaviour-detection model set."""

    isolation_forest: Any  # fitted sklearn IsolationForest (benign-only training)
    classifier: Any  # fitted supervised behaviour classifier
    decision_threshold: float = 0.5
    if_features: List[str] = field(default_factory=lambda: list(BEHAVIOUR_IF_FEATURES))
    clf_features: List[str] = field(default_factory=lambda: list(BEHAVIOUR_CLF_FEATURES))
    metadata: Dict[str, Any] = field(default_factory=dict)


class ModelRegistry:
    """Saves/loads the trained model set with metadata-driven compatibility checks."""

    def __init__(self, artifact_dir: Path | str | None = None):
        self.artifact_dir = Path(artifact_dir) if artifact_dir else ARTIFACT_DIR

    # ------------------------------------------------------------------ save
    def save(self, models: TrainedBehaviourModels, metadata: Optional[Dict[str, Any]] = None) -> Path:
        import joblib  # noqa: PLC0415 — heavy import deferred until actually needed

        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(models.isolation_forest, self.artifact_dir / IF_FILENAME)
        joblib.dump(models.classifier, self.artifact_dir / CLF_FILENAME)

        registry = {
            "schema_version": 1,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "decision_threshold": models.decision_threshold,
            "if_features": list(models.if_features),
            "clf_features": list(models.clf_features),
            "metadata": metadata or models.metadata,
        }
        with open(self.artifact_dir / REGISTRY_FILENAME, "w", encoding="utf-8") as fh:
            json.dump(registry, fh, indent=2)
        log.info("Saved trained behaviour models to %s", self.artifact_dir)
        return self.artifact_dir

    # ------------------------------------------------------------------ load
    def load(self) -> Optional[TrainedBehaviourModels]:
        """Loads the trained model set, or None when absent/incompatible.

        Never raises on corrupt artifacts — an air-gapped deployment must
        degrade to the legacy statistical fallback, not crash.
        """
        import joblib  # noqa: PLC0415

        reg_path = self.artifact_dir / REGISTRY_FILENAME
        if_path = self.artifact_dir / IF_FILENAME
        clf_path = self.artifact_dir / CLF_FILENAME
        if not (reg_path.exists() and if_path.exists() and clf_path.exists()):
            return None

        try:
            with open(reg_path, "r", encoding="utf-8") as fh:
                registry = json.load(fh)
            if int(registry.get("schema_version", 0)) != 1:
                log.warning("Model registry schema mismatch — ignoring trained artifacts")
                return None
            if_features = list(registry.get("if_features", []))
            clf_features = list(registry.get("clf_features", []))
            if if_features != list(BEHAVIOUR_IF_FEATURES) or clf_features != list(BEHAVIOUR_CLF_FEATURES):
                log.warning("Trained artifact feature vectors drifted from code — ignoring")
                return None
            iso = joblib.load(if_path)
            clf = joblib.load(clf_path)
            return TrainedBehaviourModels(
                isolation_forest=iso,
                classifier=clf,
                decision_threshold=float(registry.get("decision_threshold", 0.5)),
                if_features=if_features,
                clf_features=clf_features,
                metadata=registry.get("metadata", {}),
            )
        except Exception as exc:  # noqa: BLE001 — any corruption must fall back cleanly
            log.warning("Failed to load trained behaviour models (%s) — using fallback", exc)
            return None

    # ------------------------------------------------------------------ misc
    def save_report(self, report: Dict[str, Any]) -> Path:
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        path = self.artifact_dir / REPORT_FILENAME
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(report, fh, indent=2)
        return path

    def load_report(self) -> Optional[Dict[str, Any]]:
        path = self.artifact_dir / REPORT_FILENAME
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
