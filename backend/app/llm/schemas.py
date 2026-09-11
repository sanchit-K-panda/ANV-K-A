"""Typed input and output schemas for the ANVĪKṢA local LLM subsystem."""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class BaseLLMSchema(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class FindingExplanationRequest(BaseLLMSchema):
    """Structured evidence request passed to the local LLM for explanation.
    
    Never send raw database dumps. All fields are pre-sanitized by the service.
    """
    finding_id: str = Field(description="Unique finding identifier, e.g. FND-EXEC-001")
    finding_type: str = Field(description="Detection engine type, e.g. EXECUTION_GAP, KPI_MANIPULATION")
    soc_id: str = Field(default="SOC-04", description="Target SOC identifier")
    severity: str = Field(description="CRITICAL, HIGH, MEDIUM, LOW, or INFO")
    confidence: float = Field(ge=0.0, le=1.0, description="Engine detection confidence score (0.0 to 1.0)")
    risk_score: int = Field(ge=0, le=100, description="MĀN additive composite risk score (0 to 100)")
    title: str = Field(description="Concise title of the finding")
    summary: str = Field(description="Brief description of the observed operational breakdown")
    baseline: Dict[str, Any] = Field(default_factory=dict, description="Expected SLA/SOP baseline values")
    observed: Dict[str, Any] = Field(default_factory=dict, description="Observed operational values in telemetry")
    missing_actions: List[str] = Field(default_factory=list, description="Mandatory SOP actions omitted by analysts")
    evidence: Union[List[Dict[str, Any]], Dict[str, Any], str] = Field(
        default_factory=list,
        description="Structured telemetry evidence references (never raw dumps)",
    )
    recommendation: str = Field(default="", description="Algorithmic recommendation from detection engine")


class FindingExplanationResponse(BaseLLMSchema):
    """Strict structured response produced by DeepSeek-R1 / local LLM."""
    title: str = Field(description="Professional, executive-readable title")
    summary: str = Field(description="High-level 1-2 sentence supervisory summary")
    what_happened: str = Field(description="Exact operational event that was observed vs omitted")
    why_it_matters: str = Field(description="Impact on security posture, compliance, or detection blindness")
    evidence_summary: str = Field(description="Traceable summary of supporting evidence provided")
    confidence_statement: str = Field(description="Explanation of analytical confidence based on supplied evidence")
    recommended_action: str = Field(description="Actionable, prioritized remediation steps for SOC supervisor")
    limitations: List[str] = Field(default_factory=list, description="Any data limitations or investigative caveats")
    
    # Preserved invariant telemetry from detection engines (LLM CANNOT MODIFY)
    finding_id: str
    severity: str
    confidence: float
    risk_score: int
    model: str = Field(description="Name of the model generating this explanation")
    is_fallback: bool = Field(default=False, description="True if generated via deterministic rule fallback")
    inference_duration_ms: float = Field(default=0.0, description="Inference latency in milliseconds")


class AssessmentSummaryRequest(BaseLLMSchema):
    """Structured request for CISO-level executive assessment summary."""
    soc_id: str = Field(default="SOC-04", description="Target SOC enclave")
    health_score: int = Field(ge=0, le=100, description="Overall health score (0-100)")
    grade: str = Field(description="Letter grade, e.g. A, B+, C-, F")
    status: str = Field(description="HEALTHY, DEGRADED, CRITICAL")
    quadrant_scores: Dict[str, int] = Field(
        default_factory=dict,
        description="Scores for Detection, Investigation, Escalation, and Response",
    )
    findings_summary: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of top active supervisory findings",
    )
    risk_drivers: List[str] = Field(
        default_factory=list,
        description="Primary contributing factor drags",
    )


class AssessmentSummaryResponse(BaseLLMSchema):
    """CISO-level executive briefing note generated from structured metrics."""
    executive_summary: str = Field(description="High-level assessment of SOC effectiveness and posture")
    critical_findings: List[str] = Field(description="Key findings requiring immediate supervisory intervention")
    operational_concerns: List[str] = Field(description="Structural workflow or workload anomalies observed")
    recommended_focus: List[str] = Field(description="Top recommended corrective actions for SOC leadership")
    
    soc_id: str
    health_score: int
    grade: str
    model: str
    is_fallback: bool = Field(default=False)
    inference_duration_ms: float = Field(default=0.0)


class LLMHealthResponse(BaseLLMSchema):
    """Diagnostics status for the local LLM subsystem."""
    status: str
    ollama_reachable: bool
    base_url: str
    configured_model: str
    available_models: List[str]
