"""Normalization helpers — timestamp, severity, entity mapping, correlation IDs."""
from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def dumps_json(v: Any) -> str:
    """Safe JSON dumps for Text columns."""
    if v is None:
        return "{}"
    if isinstance(v, str):
        # already serialized?
        try:
            json.loads(v)
            return v
        except Exception:
            return json.dumps(v)
    try:
        return json.dumps(v, default=str)
    except Exception as e:
        logger.warning("JSON dumps failed: %s value=%r", e, v)
        return "{}"


def normalize_severity(severity: str) -> str:
    return severity.strip().upper() if isinstance(severity, str) else severity


def ensure_list(v: Any) -> list:
    if v is None:
        return []
    if isinstance(v, list):
        return v
    return [v]
