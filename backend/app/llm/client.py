"""Local HTTP client for the air-gapped Ollama service."""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional, Tuple

import httpx
from app.core.config import settings
from app.llm.exceptions import (
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaTimeoutError,
)

log = logging.getLogger(__name__)


class OllamaClient:
    """Communicates with the locally hosted Ollama daemon on localhost / 127.0.0.1."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        default_model: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.default_model = default_model or settings.OLLAMA_MODEL
        self.timeout_seconds = timeout_seconds or settings.OLLAMA_TIMEOUT_SECONDS

    async def check_health(self) -> Tuple[bool, List[str]]:
        """Checks if the local Ollama daemon is reachable and lists installed models."""
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
                    return True, models
                log.warning("Ollama health check returned status %d", resp.status_code)
                return False, []
        except (httpx.ConnectError, httpx.ConnectTimeout) as err:
            log.info("Ollama is not running locally at %s: %s", self.base_url, err)
            return False, []
        except Exception as err:
            log.warning("Ollama health check failed with unexpected error: %s", err)
            return False, []

    async def generate(
        self,
        prompt: str,
        system: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Tuple[str, float]:
        """Calls /api/generate on the local Ollama endpoint with strict timeout and measurement."""
        target_model = model or self.default_model
        url = f"{self.base_url}/api/generate"

        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {
                "temperature": temperature,
                "top_p": 0.9,
                "num_predict": 768,
                "num_ctx": 2048,
            },
        }

        start_time = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                resp = await client.post(url, json=payload)
                duration_ms = (time.perf_counter() - start_time) * 1000.0

                if resp.status_code == 404:
                    raise OllamaModelNotFoundError(
                        f"Model '{target_model}' not found in local Ollama instance."
                    )
                elif resp.status_code != 200:
                    raise OllamaConnectionError(
                        f"Ollama returned HTTP error {resp.status_code}: {resp.text}"
                    )

                result_json = resp.json()
                raw_response = result_json.get("response", "")
                return raw_response, duration_ms

        except httpx.TimeoutException as err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            log.warning("Ollama request timed out after %.1fs for model %s", self.timeout_seconds, target_model)
            raise OllamaTimeoutError(
                f"Ollama generation timed out after {self.timeout_seconds} seconds."
            ) from err
        except (httpx.ConnectError, httpx.ConnectTimeout) as err:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            log.warning("Cannot connect to local Ollama at %s: %s", self.base_url, err)
            raise OllamaConnectionError(
                f"Cannot connect to local Ollama daemon at {self.base_url}."
            ) from err
