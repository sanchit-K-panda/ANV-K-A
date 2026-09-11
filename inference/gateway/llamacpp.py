"""Llama.cpp Inference Gateway for ANVĪKṢA.

Connects to a local llama.cpp HTTP server executing GGUF quantized models.
Supports air-gapped CPU/CUDA inference with sanitization and deterministic fallback.
"""
from __future__ import annotations

import json
import logging
import time
from typing import Any, Dict, Optional
import httpx

from inference.gateway.base import (
    BaseLLMGateway,
    LLMExplanationResult,
    StructuredFinding,
    utc_now,
)
from inference.gateway.fallback import DeterministicFallbackGateway
from inference.gateway.sanitizer import SecuritySanitizer

log = logging.getLogger(__name__)


class LlamaCppGateway(BaseLLMGateway):
    """Inference gateway for local llama.cpp server endpoints."""

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:8080",
        model_alias: str = "deepseek-r1-8b-gguf",
        timeout_seconds: float = 30.0,
        temperature: float = 0.2,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model_alias = model_alias
        self.timeout_seconds = timeout_seconds
        self.temperature = temperature
        self.sanitizer = SecuritySanitizer()
        self.fallback = DeterministicFallbackGateway()

    def _build_prompt(self, finding: StructuredFinding) -> str:
        payload = {
            "finding_id": finding.finding_id,
            "engine": finding.engine_source,
            "anomaly_score": round(finding.anomaly_score, 4),
            "severity": finding.severity,
            "window_start": finding.time_window_start.isoformat(),
            "window_end": finding.time_window_end.isoformat(),
            "analyst_id": finding.analyst_id or "SOC_TOTAL",
            "scenario": finding.scenario,
            "top_deviating_features": finding.top_deviations,
            "evidence_refs": finding.evidence_refs[:5],
        }
        return (
            f"<system>You are ANVĪKṢA PRATYAYA explainability engine. Synthesize an objective 7-part report "
            f"(WHAT, WHY, WHEN, WHERE, EVIDENCE, CONFIDENCE, RECOMMENDATION) for this detection finding.</system>\n"
            f"<user>{json.dumps(payload)}</user>\n<assistant>"
        )

    def explain_sync(self, finding: StructuredFinding) -> LLMExplanationResult:
        sanitized_finding, _ = self.sanitizer.sanitize_finding(finding)
        prompt = self._build_prompt(sanitized_finding)
        url = f"{self.base_url}/completion"

        payload = {
            "prompt": prompt,
            "temperature": self.temperature,
            "n_predict": 1024,
            "stop": ["</assistant>", "<user>"],
        }

        t0 = time.perf_counter()
        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.post(url, json=payload)
                latency = (time.perf_counter() - t0) * 1000.0

                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data.get("content", "").strip()
                    if raw_text:
                        clean_text, _ = self.sanitizer.sanitize_text(raw_text)
                        return LLMExplanationResult(
                            finding_id=finding.finding_id,
                            provider="llamacpp",
                            model_name=self.model_alias,
                            explanation_text=clean_text,
                            is_fallback=False,
                            generation_latency_ms=round(latency, 2),
                            sanitized=True,
                            metadata={"server_url": self.base_url},
                            generated_at=utc_now(),
                        )
        except Exception as err:
            log.info("Llama.cpp server unreachable or error (%s). Using deterministic fallback.", err)

        fallback_res = self.fallback.explain_sync(sanitized_finding)
        fallback_res.metadata["fallback_reason"] = "llamacpp_unavailable"
        return fallback_res

    async def explain(self, finding: StructuredFinding) -> LLMExplanationResult:
        sanitized_finding, _ = self.sanitizer.sanitize_finding(finding)
        prompt = self._build_prompt(sanitized_finding)
        url = f"{self.base_url}/completion"

        payload = {
            "prompt": prompt,
            "temperature": self.temperature,
            "n_predict": 1024,
            "stop": ["</assistant>", "<user>"],
        }

        t0 = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                resp = await client.post(url, json=payload)
                latency = (time.perf_counter() - t0) * 1000.0

                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data.get("content", "").strip()
                    if raw_text:
                        clean_text, _ = self.sanitizer.sanitize_text(raw_text)
                        return LLMExplanationResult(
                            finding_id=finding.finding_id,
                            provider="llamacpp",
                            model_name=self.model_alias,
                            explanation_text=clean_text,
                            is_fallback=False,
                            generation_latency_ms=round(latency, 2),
                            sanitized=True,
                            metadata={"server_url": self.base_url},
                            generated_at=utc_now(),
                        )
        except Exception as err:
            log.info("Llama.cpp server unreachable or error (%s). Using deterministic fallback.", err)

        fallback_res = self.fallback.explain_sync(sanitized_finding)
        fallback_res.metadata["fallback_reason"] = "llamacpp_unavailable"
        return fallback_res
