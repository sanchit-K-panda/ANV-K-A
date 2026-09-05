"""Dedicated LLM service orchestrator with observability and deterministic fallback."""
from __future__ import annotations

import json
import logging
import time
from typing import Any, Dict, Optional

from app.core.config import settings
from app.llm.client import OllamaClient
from app.llm.exceptions import LLMException
from app.llm.prompts import (
    SYSTEM_PROMPT,
    build_assessment_prompt,
    build_finding_prompt,
    clean_deepseek_r1_output,
)
from app.llm.schemas import (
    AssessmentSummaryRequest,
    AssessmentSummaryResponse,
    FindingExplanationRequest,
    FindingExplanationResponse,
    LLMHealthResponse,
)
from app.llm.validators import (
    sanitize_assessment_request,
    sanitize_finding_request,
    validate_assessment_response,
    validate_finding_response,
)

log = logging.getLogger(__name__)


class LLMService:
    """Enterprise LLM orchestration service for ANVĪKṢA supervisory forensics."""

    def __init__(self, client: Optional[OllamaClient] = None):
        self.client = client or OllamaClient()
        # Observability counters
        self.request_count = 0
        self.success_count = 0
        self.failure_count = 0
        self.total_latency_ms = 0.0

    def get_metrics(self) -> Dict[str, Any]:
        """Returns observability metrics for LLM operations."""
        avg_latency = (
            round(self.total_latency_ms / self.success_count, 2)
            if self.success_count > 0
            else 0.0
        )
        return {
            "llm_request_count": self.request_count,
            "llm_success_count": self.success_count,
            "llm_failure_count": self.failure_count,
            "llm_average_latency_ms": avg_latency,
        }

    async def get_health(self) -> LLMHealthResponse:
        """Returns the operational status of the local LLM subsystem."""
        reachable, models = await self.client.check_health()
        model_name = self.client.default_model
        model_found = any(m == model_name or m.startswith(f"{model_name}:") for m in models)

        status_text = "READY" if (reachable and model_found) else ("MODEL_MISSING" if reachable else "OFFLINE")

        return LLMHealthResponse(
            status=status_text,
            ollama_reachable=reachable,
            base_url=self.client.base_url,
            configured_model=model_name,
            available_models=models,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Deterministic Rule-Based Fallbacks (Zero-Failure Guarantee)
    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def _build_fallback_finding_explanation(
        req: FindingExplanationRequest,
        reason: str = "Local LLM unavailable or timed out; deterministic fallback used.",
    ) -> FindingExplanationResponse:
        """Constructs a deterministic, evidence-backed explanation when the LLM is unreachable."""
        # Synthesize baseline vs observed delta
        delta_parts = []
        if req.baseline and req.observed:
            for k in req.baseline:
                if k in req.observed:
                    delta_parts.append(f"{k.replace('_', ' ')} dropped/shifted from {req.baseline[k]} to {req.observed[k]}")
        delta_str = "; ".join(delta_parts) if delta_parts else "Operational baseline metrics were violated."

        missing_str = (
            f" Omitted actions: {', '.join(req.missing_actions)}."
            if req.missing_actions
            else ""
        )

        return FindingExplanationResponse(
            title=req.title,
            summary=req.summary,
            what_happened=f"{req.summary}{missing_str}",
            why_it_matters=f"Workflow anomaly in {req.soc_id} compromising security oversight. {delta_str}",
            evidence_summary=(
                f"Corroborated by telemetry across scope with {len(req.missing_actions)} omitted mandatory SOP steps."
                if req.missing_actions
                else "Directly corroborated by supervisory anomaly detector telemetry."
            ),
            confidence_statement=f"Deterministic detection confidence of {req.confidence * 100:.0f}% mathematically verified by the underlying analytical engine.",
            recommended_action=req.recommendation or f"Review escalation records and initiate procedural audit for {req.soc_id}.",
            limitations=[reason],
            finding_id=req.finding_id,
            severity=req.severity,
            confidence=req.confidence,
            risk_score=req.risk_score,
            model="deterministic-fallback-engine",
            is_fallback=True,
            inference_duration_ms=0.0,
        )

    @staticmethod
    def _build_fallback_assessment_summary(
        req: AssessmentSummaryRequest,
        reason: str = "Local LLM unavailable; deterministic metrics synthesis used.",
    ) -> AssessmentSummaryResponse:
        """Constructs a deterministic executive summary from structured metrics."""
        summary = (
            f"Supervisory evaluation for {req.soc_id} yielded an overall health score of "
            f"{req.health_score}/100 (Grade {req.grade}, Status {req.status}). "
            f"Key operational factor drag identified across {len(req.risk_drivers)} primary drivers."
        )

        critical_fnds = [
            f.get("title", "High-severity finding detected")
            for f in req.findings_summary
            if str(f.get("severity", "")).upper() in ("CRITICAL", "HIGH")
        ][:3]

        return AssessmentSummaryResponse(
            executive_summary=summary,
            critical_findings=critical_fnds or ["No critical supervisory findings in active queue."],
            operational_concerns=req.risk_drivers[:4] or ["Routine telemetry variance within nominal parameters."],
            recommended_focus=[
                "Remediate investigation omissions in highest-priority findings.",
                "Review supervisor sign-off adherence and MTTR closure metrics.",
            ],
            soc_id=req.soc_id,
            health_score=req.health_score,
            grade=req.grade,
            model="deterministic-fallback-engine",
            is_fallback=True,
            inference_duration_ms=0.0,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Core Public Execution Handlers
    # ──────────────────────────────────────────────────────────────────────────
    async def explain_finding(
        self,
        request: FindingExplanationRequest,
        force_fallback: bool = False,
    ) -> FindingExplanationResponse:
        """Explains a structured finding using DeepSeek-R1 8B with automatic deterministic fallback."""
        self.request_count += 1
        sanitized_req = sanitize_finding_request(request)

        if force_fallback:
            log.info("Force fallback enabled; returning deterministic explanation for %s", request.finding_id)
            return self._build_fallback_finding_explanation(sanitized_req, reason="Fallback mode explicitly requested.")

        prompt = build_finding_prompt(sanitized_req)

        try:
            raw_text, duration_ms = await self.client.generate(
                prompt=prompt,
                system=SYSTEM_PROMPT,
                model=self.client.default_model,
                temperature=0.2,
            )

            # Strip DeepSeek-R1 <think> tags and extract pure JSON
            cleaned_json_text = clean_deepseek_r1_output(raw_text)
            parsed = json.loads(cleaned_json_text)

            # Validate schema and preserve mathematical invariants (severity, confidence, risk_score)
            response = validate_finding_response(
                parsed=parsed,
                request=sanitized_req,
                model=self.client.default_model,
                duration_ms=duration_ms,
            )

            self.success_count += 1
            self.total_latency_ms += duration_ms
            log.info(
                "Successfully generated LLM explanation for %s in %.1fms",
                request.finding_id,
                duration_ms,
            )
            return response

        except Exception as err:
            self.failure_count += 1
            log.warning(
                "Ollama inference failed for finding %s (%s). Engaging deterministic fallback.",
                request.finding_id,
                err,
            )
            return self._build_fallback_finding_explanation(
                sanitized_req,
                reason=f"LLM inference encountered {type(err).__name__}: {err}",
            )

    async def generate_assessment_summary(
        self,
        request: AssessmentSummaryRequest,
        force_fallback: bool = False,
    ) -> AssessmentSummaryResponse:
        """Generates a CISO executive assessment briefing using DeepSeek-R1 8B with fallback."""
        self.request_count += 1
        sanitized_req = sanitize_assessment_request(request)

        if force_fallback:
            return self._build_fallback_assessment_summary(sanitized_req, reason="Fallback mode explicitly requested.")

        prompt = build_assessment_prompt(sanitized_req)

        try:
            raw_text, duration_ms = await self.client.generate(
                prompt=prompt,
                system=SYSTEM_PROMPT,
                model=self.client.default_model,
                temperature=0.2,
            )

            cleaned_json_text = clean_deepseek_r1_output(raw_text)
            parsed = json.loads(cleaned_json_text)

            response = validate_assessment_response(
                parsed=parsed,
                request=sanitized_req,
                model=self.client.default_model,
                duration_ms=duration_ms,
            )

            self.success_count += 1
            self.total_latency_ms += duration_ms
            return response

        except Exception as err:
            self.failure_count += 1
            log.warning("Ollama executive summary generation failed (%s). Using fallback.", err)
            return self._build_fallback_assessment_summary(
                sanitized_req,
                reason=f"LLM inference encountered {type(err).__name__}: {err}",
            )
