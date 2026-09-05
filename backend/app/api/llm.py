"""FastAPI API routes for the ANVĪKṢA Local LLM Subsystem."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.llm.schemas import (
    AssessmentSummaryRequest,
    AssessmentSummaryResponse,
    FindingExplanationRequest,
    FindingExplanationResponse,
    LLMHealthResponse,
)
from app.llm.service import LLMService

router = APIRouter(prefix="/llm", tags=["local-llm"])

# Shared singleton service instance
_llm_service = LLMService()


def get_llm_service() -> LLMService:
    return _llm_service


@router.get("/health", response_model=LLMHealthResponse)
async def check_llm_health(
    service: LLMService = Depends(get_llm_service),
):
    """Returns local Ollama connectivity and model availability status."""
    return await service.get_health()


@router.get("/metrics")
async def get_llm_metrics(
    service: LLMService = Depends(get_llm_service),
):
    """Returns observability metrics: request count, success count, latency."""
    return service.get_metrics()


@router.post("/explain-finding", response_model=FindingExplanationResponse)
async def explain_finding_endpoint(
    request: FindingExplanationRequest,
    force_fallback: bool = Query(default=False, description="Simulate or force deterministic fallback"),
    service: LLMService = Depends(get_llm_service),
):
    """Generates an evidence-backed natural-language explanation for a structured supervisory finding.
    
    If Ollama is offline or times out, seamlessly falls back to deterministic rule synthesis.
    """
    return await service.explain_finding(request, force_fallback=force_fallback)


@router.post("/generate-assessment-summary", response_model=AssessmentSummaryResponse)
async def generate_assessment_summary_endpoint(
    request: AssessmentSummaryRequest,
    force_fallback: bool = Query(default=False, description="Simulate or force deterministic fallback"),
    service: LLMService = Depends(get_llm_service),
):
    """Generates a CISO-level executive assessment briefing based on current telemetry metrics."""
    return await service.generate_assessment_summary(request, force_fallback=force_fallback)
