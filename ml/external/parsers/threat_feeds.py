"""External Threat Feed Parser for ANVĪKṢA Data Layer.

Parses threat intelligence feeds (URLhaus, ThreatFox, PhishTank) into
normalized Indicator and Threat entities, maintaining provenance and licensing.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

from ml.common.normalization.indicators import (
    defang_ioc,
    detect_indicator_type,
    refang_ioc,
)
from ml.common.schemas.internal import (
    Indicator,
    IndicatorType,
    Provenance,
    SeverityLevel,
    Threat,
    utc_now,
)

# Curated offline static samples for URLhaus (CC0)
STATIC_URLHAUS_SAMPLE: List[Dict[str, Any]] = [
    {
        "id": "2738910",
        "url": "http://185.196.8.156/bin.sh",
        "url_status": "online",
        "threat": "malware_download",
        "tags": ["elf", "mirai", "dropper"],
        "date_added": "2024-03-01T12:00:00Z",
        "reporter": "abuse_ch",
    },
    {
        "id": "2738911",
        "url": "https://pastebin.com/raw/malicious_payload",
        "url_status": "offline",
        "threat": "malware_download",
        "tags": ["stealer", "payload"],
        "date_added": "2024-03-01T12:30:00Z",
        "reporter": "security_researcher",
    },
]

# Curated offline static samples for ThreatFox (CC0)
STATIC_THREATFOX_SAMPLE: List[Dict[str, Any]] = [
    {
        "id": "981240",
        "ioc": "194.87.139.18:443",
        "ioc_type": "ip:port",
        "threat_type": "botnet_cc",
        "malware": "cobalt_strike",
        "confidence_level": 85,
        "first_seen": "2024-03-01T10:00:00Z",
        "tags": ["CobaltStrike", "c2"],
    },
    {
        "id": "981241",
        "ioc": "275a507da676e10f3c5b5aa771c50ee6be3be34b3f88998bc19d36181f08c5e0",
        "ioc_type": "sha256_hash",
        "threat_type": "payload",
        "malware": "redline_stealer",
        "confidence_level": 100,
        "first_seen": "2024-03-01T11:15:00Z",
        "tags": ["RedLine", "stealer"],
    },
]


class ThreatFeedParser:
    """Parses external threat intelligence feeds into unified Indicator and Threat schemas."""

    def __init__(self) -> None:
        self._seen_indicators: Set[Tuple[str, str]] = set()

    def parse_urlhaus(
        self,
        raw_list: Optional[List[Dict[str, Any]]] = None,
        license_name: str = "CC0 1.0 Universal",
    ) -> Tuple[List[Indicator], List[Threat]]:
        """Parses URLhaus feed items into Indicators and associated Threats."""
        items = raw_list if raw_list is not None else STATIC_URLHAUS_SAMPLE
        indicators: List[Indicator] = []
        threats: List[Threat] = []

        for raw in items:
            record_id = str(raw.get("id", "URLHAUS-UNKNOWN"))
            raw_url = str(raw.get("url", ""))
            if not raw_url:
                continue

            ioc_type, cleaned_val = detect_indicator_type(raw_url)
            if ioc_type == IndicatorType.UNKNOWN:
                ioc_type = IndicatorType.URL

            dedup_key = (ioc_type.value, cleaned_val)
            if dedup_key in self._seen_indicators:
                continue
            self._seen_indicators.add(dedup_key)

            date_str = raw.get("date_added")
            date_dt = (
                datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                if date_str
                else utc_now()
            )

            threat_name = str(raw.get("threat", "Malware Hosting"))
            threat_id = f"THREAT-URLHAUS-{record_id}"

            prov = Provenance(
                source="urlhaus",
                source_record_id=record_id,
                retrieved_at=utc_now(),
                event_timestamp=date_dt,
                source_confidence=0.90,
                license=license_name,
            )

            threat_obj = Threat(
                threat_id=threat_id,
                name=threat_name.replace("_", " ").title(),
                category="MALWARE_DELIVERY",
                severity=SeverityLevel.HIGH,
                mitre_techniques=["T1204", "T1105"],
                first_seen=date_dt,
                last_seen=date_dt,
                status="ACTIVE" if raw.get("url_status") == "online" else "MITIGATED",
                provenance=prov,
            )
            threats.append(threat_obj)

            tags = [str(t) for t in raw.get("tags", [])]
            indicator_obj = Indicator(
                indicator_id=f"IOC-UH-{record_id}",
                value=defang_ioc(cleaned_val),
                indicator_type=ioc_type,
                threat_ids=[threat_id],
                context={
                    "url_status": raw.get("url_status", "unknown"),
                    "reporter": raw.get("reporter", "unknown"),
                    "raw_threat": threat_name,
                },
                tags=tags,
                provenance=prov,
            )
            indicators.append(indicator_obj)

        return indicators, threats

    def parse_threatfox(
        self,
        raw_list: Optional[List[Dict[str, Any]]] = None,
        license_name: str = "CC0 1.0 Universal",
    ) -> Tuple[List[Indicator], List[Threat]]:
        """Parses ThreatFox feed items into Indicators and associated Threats."""
        items = raw_list if raw_list is not None else STATIC_THREATFOX_SAMPLE
        indicators: List[Indicator] = []
        threats: List[Threat] = []

        for raw in items:
            record_id = str(raw.get("id", "TF-UNKNOWN"))
            raw_ioc = str(raw.get("ioc", ""))
            if not raw_ioc:
                continue

            # Strip port if present for IP identification
            ioc_clean = raw_ioc.split(":")[0] if ":" in raw_ioc and not raw_ioc.startswith("http") and len(raw_ioc.split(":")) == 2 else raw_ioc
            ioc_type, cleaned_val = detect_indicator_type(ioc_clean)

            dedup_key = (ioc_type.value, cleaned_val)
            if dedup_key in self._seen_indicators:
                continue
            self._seen_indicators.add(dedup_key)

            confidence = float(raw.get("confidence_level", 80)) / 100.0
            date_str = raw.get("first_seen")
            date_dt = (
                datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                if date_str
                else utc_now()
            )

            malware_name = str(raw.get("malware", "Unknown Malware")).replace("_", " ").title()
            threat_type = str(raw.get("threat_type", "c2")).upper()
            threat_id = f"THREAT-TF-{record_id}"

            prov = Provenance(
                source="threatfox",
                source_record_id=record_id,
                retrieved_at=utc_now(),
                event_timestamp=date_dt,
                source_confidence=min(1.0, max(0.1, confidence)),
                license=license_name,
            )

            threat_obj = Threat(
                threat_id=threat_id,
                name=f"{malware_name} ({threat_type})",
                category=threat_type,
                severity=SeverityLevel.CRITICAL if confidence > 0.85 else SeverityLevel.HIGH,
                mitre_techniques=["T1071"],
                first_seen=date_dt,
                last_seen=date_dt,
                status="ACTIVE",
                provenance=prov,
            )
            threats.append(threat_obj)

            tags = [str(t) for t in raw.get("tags", [])]
            indicator_obj = Indicator(
                indicator_id=f"IOC-TF-{record_id}",
                value=defang_ioc(raw_ioc),
                indicator_type=ioc_type,
                threat_ids=[threat_id],
                context={
                    "malware": malware_name,
                    "threat_type": threat_type,
                    "confidence": confidence,
                },
                tags=tags,
                provenance=prov,
            )
            indicators.append(indicator_obj)

        return indicators, threats
