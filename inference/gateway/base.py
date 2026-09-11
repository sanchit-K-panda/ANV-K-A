"""Abstract Base Interfaces and Schemas for ANVĪKṢA LLM Explanation Gateway.

Enforces the boundary: LLMs are strictly used for explanation synthesis,
NEVER as the source of truth for detection.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class GatewayProvider(str, Enum):
    OLLAMA = "ollama"
    LLAMACPP = "llamacpp"
    FALLBACK = "fallback_rule_engine"


class StructuredFinding(BaseModel):
    """Input payload representing an engine detection finding to be explained."""
    finding_id: str
    engine_source: str = "VIKARA"  # VIKARA, VIVEKA, ABHAVA, SANGATI, PUNARAVRTTI
    anomaly_score: float = Field(..., ge=0.0, le=1.0)
    severity: str = "HIGH"
    time_window_start: datetime
    time_window_end: datetime
    analyst_id: Optional[str] = None
    scenario: Optional[str] = None
    features: Dict[str, float] = Field(default_factory=dict)
    top_deviations: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_refs: List[str] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)


class LLMExplanationResult(BaseModel):
    """Normalized response schema for finding explanations."""
    finding_id: str
    provider: str
    model_name: str
    explanation_text: str
    structured_explanation: Dict[str, str] = Field(default_factory=dict)
    is_fallback: bool = False
    generation_latency_ms: float = 0.0
    sanitized: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
    generated_at: datetime = Field(default_factory=utc_now)


class BaseLLMGateway(ABC):
    """Abstract interface that all inference providers must implement."""

    @abstractmethod
    def explain_sync(self, finding: StructuredFinding) -> LLMExplanationResult:
        """Synchronously synthesizes a finding explanation."""
        pass

    @abstractmethod
    async def explain(self, finding: StructuredFinding) -> LLMExplanationResult:
        """Asynchronously synthesizes a finding explanation."""
        pass
