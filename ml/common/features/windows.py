"""Temporal Windowing and Leakage Prevention for ANVĪKṢA Feature Engine.

Per prompt §14:
- Configurable windows: 15m, 1h, 6h, 24h (default: 1h).
- Strict historical bounds: feature at time T uses ONLY data at or before T.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import re
from typing import Any, Iterable, List, Optional, Sequence, Tuple


@dataclass(frozen=True)
class OperationalWindow:
    window_id: str
    start_time: datetime
    end_time: datetime
    analyst_id: Optional[str] = None
    soc_id: Optional[str] = None


def parse_window_duration(duration_str: str) -> timedelta:
    """Parses window duration strings like '15m', '1h', '6h', '24h', '1d'."""
    s = duration_str.strip().lower()
    m = re.match(r"^(\d+)\s*([mhdw])$", s)
    if not m:
        raise ValueError(f"Invalid window duration string: {duration_str!r}. Expected e.g. '15m', '1h', '6h', '24h'.")

    val = int(m.group(1))
    unit = m.group(2)

    if unit == "m":
        return timedelta(minutes=val)
    elif unit == "h":
        return timedelta(hours=val)
    elif unit == "d":
        return timedelta(days=val)
    elif unit == "w":
        return timedelta(weeks=val)
    raise ValueError(f"Unsupported time unit: {unit}")


def generate_time_windows(
    start_time: datetime,
    end_time: datetime,
    window_size: str | timedelta = "1h",
    step_size: Optional[str | timedelta] = None,
) -> List[Tuple[datetime, datetime]]:
    """Generates sequential historical time windows between start_time and end_time.

    Guarantees that each window [t_start, t_end] only includes historical events up to t_end.
    """
    w_delta = parse_window_duration(window_size) if isinstance(window_size, str) else window_size
    s_delta = (
        parse_window_duration(step_size)
        if isinstance(step_size, str)
        else (step_size or w_delta)
    )

    windows: List[Tuple[datetime, datetime]] = []
    current_start = start_time

    while current_start + w_delta <= end_time:
        current_end = current_start + w_delta
        windows.append((current_start, current_end))
        current_start += s_delta

    # If dataset duration is shorter than window_size or no window fit, provide at least one window
    if not windows and end_time > start_time:
        windows.append((start_time, end_time))

    return windows


def filter_by_cutoff(records: Sequence[Any], cutoff: datetime, timestamp_attr: str = "timestamp") -> List[Any]:
    """Strictly eliminates future leakage: filters records so that only records <= cutoff are preserved."""
    res = []
    for r in records:
        ts = getattr(r, timestamp_attr, None)
        if ts is None and isinstance(r, dict):
            ts = r.get(timestamp_attr)
        if ts is not None and ts <= cutoff:
            res.append(r)
    return res
