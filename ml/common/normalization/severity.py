"""Severity standardization for ANVĪKṢA Data Layer.

Normalizes multi-vendor, syslog, numeric, and categorical severity levels
into the canonical 5-tier enum: CRITICAL, HIGH, MEDIUM, LOW, INFO.
"""
from __future__ import annotations

from typing import Any
from ml.common.schemas.internal import SeverityLevel

_SEVERITY_MAP = {
    # Exact and common aliases
    "CRITICAL": SeverityLevel.CRITICAL,
    "CRIT": SeverityLevel.CRITICAL,
    "FATAL": SeverityLevel.CRITICAL,
    "EMERGENCY": SeverityLevel.CRITICAL,
    "ALERT": SeverityLevel.CRITICAL,
    "P1": SeverityLevel.CRITICAL,
    "SEV1": SeverityLevel.CRITICAL,
    "SEV-1": SeverityLevel.CRITICAL,
    "1": SeverityLevel.CRITICAL,
    1: SeverityLevel.CRITICAL,
    
    "HIGH": SeverityLevel.HIGH,
    "ERROR": SeverityLevel.HIGH,
    "ERR": SeverityLevel.HIGH,
    "P2": SeverityLevel.HIGH,
    "SEV2": SeverityLevel.HIGH,
    "SEV-2": SeverityLevel.HIGH,
    "2": SeverityLevel.HIGH,
    2: SeverityLevel.HIGH,
    
    "MEDIUM": SeverityLevel.MEDIUM,
    "MED": SeverityLevel.MEDIUM,
    "MODERATE": SeverityLevel.MEDIUM,
    "WARNING": SeverityLevel.MEDIUM,
    "WARN": SeverityLevel.MEDIUM,
    "P3": SeverityLevel.MEDIUM,
    "SEV3": SeverityLevel.MEDIUM,
    "SEV-3": SeverityLevel.MEDIUM,
    "3": SeverityLevel.MEDIUM,
    3: SeverityLevel.MEDIUM,
    
    "LOW": SeverityLevel.LOW,
    "NOTICE": SeverityLevel.LOW,
    "MINOR": SeverityLevel.LOW,
    "P4": SeverityLevel.LOW,
    "SEV4": SeverityLevel.LOW,
    "SEV-4": SeverityLevel.LOW,
    "4": SeverityLevel.LOW,
    4: SeverityLevel.LOW,
    
    "INFO": SeverityLevel.INFO,
    "INFORMATIONAL": SeverityLevel.INFO,
    "DEBUG": SeverityLevel.INFO,
    "TRACE": SeverityLevel.INFO,
    "P5": SeverityLevel.INFO,
    "SEV5": SeverityLevel.INFO,
    "SEV-5": SeverityLevel.INFO,
    "5": SeverityLevel.INFO,
    5: SeverityLevel.INFO,
}


def normalize_severity(val: Any) -> SeverityLevel:
    """Translates any vendor/syslog/numeric severity indicator to canonical SeverityLevel."""
    if val is None:
        return SeverityLevel.MEDIUM

    if isinstance(val, SeverityLevel):
        return val

    # Direct lookup
    if val in _SEVERITY_MAP:
        return _SEVERITY_MAP[val]

    str_val = str(val).strip().upper()
    if str_val in _SEVERITY_MAP:
        return _SEVERITY_MAP[str_val]

    # CVSS numeric float scale (0.0 to 10.0)
    try:
        num = float(val)
        if num >= 9.0:
            return SeverityLevel.CRITICAL
        elif num >= 7.0:
            return SeverityLevel.HIGH
        elif num >= 4.0:
            return SeverityLevel.MEDIUM
        elif num >= 0.1:
            return SeverityLevel.LOW
        else:
            return SeverityLevel.INFO
    except (ValueError, TypeError):
        pass

    return SeverityLevel.MEDIUM
