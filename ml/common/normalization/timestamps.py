"""Timestamp normalization for ANVĪKṢA Data Layer.

Ensures all temporal records are parsed, validated, and converted into timezone-aware UTC.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
import re


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_timestamp(val: Any) -> datetime:
    """Normalizes any temporal representation (ISO string, epoch int/float, datetime) to UTC datetime.

    Raises:
        ValueError: if timestamp is invalid or unparseable.
    """
    if val is None:
        raise ValueError("Timestamp value cannot be None.")

    if isinstance(val, datetime):
        if val.tzinfo is None:
            return val.replace(tzinfo=timezone.utc)
        return val.astimezone(timezone.utc)

    if isinstance(val, (int, float)):
        # Check if in milliseconds or microseconds
        # Epoch seconds for current era are ~1.7e9, milliseconds ~1.7e12, microseconds ~1.7e15
        if val > 1e14:  # microseconds
            val = val / 1e6
        elif val > 1e11:  # milliseconds
            val = val / 1e3
        return datetime.fromtimestamp(val, tz=timezone.utc)

    if isinstance(val, str):
        val_str = val.strip()
        if not val_str:
            raise ValueError("Timestamp string cannot be empty.")

        # Replace 'Z' with UTC offset
        if val_str.endswith("Z") or val_str.endswith("z"):
            val_str = val_str[:-1] + "+00:00"

        try:
            dt = datetime.fromisoformat(val_str)
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            pass

        # Try common log formats
        common_formats = (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y/%m/%d %H:%M:%S",
            "%d/%b/%Y:%H:%M:%S %z",
            "%b %d %H:%M:%S",
        )
        for fmt in common_formats:
            try:
                dt = datetime.strptime(val_str, fmt)
                if dt.tzinfo is None:
                    return dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except Exception:
                continue

    raise ValueError(f"Unrecognized or unparseable timestamp format: {val!r}")


def format_iso_utc(dt: datetime) -> str:
    """Formats datetime as standard ISO 8601 UTC string."""
    return normalize_timestamp(dt).isoformat()
