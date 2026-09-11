"""CISA Known Exploited Vulnerabilities (KEV) parser for ANVĪKṢA Data Layer."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from ml.common.schemas.internal import Provenance, Vulnerability, utc_now

STATIC_CISA_KEV_SAMPLE: List[Dict[str, Any]] = [
    {
        "cve_id": "CVE-2023-34362",
        "vendor_project": "Progress",
        "product": "MOVEit Transfer",
        "description": "Progress MOVEit Transfer SQL Injection Vulnerability",
        "cvss_score": 9.8,
        "epss_score": 0.94,
        "known_exploited": True,
        "published_at": "2023-06-02T00:00:00Z",
    },
    {
        "cve_id": "CVE-2024-21887",
        "vendor_project": "Ivanti",
        "product": "Connect Secure and Policy Secure",
        "description": "Ivanti Connect Secure and Policy Secure Command Injection Vulnerability",
        "cvss_score": 9.1,
        "epss_score": 0.88,
        "known_exploited": True,
        "published_at": "2024-01-12T00:00:00Z",
    },
    {
        "cve_id": "CVE-2021-44228",
        "vendor_project": "Apache",
        "product": "Log4j",
        "description": "Apache Log4j2 Remote Code Execution Vulnerability (Log4Shell)",
        "cvss_score": 10.0,
        "epss_score": 0.97,
        "known_exploited": True,
        "published_at": "2021-12-10T00:00:00Z",
    },
]


class CisaKevParser:
    """Parses CISA KEV catalog entries into internal Vulnerability schemas."""

    def __init__(self, license_name: str = "US Government Public Domain") -> None:
        self.license_name = license_name

    def parse_catalog(self, raw_list: Optional[List[Dict[str, Any]]] = None) -> List[Vulnerability]:
        items = raw_list or STATIC_CISA_KEV_SAMPLE
        vulns: List[Vulnerability] = []

        for raw in items:
            cve_id = str(raw.get("cve_id", "CVE-UNKNOWN")).upper()
            pub_str = raw.get("published_at")
            pub_dt = (
                datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
                if pub_str
                else None
            )

            prov = Provenance(
                source="cisa_kev",
                source_record_id=cve_id,
                retrieved_at=utc_now(),
                source_confidence=1.0,
                license=self.license_name,
            )

            vulns.append(
                Vulnerability(
                    cve_id=cve_id,
                    cvss_score=float(raw.get("cvss_score", 7.5)),
                    epss_score=float(raw.get("epss_score", 0.5)),
                    known_exploited=bool(raw.get("known_exploited", True)),
                    description=str(raw.get("description", "")),
                    published_at=pub_dt,
                    provenance=prov,
                )
            )

        return vulns
