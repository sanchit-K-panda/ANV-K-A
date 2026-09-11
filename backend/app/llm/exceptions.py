"""Exceptions for the ANVĪKṢA local LLM subsystem."""
from __future__ import annotations


class LLMException(Exception):
    """Base exception for LLM operations."""
    pass


class OllamaConnectionError(LLMException):
    """Raised when Ollama daemon cannot be reached at configured host/port."""
    pass


class OllamaTimeoutError(LLMException):
    """Raised when an inference request to Ollama exceeds configured timeout."""
    pass


class OllamaModelNotFoundError(LLMException):
    """Raised when the configured model is not installed or available in Ollama."""
    pass


class InvalidLLMResponseError(LLMException):
    """Raised when LLM response is malformed or cannot be parsed into the expected schema."""
    pass


class PromptInjectionDetectedError(LLMException):
    """Raised when untrusted input contains explicit prompt injection indicators."""
    pass
