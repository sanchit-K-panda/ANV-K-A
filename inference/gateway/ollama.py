"""Ollama Inference Gateway for ANVĪKṢA.

Connects to local DeepSeek-R1 8B instance via Ollama REST API.
Enforces air-gapped execution, input sanitization, and seamless fallback.
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

SYSTEM_PROMPT = """You are ANVĪKṢA's Supervisory Explainability Engine (PRATYAYA).
Your role is to explain statistical and behavioral deviations detected by the supervisory layer in a Security Operations Center (SOC).

CRITICAL BOUNDARIES:
1. You are strictly an EXPLANATION SYNTHESIZER. You are NEVER the source of detection truth.
2. Rely strictly on the provided structured metrics, baseline deviations, and evidence references.
3. DO NOT hallucinate fake alert IDs, fictitious malware families, or imaginary attack steps.
4. Structure your response into exactly these 7 PRATYAYA sections:
   - WHAT: Exact nature of the observed behavioural deviation.
   - WHY: Key metrics driving the deviation from healthy baseline medians.
   - WHEN: The precise temporal window.
   - WHERE: The analyst or SOC entity involved.
   - EVIDENCE: Observed quantitative metrics vs baseline.
   - CONFIDENCE: Assessment of detection reliability based on the anomaly score.
   - RECOMMENDATION: Concrete supervisory remediation steps.
"""


class OllamaGateway(BaseLLMGateway):
    """Integrates local Ollama daemon hosting DeepSeek-R1 8B."""

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:11434",
        model_name: str = "deepseek-r1:8b",
        timeout_seconds: float = 30.0,
        temperature: float = 0.2,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds
        self.temperature = temperature
        self.sanitizer = SecuritySanitizer()
        self.fallback = DeterministicFallbackGateway()

    def _build_user_prompt(self, finding: StructuredFinding) -> str:
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
            "features_snapshot": {k: round(v, 2) for k, v in list(finding.features.items())[:6]},
            "evidence_refs": finding.evidence_refs[:5],
        }
        return (
            f"Synthesize a supervisory assessment report for this detection finding:\n\n"
            f"```json\n{json.dumps(payload, indent=2)}\n```\n\n"
            f"Follow the 7-part PRATYAYA structure strictly."
        )

    def explain_sync(self, finding: StructuredFinding) -> LLMExplanationResult:
        """Synchronously calls Ollama or triggers deterministic fallback on error."""
        sanitized_finding, _ = self.sanitizer.sanitize_finding(finding)
        user_prompt = self._build_user_prompt(sanitized_finding)
        url = f"{self.base_url}/api/generate"

        payload = {
            "model": self.model_name,
            "prompt": user_prompt,
            "system": SYSTEM_PROMPT,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "top_p": 0.9,
                "num_predict": 1024,
            },
        }

        t0 = time.perf_counter()
        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.post(url, json=payload)
                latency = (time.perf_counter() - t0) * 1000.0

                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data.get("response", "").strip()
                    if raw_text:
                        clean_text, _ = self.sanitizer.sanitize_text(raw_text)
                        return LLMExplanationResult(
                            finding_id=finding.finding_id,
                            provider="ollama",
                            model_name=self.model_name,
                            explanation_text=clean_text,
                            is_fallback=False,
                            generation_latency_ms=round(latency, 2),
                            sanitized=True,
                            metadata={"ollama_url": self.base_url},
                            generated_at=utc_now(),
                        )
        except Exception as err:
            log.info("Ollama unreachable or returned error (%s). Falling back to deterministic engine.", err)

        # Seamless fallback
        fallback_res = self.fallback.explain_sync(sanitized_finding)
        fallback_res.metadata["fallback_reason"] = "ollama_unavailable"
        return fallback_res

    async def explain(self, finding: StructuredFinding) -> LLMExplanationResult:
        """Asynchronously calls Ollama or triggers deterministic fallback on error."""
        sanitized_finding, _ = self.sanitizer.sanitize_finding(finding)
        user_prompt = self._build_user_prompt(sanitized_finding)
        url = f"{self.base_url}/api/generate"

        payload = {
            "model": self.model_name,
            "prompt": user_prompt,
            "system": SYSTEM_PROMPT,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "top_p": 0.9,
                "num_predict": 1024,
            },
        }

        t0 = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                resp = await client.post(url, json=payload)
                latency = (time.perf_counter() - t0) * 1000.0

                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data.get("response", "").strip()
                    if raw_text:
                        clean_text, _ = self.sanitizer.sanitize_text(raw_text)
                        return LLMExplanationResult(
                            finding_id=finding.finding_id,
                            provider="ollama",
                            model_name=self.model_name,
                            explanation_text=clean_text,
                            is_fallback=False,
                            generation_latency_ms=round(latency, 2),
                            sanitized=True,
                            metadata={"ollama_url": self.base_url},
                            generated_at=utc_now(),
                        )
        except Exception as err:
            log.info("Ollama unreachable or returned error (%s). Falling back to deterministic engine.", err)

        fallback_res = self.fallback.explain_sync(sanitized_finding)
        fallback_res.metadata["fallback_reason"] = "ollama_unavailable"
        return fallback_res
