"""Evaluation metrics calculations for ANVĪKṢA Ground Truth benchmarking."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Set


@dataclass
class ScenarioEvaluationResult:
    scenario: str
    ground_truth_count: int = 0
    detections_count: int = 0
    true_positives: int = 0
    false_positives: int = 0
    false_negatives: int = 0
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0
    matched_entities: List[str] = field(default_factory=list)
    missed_entities: List[str] = field(default_factory=list)
    spurious_entities: List[str] = field(default_factory=list)

    def calculate_scores(self) -> None:
        if self.ground_truth_count == 0:
            # Healthy scenario with 0 ground truth injections
            self.precision = 1.0 if self.detections_count == 0 else 0.0
            self.recall = 1.0
            self.f1_score = 1.0 if self.detections_count == 0 else 0.0
            return

        tp = self.true_positives
        fp = self.false_positives
        fn = self.false_negatives

        self.precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        self.recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        
        if (self.precision + self.recall) > 0:
            self.f1_score = round(2 * (self.precision * self.recall) / (self.precision + self.recall), 4)
        else:
            self.f1_score = 0.0
