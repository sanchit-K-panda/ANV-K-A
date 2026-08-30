"""Statistical baseline computation for SOC and Analyst behavioral telemetry."""
from __future__ import annotations

import math
import statistics
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass
class MetricBaseline:
    name: str
    mean: float = 0.0
    std_dev: float = 0.0
    median: float = 0.0
    q25: float = 0.0
    q75: float = 0.0
    iqr: float = 0.0
    sample_count: int = 0

    def z_score(self, val: float) -> float:
        if self.std_dev <= 1e-6:
            return 0.0
        return (val - self.mean) / self.std_dev

    def is_outlier_z(self, val: float, threshold: float = 2.5) -> bool:
        return abs(self.z_score(val)) >= threshold

    def is_outlier_iqr(self, val: float, k: float = 1.5) -> bool:
        if self.iqr <= 1e-6:
            return False
        return val < (self.q25 - k * self.iqr) or val > (self.q75 + k * self.iqr)


class BaselineEngine:
    """Calculates robust statistical baselines across operational metrics."""

    @staticmethod
    def compute_baseline(values: List[float], name: str = "metric") -> MetricBaseline:
        if not values:
            return MetricBaseline(name=name)

        clean = [float(v) for v in values if not math.isnan(v) and not math.isinf(v)]
        if not clean:
            return MetricBaseline(name=name)

        n = len(clean)
        mean_val = statistics.mean(clean)
        std_val = statistics.stdev(clean) if n > 1 else 0.0
        med_val = statistics.median(clean)
        
        sorted_v = sorted(clean)
        q25 = sorted_v[int(0.25 * n)]
        q75 = sorted_v[int(0.75 * n)]
        iqr = q75 - q25

        return MetricBaseline(
            name=name,
            mean=round(mean_val, 3),
            std_dev=round(std_val, 3),
            median=round(med_val, 3),
            q25=round(q25, 3),
            q75=round(q75, 3),
            iqr=round(iqr, 3),
            sample_count=n,
        )
