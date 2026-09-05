"""Sanitization, safety, and output validation for the ANVĪKṢA local LLM subsystem."""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Union

from app.llm.exceptions import InvalidLLMResponseError, PromptInjectionDetectedError
from app.llm.schemas import (
    AssessmentSummaryRequest,
    AssessmentSummaryResponse,
    FindingExplanationRequest,
    FindingExplanationResponse,
)

log = logging.getLogger(__name__)

# Patterns for sensitive information that must never be sent to any model
SENSITIVE_PATTERNS = [
    (re.compile(r"-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----[\s\S]*?-----END[ A-Z0-9_-]*PRIVATE KEY-----", re.IGNORECASE), "[REDACTED_PRIVATE_KEY]"),
    (re.compile(r"\b(?:password|passwd|pwd|secret)\s*[:=]\s*['\"][^'\"]+['\"]", re.IGNORECASE), "password=[REDACTED]"),
    (re.compile(r"\bBearer\s+[a-zA-Z0-9_\-\.]{20,}", re.IGNORECASE), "Bearer [REDACTED_TOKEN]"),
    (re.compile(r"\b[a-zA-Z0-9+/]{80,}={0,2}\b"), "[REDACTED_RAW_DATA]"),  # Large base64 blobs / biometric templates
    (re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"), "[REDACTED_KEY_ID]"),
]

# Patterns for prompt injection attempts in untrusted telemetry
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(?:all\s+)?(?:previous\s+)?instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(?:the\s+)?(?:system\s+)?rules", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(?:in\s+)?(?:developer|god|unrestricted)\s+mode", re.IGNORECASE),
    re.compile(r"system\s+override", re.IGNORECASE),
    re.compile(r"say\s+(?:the\s+)?soc\s+is\s+healthy", re.IGNORECASE),
    re.compile(r"clear\s+(?:all\s+)?findings", re.IGNORECASE),
]


def sanitize_text(text: str) -> str:
    """Sanitizes text by scrubbing credentials, private keys, and neutralising injection markers."""
    if not isinstance(text, str):
        return str(text)

    sanitized = text
    for pattern, replacement in SENSITIVE_PATTERNS:
        sanitized = pattern.sub(replacement, sanitized)

    # Neutralize prompt injection attempts
    for pattern in PROMPT_INJECTION_PATTERNS:
        if pattern.search(sanitized):
            log.warning("Prompt injection indicator detected and neutralized in telemetry: %s", pattern.pattern)
            sanitized = pattern.sub("[UNTRUSTED_INSTRUCTION_NEUTRALIZED]", sanitized)

    return sanitized


def sanitize_data_structure(data: Any) -> Any:
    """Recursively walks any dict, list, or primitive to scrub sensitive fields."""
    if isinstance(data, dict):
        cleaned = {}
        for k, v in data.items():
            lower_k = str(k).lower()
            if any(s in lower_k for s in ("password", "secret", "private_key", "biometric_template", "token")):
                cleaned[k] = "[REDACTED_SENSITIVE_FIELD]"
            else:
                cleaned[k] = sanitize_data_structure(v)
        return cleaned
    elif isinstance(data, list):
        return [sanitize_data_structure(item) for item in data]
    elif isinstance(data, str):
        return sanitize_text(data)
    else:
        return data


def sanitize_finding_request(req: FindingExplanationRequest) -> FindingExplanationRequest:
    """Produces a sanitized copy of the request guaranteed to be free of sensitive credentials."""
    return FindingExplanationRequest(
        finding_id=sanitize_text(req.finding_id),
        finding_type=sanitize_text(req.finding_type),
        soc_id=sanitize_text(req.soc_id),
        severity=req.severity,
        confidence=req.confidence,
        risk_score=req.risk_score,
        title=sanitize_text(req.title),
        summary=sanitize_text(req.summary),
        baseline=sanitize_data_structure(req.baseline),
        observed=sanitize_data_structure(req.observed),
        missing_actions=[sanitize_text(a) for a in req.missing_actions],
        evidence=sanitize_data_structure(req.evidence),
        recommendation=sanitize_text(req.recommendation),
    )


def sanitize_assessment_request(req: AssessmentSummaryRequest) -> AssessmentSummaryRequest:
    """Produces a sanitized copy of the assessment request."""
    return AssessmentSummaryRequest(
        soc_id=sanitize_text(req.soc_id),
        health_score=req.health_score,
        grade=sanitize_text(req.grade),
        status=sanitize_text(req.status),
        quadrant_scores=req.quadrant_scores,
        findings_summary=sanitize_data_structure(req.findings_summary),
        risk_drivers=[sanitize_text(d) for d in req.risk_drivers],
    )


def validate_finding_response(
    parsed: Dict[str, Any],
    request: FindingExplanationRequest,
    model: str,
    duration_ms: float = 0.0,
) -> FindingExplanationResponse:
    """Validates model output against the strict contract and preserves detection invariants."""
    if not isinstance(parsed, dict):
        raise InvalidLLMResponseError("LLM output is not a valid JSON dictionary.")

    # Ensure required textual fields exist and are strings
    required_fields = [
        "title",
        "summary",
        "what_happened",
        "why_it_matters",
        "evidence_summary",
        "confidence_statement",
        "recommended_action",
    ]
    for f in required_fields:
        if f not in parsed or not isinstance(parsed[f], str) or not parsed[f].strip():
            # If missing, supply a safe fallback string derived from the request
            parsed[f] = f"Observation: {request.summary}" if f == "what_happened" else request.title

    limitations = parsed.get("limitations")
    if not isinstance(limitations, list):
        limitations = [str(limitations)] if limitations else []

    # HARD INVARIANT PRESERVATION:
    # Under no circumstances can the LLM modify finding_id, severity, confidence, or risk_score!
    return FindingExplanationResponse(
        title=parsed["title"].strip(),
        summary=parsed["summary"].strip(),
        what_happened=parsed["what_happened"].strip(),
        why_it_matters=parsed["why_it_matters"].strip(),
        evidence_summary=parsed["evidence_summary"].strip(),
        confidence_statement=parsed["confidence_statement"].strip(),
        recommended_action=parsed["recommended_action"].strip(),
        limitations=[str(l) for l in limitations],
        finding_id=request.finding_id,
        severity=request.severity,
        confidence=request.confidence,
        risk_score=request.risk_score,
        model=model,
        is_fallback=False,
        inference_duration_ms=round(duration_ms, 2),
    )


def validate_assessment_response(
    parsed: Dict[str, Any],
    request: AssessmentSummaryRequest,
    model: str,
    duration_ms: float = 0.0,
) -> AssessmentSummaryResponse:
    """Validates executive assessment output against schema while preserving numerical health metrics."""
    if not isinstance(parsed, dict):
        raise InvalidLLMResponseError("Assessment summary is not a valid JSON dictionary.")

    exec_summary = parsed.get("executive_summary")
    if not exec_summary or not isinstance(exec_summary, str):
        exec_summary = f"SOC {request.soc_id} evaluated with health score {request.health_score}/100 ({request.status})."

    def ensure_list(key: str) -> List[str]:
        val = parsed.get(key, [])
        if isinstance(val, list):
            return [str(x) for x in val if x]
        elif isinstance(val, str) and val.strip():
            return [val.strip()]
        return []

    return AssessmentSummaryResponse(
        executive_summary=exec_summary.strip(),
        critical_findings=ensure_list("critical_findings"),
        operational_concerns=ensure_list("operational_concerns"),
        recommended_focus=ensure_list("recommended_focus"),
        soc_id=request.soc_id,
        health_score=request.health_score,
        grade=request.grade,
        model=model,
        is_fallback=False,
        inference_duration_ms=round(duration_ms, 2),
    )
