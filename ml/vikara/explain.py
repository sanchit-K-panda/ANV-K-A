"""Feature-level explainability for VIKĀRA Behavioural Anomaly Detection.

Builds structured explanations comparing observed window metrics to healthy baseline
distributions per prompt §19. Never asserts unsupported causal claims.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional
import numpy as np


@dataclass
class FeatureDeviation:
    feature: str
    value: float
    baseline: float
    deviation: str  # "highly_unusual", "unusual", "moderate_deviation"
    direction: str  # "unusually_high", "unusually_low"
    z_score: float


class FeatureExplainer:
    """Computes feature-level deviance relative to baseline training distributions."""

    def __init__(self, baseline_stats: Dict[str, Dict[str, float]]) -> None:
        self.baseline_stats = baseline_stats

    def explain_vector(
        self,
        features: Dict[str, float],
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Identifies and ranks the top features contributing to an anomaly score."""
        deviations: List[FeatureDeviation] = []

        for feat_name, val in features.items():
            stats = self.baseline_stats.get(feat_name)
            if not stats:
                continue

            median = stats.get("median", 0.0)
            iqr = stats.get("iqr", 1.0)
            std = stats.get("std", 1.0)
            scale = max(iqr, std, 0.01)

            diff = val - median
            z_score = round(float(diff / scale), 2)
            abs_z = abs(z_score)

            if abs_z < 1.2:
                continue

            direction = "unusually_high" if diff > 0 else "unusually_low"
            if abs_z >= 3.0:
                dev_label = "highly_unusual"
            elif abs_z >= 2.0:
                dev_label = "unusual"
            else:
                dev_label = "moderate_deviation"

            deviations.append(
                FeatureDeviation(
                    feature=feat_name,
                    value=round(float(val), 3),
                    baseline=round(float(median), 3),
                    deviation=dev_label,
                    direction=direction,
                    z_score=z_score,
                )
            )

        # Sort by magnitude of z-score descending
        deviations.sort(key=lambda d: abs(d.z_score), reverse=True)
        return [asdict(d) for d in deviations[:top_k]]
