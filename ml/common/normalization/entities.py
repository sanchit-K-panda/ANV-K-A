"""Entity relationship normalization and referential consistency."""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Set
from ml.common.normalization.identifiers import normalize_identifier


def clean_entity_id_list(raw_ids: Any, entity_type: str) -> List[str]:
    """Normalizes a list or comma-separated string of entity IDs into deduplicated clean list."""
    if not raw_ids:
        return []

    if isinstance(raw_ids, str):
        parts = [p.strip() for p in raw_ids.split(",") if p.strip()]
    elif isinstance(raw_ids, (list, tuple, set)):
        parts = [str(p).strip() for p in raw_ids if p is not None and str(p).strip()]
    else:
        parts = [str(raw_ids).strip()]

    # Deduplicate while preserving order
    seen: Set[str] = set()
    cleaned: List[str] = []
    for p in parts:
        norm = normalize_identifier(entity_type, p)
        if norm not in seen:
            seen.add(norm)
            cleaned.append(norm)
    return cleaned
