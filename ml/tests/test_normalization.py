"""Unit tests for ANVĪKṢA Normalization and Data Layer."""
from datetime import datetime, timezone
import pytest

from ml.common.normalization.identifiers import compute_deterministic_hash, normalize_identifier
from ml.common.normalization.indicators import defang_ioc, detect_indicator_type, refang_ioc
from ml.common.normalization.pipeline import NormalizationPipeline
from ml.common.normalization.severity import normalize_severity
from ml.common.normalization.timestamps import normalize_timestamp
from ml.common.schemas.internal import IndicatorType, SeverityLevel


def test_timestamp_normalization_iso_utc():
    ts_str = "2026-09-01T12:00:00Z"
    dt = normalize_timestamp(ts_str)
    assert dt.tzinfo == timezone.utc
    assert dt.year == 2026 and dt.month == 9 and dt.day == 1 and dt.hour == 12


def test_timestamp_normalization_epoch():
    epoch_sec = 1788264000  # 2026
    dt = normalize_timestamp(epoch_sec)
    assert dt.tzinfo == timezone.utc
    assert dt.year == 2026

    # Test epoch in milliseconds
    epoch_ms = epoch_sec * 1000
    dt_ms = normalize_timestamp(epoch_ms)
    assert dt_ms == dt


def test_identifier_prefixes():
    assert normalize_identifier("event", "12345") == "EVT-12345"
    assert normalize_identifier("event", "EVT-12345") == "EVT-12345"
    assert normalize_identifier("analyst", "a17") == "ANA-A17"
    assert normalize_identifier("incident", "inc-999") == "INC-999"


def test_severity_normalization_multi_tier():
    assert normalize_severity("CRITICAL") == SeverityLevel.CRITICAL
    assert normalize_severity("Fatal") == SeverityLevel.CRITICAL
    assert normalize_severity(1) == SeverityLevel.CRITICAL
    assert normalize_severity("1") == SeverityLevel.CRITICAL
    assert normalize_severity("high") == SeverityLevel.HIGH
    assert normalize_severity("WARNING") == SeverityLevel.MEDIUM
    assert normalize_severity("Notice") == SeverityLevel.LOW
    assert normalize_severity("DEBUG") == SeverityLevel.INFO

    # CVSS numeric float scales
    assert normalize_severity(9.8) == SeverityLevel.CRITICAL
    assert normalize_severity(7.5) == SeverityLevel.HIGH
    assert normalize_severity(5.2) == SeverityLevel.MEDIUM
    assert normalize_severity(0.0) == SeverityLevel.INFO


def test_indicator_detection_and_defanging():
    # IPv4
    itype, val = detect_indicator_type("192.168.1[.]100")
    assert itype == IndicatorType.IPV4
    assert val == "192.168.1.100"

    # URL
    itype, val = detect_indicator_type("hxxps://malicious[.]domain/bad.exe")
    assert itype == IndicatorType.URL
    assert val == "https://malicious.domain/bad.exe"

    # CVE
    itype, val = detect_indicator_type("cve-2026-1234")
    assert itype == IndicatorType.CVE
    assert val == "CVE-2026-1234"

    # SHA256
    sha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    itype, val = detect_indicator_type(sha)
    assert itype == IndicatorType.SHA256
    assert val == sha

    # Defanging
    assert defang_ioc("https://evil.com/drop") == "hxxps://evil[.]com/drop"
    assert refang_ioc("hxxps://evil[.]com/drop") == "https://evil.com/drop"


def test_source_aware_deduplication():
    pipeline = NormalizationPipeline(default_source="maya_soc_simulator")

    raw_event = {
        "event_id": "EVT-1001",
        "soc_id": "SOC-001",
        "timestamp": "2026-09-01T10:00:00Z",
        "severity": "HIGH",
        "event_type": "AUTHENTICATION_FAILURE",
    }

    # First observation from source A
    e1 = pipeline.normalize_event(raw_event, source="source_a")
    assert e1 is not None
    assert e1.provenance.source == "source_a"

    # Exact duplicate from source A should be rejected
    e1_dup = pipeline.normalize_event(raw_event, source="source_a")
    assert e1_dup is None

    # Observation from source B should be accepted (source-aware deduplication)
    e2 = pipeline.normalize_event(raw_event, source="source_b")
    assert e2 is not None
    assert e2.provenance.source == "source_b"
