"""Inference Interface and Deployment Contract for VIKĀRA (prompt §41).

Consumers (APIs, supervisor UI, pipelines) invoke `predict()` without directly
handling scikit-learn models or joblib serialization details.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import pandas as pd

from ml.vikara.model import AnomalyResult, VikaraIsolationForest

_DEFAULT_MODEL_PATH = Path("models/vikara/v1/model.joblib")
_LOADED_MODEL: Optional[VikaraIsolationForest] = None


def get_vikara_model(model_path: Optional[str | Path] = None) -> VikaraIsolationForest:
    """Singleton/cached loader for the production VIKĀRA model."""
    global _LOADED_MODEL
    target_path = Path(model_path) if model_path else _DEFAULT_MODEL_PATH

    if _LOADED_MODEL is None or model_path is not None:
        if not target_path.exists():
            raise FileNotFoundError(
                f"VIKĀRA model artifact not found at {target_path}. "
                "Train the model first with 'python -m ml.vikara.train'."
            )
        _LOADED_MODEL = VikaraIsolationForest.load(target_path)

    return _LOADED_MODEL


def predict(
    features: Union[Dict[str, float], pd.DataFrame, pd.Series],
    model_path: Optional[str | Path] = None,
) -> Union[AnomalyResult, List[AnomalyResult]]:
    """Primary deployment inference contract.

    Args:
        features: Dictionary of feature name -> float, pandas Series, or DataFrame of features.
        model_path: Optional explicit model artifact location.

    Returns:
        AnomalyResult or list of AnomalyResult objects with calibrated anomaly score,
        decision prediction, threshold, and top deviating feature explanations.
    """
    model = get_vikara_model(model_path)

    if isinstance(features, pd.DataFrame):
        results: List[AnomalyResult] = []
        for _, row in features.iterrows():
            row_dict = {k: float(v) for k, v in row.items() if isinstance(v, (int, float))}
            results.append(model.predict_one(row_dict))
        return results

    if isinstance(features, pd.Series):
        features_dict = {k: float(v) for k, v in features.to_dict().items() if isinstance(v, (int, float))}
        return model.predict_one(features_dict)

    if isinstance(features, dict):
        return model.predict_one(features)

    raise TypeError(f"Unsupported features type: {type(features)}. Expected dict, Series, or DataFrame.")
