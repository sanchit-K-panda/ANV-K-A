"""Privacy and Security Sanitizer for LLM Boundary.

Guarantees that no internal IP addresses (RFC 1918), passwords, API tokens,
credentials, or PII leak outside the supervisory core.
"""
from __future__ import annotations

import copy
import ipaddress
import re
from typing import Any, Dict, List, Tuple
from inference.gateway.base import StructuredFinding

# Regular expressions for sensitive data patterns
_EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
_BEARER_TOKEN_RE = re.compile(r"(?i)\b(?:bearer\s+[a-zA-Z0-9_\-\.]{16,}|jwt\s+[a-zA-Z0-9_\-\.]{16,})\b")
_GENERIC_KEY_RE = re.compile(r"(?i)\b(?:api[_\-\s]?key|secret|password|passwd|token)[\s:=]+['\"]?([a-zA-Z0-9_\-\.]{8,})['\"]?")
_IPV4_CANDIDATE_RE = re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b")
_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")


class SecuritySanitizer:
    """Sanitizes text and structured payloads prior to LLM submission."""

    def __init__(self) -> None:
        self._ip_token_map: Dict[str, str] = {}
        self._ip_counter = 0

    def _get_ip_placeholder(self, ip_str: str) -> str:
        if ip_str not in self._ip_token_map:
            self._ip_counter += 1
            self._ip_token_map[ip_str] = f"[INTERNAL_IP_{self._ip_counter}]"
        return self._ip_token_map[ip_str]

    def is_private_ip(self, ip_str: str) -> bool:
        """Determines if an IPv4 address belongs to RFC 1918 or loopback space."""
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            return ip_obj.is_private or ip_obj.is_loopback
        except ValueError:
            return False

    def sanitize_text(self, text: str) -> Tuple[str, Dict[str, int]]:
        """Sanitizes raw text, replacing sensitive patterns with safe placeholders."""
        counts = {
            "internal_ips": 0,
            "emails": 0,
            "secrets": 0,
            "ssns": 0,
        }

        # 1. Replace emails
        def _replace_email(m: re.Match) -> str:
            counts["emails"] += 1
            return "[REDACTED_EMAIL]"

        text = _EMAIL_RE.sub(_replace_email, text)

        # 2. Replace SSNs
        def _replace_ssn(m: re.Match) -> str:
            counts["ssns"] += 1
            return "[REDACTED_SSN]"

        text = _SSN_RE.sub(_replace_ssn, text)

        # 3. Replace credentials / keys / bearer tokens
        def _replace_bearer(m: re.Match) -> str:
            counts["secrets"] += 1
            return "[REDACTED_BEARER_TOKEN]"

        text = _BEARER_TOKEN_RE.sub(_replace_bearer, text)

        def _replace_key(m: re.Match) -> str:
            counts["secrets"] += 1
            matched = m.group(0)
            secret_val = m.group(1)
            return matched.replace(secret_val, "[REDACTED_SECRET]")

        text = _GENERIC_KEY_RE.sub(_replace_key, text)

        # 4. Replace private/internal IPs only (preserves external threat IOCs)
        def _replace_ip(m: re.Match) -> str:
            ip_cand = m.group(0)
            if self.is_private_ip(ip_cand):
                counts["internal_ips"] += 1
                return self._get_ip_placeholder(ip_cand)
            return ip_cand

        text = _IPV4_CANDIDATE_RE.sub(_replace_ip, text)

        return text, counts

    def sanitize_obj(self, obj: Any) -> Tuple[Any, Dict[str, int]]:
        """Recursively sanitizes dicts, lists, and primitives."""
        total_counts = {"internal_ips": 0, "emails": 0, "secrets": 0, "ssns": 0}

        def _merge(c: Dict[str, int]) -> None:
            for k, v in c.items():
                total_counts[k] += v

        if isinstance(obj, str):
            clean_str, c = self.sanitize_text(obj)
            _merge(c)
            return clean_str, total_counts
        elif isinstance(obj, dict):
            clean_dict = {}
            for k, v in obj.items():
                # Check for sensitive keys
                k_lower = str(k).lower()
                if any(sec in k_lower for sec in ["password", "secret", "token", "auth_header"]):
                    clean_dict[k] = "[REDACTED_SECRET]"
                    total_counts["secrets"] += 1
                else:
                    clean_v, c = self.sanitize_obj(v)
                    _merge(c)
                    clean_dict[k] = clean_v
            return clean_dict, total_counts
        elif isinstance(obj, list):
            clean_list = []
            for item in obj:
                clean_item, c = self.sanitize_obj(item)
                _merge(c)
                clean_list.append(clean_item)
            return clean_list, total_counts
        else:
            return obj, total_counts

    def sanitize_finding(self, finding: StructuredFinding) -> Tuple[StructuredFinding, Dict[str, int]]:
        """Creates a fully sanitized copy of a StructuredFinding."""
        data = copy.deepcopy(finding.model_dump())
        sanitized_data, counts = self.sanitize_obj(data)
        return StructuredFinding(**sanitized_data), counts
