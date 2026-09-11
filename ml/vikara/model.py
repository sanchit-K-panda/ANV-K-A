"""VIKĀRA v1 Core Isolation Forest Model wrapper.

Implements unsupervised behavioural anomaly detection trained on healthy baseline windows.
Maps decision function values to calibrated [0, 1] anomaly scores and returns structured
feature-level evidence per prompt §16-19 and §41.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from ml.vikara.explain import FeatureExplainer


@dataclass
class AnomalyResult:
    """Deployment inference contract per prompt §41."""
    model_version: str
    prediction: str  # "ANOMALOUS" or "NORMAL"
    anomaly_score: float
    raw_score: float
    threshold: float
    top_deviating_features: List[Dict[str, Any]]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class VikaraIsolationForest:
    """Wrapper managing the Isolation Forest lifecycle, scoring calibration, and explainability.

    Threshold policy (REMEDIATION.md P0-1): the deployment threshold is calibrated on the
    fitted benign baseline — the `threshold_quantile` (default 0.99) percentile of healthy
    anomaly scores — so healthy FPR is bounded by construction instead of relying on a
    hand-picked constant.
    """

    def __init__(
        self,
        n_estimators: int = 200,
        contamination: float = 0.01,
        max_samples: float = 1.0,
        max_features: float = 1.0,
        random_state: int = 42,
        decision_threshold: float = 0.99,
        version: str = "vikara-v1",
        feature_names: Optional[List[str]] = None,
        calibrate_threshold: bool = True,
        threshold_quantile: float = 0.99,
        rule_feature_names: Optional[List[str]] = None,
    ) -> None:
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.max_samples = max_samples
        self.max_features = max_features
        self.random_state = random_state
        self.decision_threshold = decision_threshold
        self.version = version
        self.feature_names = feature_names or []
        self.calibrate_threshold = calibrate_threshold
        self.threshold_quantile = threshold_quantile
        # Rule overlay (REMEDIATION.md P0-1): deterministic violation-count features
        # (e.g. closures_without_investigation) are ZERO on every benign window by
        # construction, so "rule fires → anomalous" preserves the healthy-FPR bound
        # while giving a density model a precision-1.0 signal it cannot express
        # (a 1-in-1000 binary feature is invisible to isolation splitting).
        self.rule_feature_names = list(rule_feature_names or [])
        self._rule_indices: Optional[List[int]] = None

        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            max_samples=self.max_samples,
            max_features=self.max_features,
            random_state=self.random_state,
            n_jobs=-1,
        )

        self.baseline_stats: Dict[str, Dict[str, float]] = {}
        self.explainer: Optional[FeatureExplainer] = None
        self.is_fitted: bool = False
        self.threshold_calibration: Optional[Dict[str, float]] = None
        self._calib_scores: Optional[np.ndarray] = None

    def fit(self, X: np.ndarray, feature_names: List[str]) -> "VikaraIsolationForest":
        """Fits the Isolation Forest strictly on benign baseline feature vectors.

        Calibration (REMEDIATION.md P0-1): stores the benign training scores so that
        deployment scores are expressed as a benign-percentile — the fraction of healthy
        windows a new window outranks. The alerting threshold is the
        `threshold_quantile` percentile of this benign distribution, bounding healthy
        FPR by construction and being invariant to the raw score distribution's shape.
        """
        self.feature_names = list(feature_names)
        self._rule_indices = [
            self.feature_names.index(f) for f in self.rule_feature_names if f in self.feature_names
        ]
        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            max_samples=self.max_samples,
            max_features=self.max_features,
            random_state=self.random_state,
            n_jobs=-1,
        )
        self.model.fit(X)
        self.is_fitted = True

        # Baseline integrity check: the FPR guarantee requires ZERO rule-firing windows
        # in the benign fit. A violation here means the training baseline is contaminated
        # (or the rule feature is miscomputed) — say so loudly.
        if self._rule_indices:
            fired = int(((X[:, self._rule_indices]) > 0).any(axis=1).sum())
            if fired:
                print(
                    f"[VIKĀRA] WARNING: {fired} benign-fit windows trip the rule overlay "
                    f"{self.rule_feature_names} — healthy FPR bound is compromised. "
                    f"Exclude labeled-anomalous windows before fitting (--oracle)."
                )

        # Benign reference distribution for percentile calibration
        raw_fit = self.model.decision_function(X)
        self._calib_scores = np.sort(raw_fit)
        self._calib_min = float(raw_fit.min())
        self._calib_max = float(raw_fit.max())

        if self.calibrate_threshold:
            q_val = float(np.quantile(raw_fit, 1.0 - self.threshold_quantile))
            self.decision_threshold = float(min(max(q_val, self._calib_min - 1e-6), self._calib_max + 1e-6))
            self.threshold_calibration = {
                "method": "benign_percentile",
                "quantile": self.threshold_quantile,
                "calibrated_threshold_raw": round(self.decision_threshold, 6),
                "baseline_windows": int(len(X)),
                "expected_healthy_fpr": round(1.0 - self.threshold_quantile, 4),
            }
            print(
                f"[VIKĀRA] Calibrated threshold on raw decision_function at benign "
                f"q{self.threshold_quantile:.2f} → raw≤{self.decision_threshold:.4f} flags; "
                f"expected healthy FPR ≤ {1.0 - self.threshold_quantile:.2%}"
            )

        # Compute baseline distributional statistics for explainability
        self.baseline_stats = {}
        for idx, feat in enumerate(self.feature_names):
            col_vals = X[:, idx]
            q25 = float(np.percentile(col_vals, 25))
            q75 = float(np.percentile(col_vals, 75))
            self.baseline_stats[feat] = {
                "mean": round(float(np.mean(col_vals)), 4),
                "std": round(float(np.std(col_vals)), 4),
                "median": round(float(np.median(col_vals)), 4),
                "iqr": round(float(max(0.001, q75 - q25)), 4),
                "min": round(float(np.min(col_vals)), 4),
                "max": round(float(np.max(col_vals)), 4),
            }

        self.explainer = FeatureExplainer(self.baseline_stats)
        return self

    def _score_arrays(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Returns (raw_scores, composite_scores, predictions).

        Composite score (REMEDIATION.md P0-1):
        - rule overlay fires (any violation-count feature > 0) → score 1.0, prediction
          ANOMALOUS. These features are zero on all benign windows, so this branch
          contributes zero healthy FPs while capturing deterministic workflow
          violations the density model cannot rank highly enough.
        - otherwise → benign-percentile score; flagged when raw decision function is
          beyond the calibrated benign quantile.
        """
        raw_scores = self.model.decision_function(X)
        if self._calib_scores is not None and len(self._calib_scores):
            # Fraction of benign windows this window OUTRANKS (higher raw = more normal).
            # Anomaly percentile = 1 − that fraction: 1.0 = more anomalous than every
            # benign window, 0.0 = more normal than all of them.
            pos = np.searchsorted(self._calib_scores, raw_scores, side="left")
            anomaly_scores = 1.0 - pos / float(len(self._calib_scores))
        else:
            anomaly_scores = np.clip(0.5 - raw_scores, 0.0, 1.0)

        rule_fire = np.zeros(len(X), dtype=bool)
        if self._rule_indices:
            rule_fire = (X[:, self._rule_indices] > 0).any(axis=1)
            anomaly_scores = np.where(rule_fire, 1.0, anomaly_scores)

        predictions = (raw_scores <= self.decision_threshold) | rule_fire
        return raw_scores, anomaly_scores, predictions

    def score_samples(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Returns (raw_scores, calibrated_anomaly_scores, predictions).

        - raw_scores: raw decision_function values (positive = inlier, negative = outlier).
        - calibrated_anomaly_scores: continuous [0.0, 1.0] anomaly scores.
        - predictions: boolean array where True = ANOMALOUS (score >= decision_threshold).
        """
        if not self.is_fitted:
            raise RuntimeError("VikaraIsolationForest must be fitted before scoring.")

        return self._score_arrays(X)

    def predict_one(self, feature_row: Dict[str, float]) -> AnomalyResult:
        """Inference for a single window feature row."""
        if not self.is_fitted:
            raise RuntimeError("Model is not loaded or fitted.")

        x_vec = np.array(
            [[feature_row.get(f, self.baseline_stats.get(f, {}).get("median", 0.0)) for f in self.feature_names]],
            dtype=np.float32,
        )
        x_vec = np.nan_to_num(x_vec, nan=0.0, posinf=100.0, neginf=0.0)

        raw_scores, anomaly_scores, predictions = self.score_samples(x_vec)
        raw_score = float(raw_scores[0])
        score = float(anomaly_scores[0])
        is_anom = bool(predictions[0])
        threshold_out = round(1.0 - self.threshold_quantile, 4) if self.calibrate_threshold \
            else round(self.decision_threshold, 4)

        top_devs = self.explainer.explain_vector(feature_row, top_k=5) if self.explainer else []

        return AnomalyResult(
            model_version=self.version,
            prediction="ANOMALOUS" if is_anom else "NORMAL",
            anomaly_score=round(score, 4),
            raw_score=round(raw_score, 4),
            threshold=threshold_out,
            top_deviating_features=top_devs,
        )

    def save(self, model_path: str | Path) -> None:
        """Serializes the fitted model wrapper to disk."""
        path = Path(model_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, str(path))

    @staticmethod
    def load(model_path: str | Path) -> "VikaraIsolationForest":
        """Loads serialized model from disk."""
        return joblib.load(str(model_path))
