"""Unsupervised Multidimensional Behaviour Anomaly Detection with Isolation Forest.

Identifies complex multivariate deviations in analyst operational behavior
(e.g., unusual combinations of rapid closure, low action count, and missing evidence).
"""
from __future__ import annotations

from typing import Dict, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import IsolationForest

from ml.preprocessing.dataset_loader import LoadedDataset
from ml.preprocessing.feature_extraction import AnalystFeatures, FeatureExtractor, IncidentTraceFeatures
from ml.schemas import FindingSeverity, FindingType, RawFinding


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
        self, dataset: LoadedDataset, analyst_map: Optional[Dict[str, AnalystFeatures]] = None
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

        # Fit and predict: -1 is outlier, 1 is inlier
        self.model.fit(X)
        preds = self.model.predict(X)
        scores = self.model.decision_function(X)  # lower score = more abnormal

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

            if pred == -1 and score <= -0.10 and has_behavioral_divergence:
                # Severity and confidence based on anomaly score
                anomaly_depth = float(np.clip(-score, 0.1, 1.0))
                conf = round(min(0.95, 0.70 + anomaly_depth * 0.3), 3)

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
                        evidence={
                            "analyst_id": a.analyst_id,
                            "analyst_name": a.name,
                            "isolation_forest_score": float(score),
                            "anomaly_depth": anomaly_depth,
                            "observed_mean_closure_min": a.mean_closure_minutes,
                            "cohort_median_closure_min": round(median_closure, 2),
                            "observed_investigation_rate": a.investigation_rate,
                            "cohort_median_investigation_rate": round(median_inv_rate, 2),
                            "total_incidents_handled": a.total_incidents,
                        },
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
