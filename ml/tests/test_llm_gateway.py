"""Unit and integration tests for LLM Explanation Gateway."""
from datetime import datetime, timezone
import pytest

from inference.gateway import (
    DeterministicFallbackGateway,
    OllamaGateway,
    SecuritySanitizer,
    StructuredFinding,
    generate_explanation,
)


def sample_finding() -> StructuredFinding:
    return StructuredFinding(
        finding_id="FND-2024-0042",
        engine_source="VIKARA",
        anomaly_score=0.885,
        severity="HIGH",
        time_window_start=datetime(2024, 3, 1, 14, 0, tzinfo=timezone.utc),
        time_window_end=datetime(2024, 3, 1, 15, 0, tzinfo=timezone.utc),
        analyst_id="ANA-SHARMA",
        scenario="analyst_overload",
        features={
            "events_count": 142.0,
            "actions_count": 98.0,
            "mean_investigation_duration_sec": 14.2,
            "closure_rate": 0.95,
        },
        top_deviations=[
            {
                "feature": "actions_count",
                "value": 98.0,
                "baseline_median": 12.0,
                "deviation_degree": 4.8,
            },
            {
                "feature": "mean_investigation_duration_sec",
                "value": 14.2,
                "baseline_median": 180.0,
                "deviation_degree": 3.2,
            },
        ],
        evidence_refs=["ALT-00128", "INC-00045"],
        context={"shift": "day", "queue_pressure": "extreme"},
    )


def test_sanitizer_redacts_private_ips_and_secrets():
    sanitizer = SecuritySanitizer()
    text = (
        "Analyst john.doe@cybercorp.org investigated host 192.168.1.100 and gateway 10.0.0.1 "
        "communicating with external C2 194.87.139.18. Used api_key='sk-live-secret-9988776655' "
        "and SSN 000-12-3456."
    )

    clean_text, counts = sanitizer.sanitize_text(text)

    # Asserts
    assert "john.doe@cybercorp.org" not in clean_text
    assert "[REDACTED_EMAIL]" in clean_text
    assert "192.168.1.100" not in clean_text
    assert "[INTERNAL_IP_1]" in clean_text
    assert "10.0.0.1" not in clean_text
    assert "[INTERNAL_IP_2]" in clean_text
    # Public external C2 IP must NOT be hidden
    assert "194.87.139.18" in clean_text
    # Secret must be redacted
    assert "sk-live-secret-9988776655" not in clean_text
    assert "[REDACTED_SECRET]" in clean_text
    # SSN must be redacted
    assert "000-12-3456" not in clean_text
    assert "[REDACTED_SSN]" in clean_text

    assert counts["internal_ips"] == 2
    assert counts["emails"] == 1
    assert counts["secrets"] == 1
    assert counts["ssns"] == 1


def test_deterministic_fallback_7_part_contract():
    fnd = sample_finding()
    gw = DeterministicFallbackGateway()
    res = gw.explain_sync(fnd)

    assert res.finding_id == fnd.finding_id
    assert res.is_fallback is True
    assert res.provider == "fallback_rule_engine"
    assert res.generation_latency_ms < 50.0  # sub-millisecond expected

    # Verify all 7 PRATYAYA sections are present
    struct = res.structured_explanation
    for section in ["WHAT", "WHY", "WHEN", "WHERE", "EVIDENCE", "CONFIDENCE", "RECOMMENDATION"]:
        assert section in struct
        assert len(struct[section]) > 10

    assert "actions_count" in struct["WHY"]
    assert "ANA-SHARMA" in struct["WHERE"]
    assert "VERY HIGH" in struct["CONFIDENCE"]
    assert "redistribute active queue tickets" in struct["RECOMMENDATION"]


def test_ollama_graceful_fallback_when_offline():
    fnd = sample_finding()
    # Point to a guaranteed non-existent local port
    gw = OllamaGateway(base_url="http://127.0.0.1:59999", timeout_seconds=1.0)
    res = gw.explain_sync(fnd)

    # Should not crash; must fall back to deterministic engine gracefully
    assert res.finding_id == fnd.finding_id
    assert res.is_fallback is True
    assert res.metadata.get("fallback_reason") == "ollama_unavailable"
    assert "WHAT" in res.structured_explanation


def test_generate_explanation_facade():
    fnd = sample_finding()
    res = generate_explanation(fnd, provider="fallback_rule_engine")

    assert res.finding_id == fnd.finding_id
    assert res.provider == "fallback_rule_engine"
    assert len(res.explanation_text) > 50
