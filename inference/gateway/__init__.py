"""ANVĪKṢA LLM Explanation Gateway.

Boundary contract: Explanations are syntheses over structured findings,
never the detection source of truth.
"""
from __future__ import annotations

import os
from typing import Optional

from inference.gateway.base import (
    BaseLLMGateway,
    GatewayProvider,
    LLMExplanationResult,
    StructuredFinding,
)
from inference.gateway.fallback import DeterministicFallbackGateway
from inference.gateway.llamacpp import LlamaCppGateway
from inference.gateway.ollama import OllamaGateway
from inference.gateway.sanitizer import SecuritySanitizer

_GATEWAY_CACHE: dict = {}


def get_gateway(provider: Optional[str] = None) -> BaseLLMGateway:
    """Factory function returning the configured LLM gateway instance."""
    chosen_provider = provider or os.getenv("ANVIKSA_LLM_PROVIDER", GatewayProvider.OLLAMA.value)

    if chosen_provider in _GATEWAY_CACHE:
        return _GATEWAY_CACHE[chosen_provider]

    gw: BaseLLMGateway
    if chosen_provider == GatewayProvider.FALLBACK.value or chosen_provider == "fallback":
        gw = DeterministicFallbackGateway()
    elif chosen_provider == GatewayProvider.LLAMACPP.value or chosen_provider == "llamacpp":
        gw = LlamaCppGateway()
    else:  # default to Ollama (which auto-falls back to DeterministicFallbackGateway)
        gw = OllamaGateway()

    _GATEWAY_CACHE[chosen_provider] = gw
    return gw


def generate_explanation(
    finding: StructuredFinding,
    provider: Optional[str] = None,
) -> LLMExplanationResult:
    """Primary entry point for generating finding explanations.

    Args:
        finding: Structured detection finding with deviations and context.
        provider: Target provider ('ollama', 'llamacpp', 'fallback_rule_engine').

    Returns:
        LLMExplanationResult adhering to PRATYAYA 7-part explainability contract.
    """
    gateway = get_gateway(provider)
    return gateway.explain_sync(finding)


__all__ = [
    "BaseLLMGateway",
    "GatewayProvider",
    "StructuredFinding",
    "LLMExplanationResult",
    "DeterministicFallbackGateway",
    "OllamaGateway",
    "LlamaCppGateway",
    "SecuritySanitizer",
    "get_gateway",
    "generate_explanation",
]
