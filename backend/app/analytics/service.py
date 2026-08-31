"""Supervisory Analytics Service bridging ML pipelines with FastAPI and Database."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from ml.models.explainability_engine import SupervisoryAnalyticsPipeline
from ml.preprocessing.dataset_loader import LoadedDataset, load_dataset_from_dir
from ml.schemas import FindingOutput


class AnalyticsService:
    """Service layer exposing the Supervisory Analytics Pipeline to backend routes."""

    def __init__(self):
        self.pipeline = SupervisoryAnalyticsPipeline()

    def evaluate_dataset_dir(self, dataset_dir: str | Path) -> list[FindingOutput]:
        """Evaluates an offline simulator dataset directory and returns structured findings."""
        ds = load_dataset_from_dir(dataset_dir)
        return self.pipeline.run(ds)

    def evaluate_in_memory_dataset(self, data: dict[str, Any]) -> list[FindingOutput]:
        """Evaluates raw in-memory SOC telemetry dictionaries."""
        ds = LoadedDataset(
            scenario=data.get("scenario", "telemetry"),
            socs=data.get("socs", []),
            analysts=data.get("analysts", []),
            devices=data.get("devices", []),
            assets=data.get("assets", []),
            threats=data.get("threats", []),
            events=data.get("events", []),
            alerts=data.get("alerts", []),
            incidents=data.get("incidents", []),
            investigations=data.get("investigations", []),
            escalations=data.get("escalations", []),
            analyst_actions=data.get("analyst_actions", []),
            ground_truth=data.get("ground_truth", []),
            metadata=data.get("metadata", {}),
        )
        ds.build_indexes()
        return self.pipeline.run(ds)
