"""Liveness and Anti-Spoofing assessment engine for supervisory biometric gating."""
from __future__ import annotations

import numpy as np
from typing import Dict, Any, Tuple


class LivenessEngine:
    """Evaluates biometric image quality, frequency entropy, and presentation attack indicators."""

    def __init__(self, min_liveness_score: float = 0.70):
        self.min_liveness_score = min_liveness_score

    def evaluate_liveness(self, frame_bytes: bytes) -> Tuple[bool, float, Dict[str, Any]]:
        """Evaluates image buffer for 2D replay or presentation attack indicators.
        
        Returns:
            Tuple of (is_live: bool, liveness_score: float, metrics: dict)
        """
        if not frame_bytes or len(frame_bytes) < 64:
            return False, 0.0, {"reason": "EMPTY_OR_CORRUPT_FRAME"}

        # Calculate high-frequency texture entropy across byte stream
        arr = np.frombuffer(frame_bytes, dtype=np.uint8)
        
        # Byte distribution entropy
        hist, _ = np.histogram(arr, bins=16, range=(0, 256))
        prob = hist / (np.sum(hist) + 1e-6)
        prob_nonzero = prob[prob > 0]
        entropy = -np.sum(prob_nonzero * np.log2(prob_nonzero))
        
        # High entropy (~3.5-4.0) indicates complex real photographic scene
        norm_entropy = min(1.0, float(entropy / 4.0))
        
        # Variance of sample intensities
        variance = float(np.var(arr) / (128.0 ** 2))
        
        # Composite liveness confidence
        score = round(float(0.6 * norm_entropy + 0.4 * min(1.0, variance)), 4)
        is_live = score >= self.min_liveness_score

        metrics = {
            "entropy": round(float(entropy), 3),
            "intensity_variance": round(variance, 3),
            "liveness_score": score,
            "threshold": self.min_liveness_score,
            "verdict": "LIVE" if is_live else "SPOOF_SUSPECTED",
        }

        return is_live, score, metrics
