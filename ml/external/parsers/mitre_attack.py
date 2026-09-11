"""MITRE ATT&CK knowledge parser for ANVĪKṢA Data Layer.

Ingests MITRE enterprise tactics and techniques into the unified Attack schema.
Retains provenance and licensing terms per prompt §6, §8, and §9.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from ml.common.schemas.internal import Attack, Provenance, utc_now

# Curated high-impact offline baseline of MITRE ATT&CK techniques
STATIC_MITRE_ATTACK_SAMPLE: List[Dict[str, Any]] = [
    {
        "technique_id": "T1059.001",
        "tactic": "Execution",
        "name": "PowerShell",
        "description": "Adversaries may abuse PowerShell commands and scripts for execution.",
        "external_reference": "https://attack.mitre.org/techniques/T1059/001/",
    },
    {
        "technique_id": "T1078.004",
        "tactic": "Defense Evasion",
        "name": "Valid Accounts: Cloud Accounts",
        "description": "Adversaries may obtain and abuse credentials of existing cloud accounts.",
        "external_reference": "https://attack.mitre.org/techniques/T1078/004/",
    },
    {
        "technique_id": "T1110.003",
        "tactic": "Credential Access",
        "name": "Password Spraying",
        "description": "Adversaries may use a single or small list of commonly used passwords against many accounts.",
        "external_reference": "https://attack.mitre.org/techniques/T1110/003/",
    },
    {
        "technique_id": "T1486",
        "tactic": "Impact",
        "name": "Data Encrypted for Impact",
        "description": "Adversaries may encrypt data on target systems to interrupt availability.",
        "external_reference": "https://attack.mitre.org/techniques/T1486/",
    },
    {
        "technique_id": "T1048",
        "tactic": "Exfiltration",
        "name": "Exfiltration Over Alternative Protocol",
        "description": "Adversaries may steal data by exfiltrating it over an un-encrypted or non-standard protocol.",
        "external_reference": "https://attack.mitre.org/techniques/T1048/",
    },
]


class MitreAttackParser:
    """Parses MITRE ATT&CK data bundles into normalized Attack entities."""

    def __init__(self, license_name: str = "MIT / Terms of Use") -> None:
        self.license_name = license_name

    def parse_techniques(self, raw_list: Optional[List[Dict[str, Any]]] = None) -> List[Attack]:
        items = raw_list or STATIC_MITRE_ATTACK_SAMPLE
        attacks: List[Attack] = []

        for raw in items:
            tid = str(raw.get("technique_id", "UNKNOWN"))
            prov = Provenance(
                source="mitre_attack",
                source_record_id=tid,
                retrieved_at=utc_now(),
                source_confidence=1.0,
                license=self.license_name,
            )

            attacks.append(
                Attack(
                    attack_id=f"ATT-{tid.replace('.', '-')}",
                    technique_id=tid,
                    tactic=str(raw.get("tactic", "Unknown")),
                    name=str(raw.get("name", "")),
                    description=str(raw.get("description", "")),
                    external_reference=raw.get("external_reference"),
                    provenance=prov,
                )
            )

        return attacks
