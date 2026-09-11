"""Indicator classification, defanging, and sanitization."""
from __future__ import annotations

import re
from typing import Tuple
from ml.common.schemas.internal import IndicatorType

# Regexes for cyber indicators
_IPV4_RE = re.compile(r"^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$")
_IPV6_RE = re.compile(r"^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$")
_MD5_RE = re.compile(r"^[a-fA-F0-9]{32}$")
_SHA256_RE = re.compile(r"^[a-fA-F0-9]{64}$")
_CVE_RE = re.compile(r"^CVE-\d{4}-\d{4,8}$", re.IGNORECASE)
_URL_RE = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)
_DOMAIN_RE = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)


def refang_ioc(val: str) -> str:
    """Removes defensive defanging markers (e.g. hxxp, [.], [dot]) to restore valid indicator."""
    val = val.strip()
    val = re.sub(r"^hxxp", "http", val, flags=re.IGNORECASE)
    val = val.replace("[.]", ".").replace("(.)", ".").replace("{.}", ".")
    val = val.replace("[:]", ":").replace("(:)", ":")
    return val


def defang_ioc(val: str) -> str:
    """Applies defensive defanging markers to avoid accidental click/trigger."""
    val = val.strip()
    val = re.sub(r"^http", "hxxp", val, flags=re.IGNORECASE)
    val = val.replace(".", "[.]")
    return val


def detect_indicator_type(raw_val: str) -> Tuple[IndicatorType, str]:
    """Detects indicator type and returns (IndicatorType, cleaned_refanged_value)."""
    if not raw_val:
        return IndicatorType.UNKNOWN, ""

    val = refang_ioc(raw_val)

    if _CVE_RE.match(val):
        return IndicatorType.CVE, val.upper()
    if _IPV4_RE.match(val):
        return IndicatorType.IPV4, val
    if _IPV6_RE.match(val):
        return IndicatorType.IPV6, val.lower()
    if _SHA256_RE.match(val):
        return IndicatorType.SHA256, val.lower()
    if _MD5_RE.match(val):
        return IndicatorType.MD5, val.lower()
    if _URL_RE.match(val):
        return IndicatorType.URL, val
    if _DOMAIN_RE.match(val):
        return IndicatorType.DOMAIN, val.lower()

    return IndicatorType.UNKNOWN, val
