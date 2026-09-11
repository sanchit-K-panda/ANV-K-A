"""Identifier normalization and deterministic record hashing for ANVĪKṢA."""
from __future__ import annotations

import hashlib
import json
import re
from typing import Any, Dict, Optional

ENTITY_PREFIXES = {
    "event": "EVT-",
    "alert": "ALT-",
    "incident": "INC-",
    "investigation": "INV-",
    "escalation": "ESC-",
    "analyst": "ANA-",
    "analyst_action": "ACT-",
    "asset": "AST-",
    "device": "DEV-",
    "threat": "THR-",
    "indicator": "IOC-",
    "attack": "ATT-",
    "organization": "ORG-",
    "ground_truth": "TRU-",
}


def normalize_identifier(entity_type: str, raw_id: Any) -> str:
    """Standardizes entity identifiers with uniform uppercase prefix formatting."""
    if raw_id is None:
        raise ValueError(f"Identifier for {entity_type} cannot be None.")

    raw_str = str(raw_id).strip().upper()
    prefix = ENTITY_PREFIXES.get(entity_type.lower())
    if not prefix:
        return raw_str

    if raw_str.startswith(prefix):
        return raw_str

    # Strip existing non-standard separators
    clean_id = re.sub(r"^[^A-Z0-9]+", "", raw_str)
    return f"{prefix}{clean_id}"


def compute_deterministic_hash(record: Dict[str, Any], include_source: bool = True) -> str:
    """Computes a SHA-256 fingerprint of a record dictionary for source-aware deduplication.

    Keys are sorted and values converted to stable string representations.
    """
    cleaned: Dict[str, Any] = {}
    for k, v in record.items():
        if not include_source and k in ("source", "retrieved_at", "provenance"):
            continue
        if v is None or v == "":
            continue
        cleaned[str(k)] = str(v)

    serialized = json.dumps(cleaned, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
