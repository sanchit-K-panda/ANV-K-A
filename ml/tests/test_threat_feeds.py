"""Tests for external Threat Feed parsing (URLhaus & ThreatFox)."""
import pytest
from ml.common.schemas.internal import IndicatorType, SeverityLevel
from ml.external.parsers.threat_feeds import ThreatFeedParser


def test_urlhaus_parsing():
    parser = ThreatFeedParser()
    indicators, threats = parser.parse_urlhaus()

    assert len(indicators) == 2
    assert len(threats) == 2

    # Check indicator attributes
    i0 = indicators[0]
    assert i0.indicator_type in [IndicatorType.URL, IndicatorType.IPV4]
    assert "[.]" in i0.value  # Defanged
    assert i0.provenance.source == "urlhaus"
    assert i0.provenance.license == "CC0 1.0 Universal"

    # Check threat attributes
    t0 = threats[0]
    assert t0.category == "MALWARE_DELIVERY"
    assert t0.severity == SeverityLevel.HIGH


def test_threatfox_parsing():
    parser = ThreatFeedParser()
    indicators, threats = parser.parse_threatfox()

    assert len(indicators) == 2
    assert len(threats) == 2

    i_hash = indicators[1]
    assert i_hash.indicator_type == IndicatorType.SHA256
    assert i_hash.provenance.source == "threatfox"
    assert i_hash.provenance.source_confidence == 1.0


def test_threat_feed_deduplication():
    parser = ThreatFeedParser()
    # First parse
    ind1, _ = parser.parse_threatfox()
    assert len(ind1) == 2

    # Parse exact same batch again -> deduplicator should skip already seen indicators
    ind2, _ = parser.parse_threatfox()
    assert len(ind2) == 0
