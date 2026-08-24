"""World generator: creates the static SOC population (socs, analysts, devices, assets, threats)."""
from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from ipaddress import IPv4Address

from simulator.config import SimConfig
from simulator.schemas.entities import (
    Analyst, Asset, Device, Soc, Threat,
)
from simulator.schemas.enums import (
    AnalystRole, AssetType, Criticality, DeviceType, Severity, Shift,
)

FIRST_NAMES = ["Aarav", "Priya", "Chen", "Maria", "Yusuf", "Elena", "Ravi", "Sara", "Tomas",
               "Mei", "Kwame", "Ingrid", "Omar", "Lucia", "Dev", "Anika", "Viktor", "Nadia"]
LAST_NAMES = ["Sharma", "Okafor", "Kim", "Petrov", "Silva", "Haddad", "Novak", "Iyer",
              "Costa", "Zhang", "Mensah", "Larsen", "Farouk", "Moreno", "Patel", "Weber"]

BUSINESS_UNITS = ["Finance", "Engineering", "HR", "Operations", "Sales", "Research"]
OS_LIST = ["Ubuntu 22.04", "Windows Server 2022", "RHEL 9", "Windows 11", "Debian 12", "macOS 14"]
THREAT_CATEGORIES = ["Malware", "Phishing", "Ransomware", "C2", "Credential Theft",
                     "Data Exfiltration", "Web Attack", "Insider Threat", "Brute Force"]
MITRE_TECHNIQUES = ["T1566.001", "T1059.001", "T1078", "T1486", "T1041", "T1110.001",
                    "T1190", "T1053.005", "T1003.001", "T1021.002"]


def _ip(rng: random.Random) -> str:
    return str(IPv4Address(rng.getrandbits(32)))


class World:
    """Static SOC population plus ID counters and shared RNG state."""

    def __init__(self, cfg: SimConfig, rng: random.Random, start: datetime):
        self.cfg = cfg
        self.rng = rng
        self.start = start
        self.end = start + timedelta(days=cfg.window_days)
        self.socs: list[Soc] = []
        self.analysts: list[Analyst] = []
        self.devices: list[Device] = []
        self.assets: list[Asset] = []
        self.threats: list[Threat] = []
        self._counters: dict[str, int] = {}

    def next_id(self, prefix: str) -> str:
        n = self._counters.get(prefix, 0) + 1
        self._counters[prefix] = n
        return f"{prefix}-{n:05d}"

    def rand_time(self) -> datetime:
        """Random timestamp within the simulation window."""
        secs = self.rng.uniform(0, (self.end - self.start).total_seconds())
        return self.start + timedelta(seconds=secs)

    # -- population -------------------------------------------------------
    def build(self) -> None:
        cfg, rng = self.cfg, self.rng
        created = self.start - timedelta(days=365)
        for s in range(cfg.soc_count):
            soc_id = f"SOC-{s + 1:03d}"
            self.socs.append(Soc(
                soc_id=soc_id, name=f"SOC {chr(65 + s)}", environment="PRODUCTION",
                location=rng.choice(["Bengaluru, IN", "Delhi, IN", "Mumbai, IN"]),
                timezone="Asia/Kolkata", status="ACTIVE", created_at=created))
            for _ in range(rng.randint(cfg.analysts_per_soc_min, cfg.analysts_per_soc_max)):
                self.analysts.append(Analyst(
                    analyst_id=self.next_id("AN"), soc_id=soc_id,
                    name=f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}",
                    role=(role := rng.choices(
                        [AnalystRole.TIER1, AnalystRole.TIER2, AnalystRole.TIER3,
                         AnalystRole.SUPERVISOR], [55, 28, 13, 4])[0]),
                    skill_level={"TIER1": rng.randint(1, 2), "TIER2": rng.randint(2, 4),
                                 "TIER3": rng.randint(3, 5), "SUPERVISOR": 5}[role],
                    shift=Shift(rng.choice(list(Shift))), created_at=created))
            for d in range(cfg.devices_per_soc):
                dtype = DeviceType(rng.choice(list(DeviceType)))
                self.devices.append(Device(
                    device_id=self.next_id("DEV"), soc_id=soc_id,
                    hostname=f"{soc_id}-{dtype.value.lower()}-{d:02d}", device_type=dtype,
                    ip_address=_ip(rng), os=OS_LIST[d % len(OS_LIST)],
                    criticality=rng.choice(list(Criticality))))
            for a in range(rng.randint(cfg.assets_per_soc_min, cfg.assets_per_soc_max)):
                atype = AssetType(rng.choice(list(AssetType)))
                self.assets.append(Asset(
                    asset_id=self.next_id("ASSET"), soc_id=soc_id,
                    hostname=f"{atype.value.lower().replace('_', '-')}-{a:04d}",
                    asset_type=atype, ip_address=_ip(rng),
                    criticality=rng.choices(list(Criticality), [10, 20, 40, 30])[0],
                    business_unit=rng.choice(BUSINESS_UNITS),
                    owner=f"owner-{rng.randint(1, 40)}@corp.internal"))
        for t in range(cfg.threats_per_run):
            first = self.rand_time()
            sev = rng.choices(list(Severity), weights=list(self.cfg.severity_weights))[0]
            self.threats.append(Threat(
                threat_id=self.next_id("THR"),
                name=f"{rng.choice(THREAT_CATEGORIES)}.{rng.randint(100, 999)}",
                category=rng.choice(THREAT_CATEGORIES),
                severity=sev if sev != Severity.INFO else Severity.LOW,
                mitre_techniques=rng.sample(MITRE_TECHNIQUES, k=rng.randint(1, 3)),
                first_seen=first, last_seen=min(first + timedelta(hours=rng.uniform(1, 200)), self.end),
                status="ACTIVE"))

    def analysts_of(self, soc_id: str) -> list[Analyst]:
        return [a for a in self.analysts if a.soc_id == soc_id]

    def assets_of(self, soc_id: str) -> list[Asset]:
        return [a for a in self.assets if a.soc_id == soc_id]

    def devices_of(self, soc_id: str) -> list[Device]:
        return [d for d in self.devices if d.soc_id == soc_id]
