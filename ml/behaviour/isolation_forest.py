"""Unsupervised Multidimensional Behaviour Anomaly Detection with Isolation Forest.

Identifies complex multivariate deviations in analyst operational behavior
(e.g., unusual combinations of rapid closure, low action count, and missing evidence).

Two detection modes:
- **Trained mode** (default when artifacts exist): the Isolation Forest was fit
  offline on benign `healthy` corpora only (semi-supervised anomaly detection)
  and is applied unchanged — evaluation data never contaminates the model. A
  supervised classifier may additionally rescue divergent analysts the forest
  scores as inliers and calibrate confidence.
- **Fallback mode** (no artifacts, e.g. fresh checkout): the forest is fit on
  the current cohort, exactly as in the legacy behavior.
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Dict, List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import AnalystFeatures, FeatureExtractor, IncidentTraceFeatures
from ml.schemas import FindingSeverity, FindingType, RawFinding
from ml.training.sample_builder import analyst_feature_row

if TYPE_CHECKING:  # runtime import would cycle through ml.models.__init__
    from ml.models.registry import TrainedBehaviourModels


class BehavioralIsolationForest:
    """Multidimensional outlier detector using Isolation Forest on normalized operational vectors."""

    def __init__(self, contamination: float = 0.15, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100,
        )

    def analyze_analysts(
        self,
        dataset: LoadedDataset,
        analyst_map: Optional[Dict[str, AnalystFeatures]] = None,
        trained: Optional[TrainedBehaviourModels] = None,
    ) -> List[RawFinding]:
        if analyst_map is None:
            analyst_map = FeatureExtractor.extract_analyst_features(dataset)

        active_analysts = [
            a for a in analyst_map.values() if a.total_incidents > 0 and a.role != "SUPERVISOR"
        ]

        if len(active_analysts) < 4:
            return []

        # Feature matrix:
        # [mean_closure_minutes, investigation_rate, escalation_rate_critical, mean_actions_per_incident]
        feature_matrix = []
        for a in active_analysts:
            row = [
                a.mean_closure_minutes,
                a.investigation_rate,
                a.escalation_rate_critical,
                a.mean_actions_per_incident,
            ]
            feature_matrix.append(row)

        X = np.array(feature_matrix, dtype=np.float32)

        # Replace NaNs/Infs
        X = np.nan_to_num(X, nan=0.0, posinf=100.0, neginf=0.0)

        # Detection mode 1: offline-trained semi-supervised model (benign-only fit).
        if trained is not None and trained.isolation_forest is not None:
            preds = trained.isolation_forest.predict(X)
            scores = trained.isolation_forest.decision_function(X)
            detection_mode = "trained_benign_isolation_forest"
        else:
            # Detection mode 2 (legacy fallback): fit on the current cohort.
            self.model.fit(X)
            preds = self.model.predict(X)
            scores = self.model.decision_function(X)  # lower score = more abnormal
            detection_mode = "per_cohort_fit"

        # Optional supervised classifier (trained mode only): independent
        # probability that this analyst's behaviour is anomalous. Built with
        # the exact same feature extractor used at training time.
        p_anom: Optional[np.ndarray] = None
        threshold = 0.5
        if trained is not None and trained.classifier is not None:
            clf_X = np.array(
                [
                    [analyst_feature_row(a)[name] for name in trained.clf_features]
                    for a in active_analysts
                ],
                dtype=np.float32,
            )
            clf_X = np.nan_to_num(clf_X, nan=0.0, posinf=100.0, neginf=0.0)
            p_anom = trained.classifier.predict_proba(clf_X)[:, 1]
            threshold = trained.decision_threshold

        findings: List[RawFinding] = []

        # Calculate cohort medians for explainability
        median_closure = float(np.median(X[:, 0]))
        median_inv_rate = float(np.median(X[:, 1]))

        for idx, (a, pred, score) in enumerate(zip(active_analysts, preds, scores)):
            # Only flag if score indicates genuine outlier and has concrete behavioral deviation
            has_behavioral_divergence = (
                a.mean_closure_minutes <= 20.0
                or a.mean_closure_minutes >= 200.0
                or a.investigation_rate <= 0.40
            )

            if_anomaly = bool(pred == -1 and score <= -0.10)
            clf_probability = float(p_anom[idx]) if p_anom is not None else None
            clf_anomaly = clf_probability is not None and clf_probability >= threshold
            # The classifier can rescue a divergent analyst the benign-trained
            # forest scored as inlier; the forest confirms a classifier hit.
            flagged = (if_anomaly or clf_anomaly) and has_behavioral_divergence

            if flagged:
                anomaly_depth = float(np.clip(-score, 0.1, 1.0))
                conf = round(min(0.95, 0.70 + anomaly_depth * 0.3), 3)
                if clf_probability is not None and clf_anomaly:
                    conf = round(max(conf, 0.60 + 0.35 * clf_probability), 3)

                evidence = {
                    "analyst_id": a.analyst_id,
                    "analyst_name": a.name,
                    "detection_mode": detection_mode,
                    "isolation_forest_score": float(score),
                    "anomaly_depth": anomaly_depth,
                    "observed_mean_closure_min": a.mean_closure_minutes,
                    "cohort_median_closure_min": round(median_closure, 2),
                    "observed_investigation_rate": a.investigation_rate,
                    "cohort_median_investigation_rate": round(median_inv_rate, 2),
                    "total_incidents_handled": a.total_incidents,
                }
                if clf_probability is not None:
                    evidence["classifier_anomaly_probability"] = round(clf_probability, 4)

                findings.append(
                    RawFinding(
                        engine_name="BehavioralIsolationForest",
                        finding_type=FindingType.BEHAVIOURAL_ANOMALY,
                        severity=FindingSeverity.HIGH if anomaly_depth > 0.3 else FindingSeverity.MEDIUM,
                        confidence=conf,
                        title=f"Multivariate Behavioural Anomaly: Analyst {a.name} ({a.analyst_id})",
                        description=(
                            f"Isolation Forest identified significant behavioral divergence for Analyst {a.name} "
                            f"(anomaly score: {anomaly_depth:.3f}). Operational patterns deviate across closure velocity, "
                            f"investigation completeness, and action frequency relative to peer baseline."
                        ),
                        entity_type="analyst",
                        entity_id=a.analyst_id,
                        evidence=evidence,
                        baseline_metrics={
                            "cohort_median_closure_min": round(median_closure, 2),
                            "cohort_median_investigation_rate": round(median_inv_rate, 2),
                        },
                        observed_metrics={
                            "mean_closure_min": a.mean_closure_minutes,
                            "investigation_rate": a.investigation_rate,
                            "anomaly_depth": anomaly_depth,
                        },
                        recommended_action=(
                            f"Audit closed cases handled by {a.name} to inspect quality of triage, "
                            f"investigative documentation, and remediation adherence."
                        ),
                    )
                )

        return findings
