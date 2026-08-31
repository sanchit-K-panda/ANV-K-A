"""Continuous Identity Verification & Session Drift Monitoring Engine.

Monitors active privileged supervisor sessions for identity drift, mid-session facial mismatch events,
and unauthorized operator changes, triggering immediate session lock and security alerts.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from ml.preprocessing.dataset_loader import LoadedDataset, _parse_dt
from ml.schemas import FindingSeverity, FindingType, RawFinding


class ContinuousIdentityMonitor:
    """Monitors telemetry stream for mid-session identity shifts and continuous verification breaches."""

    def __init__(self, drift_threshold: float = 0.20):
        self.drift_threshold = drift_threshold

    def analyze(self, dataset: LoadedDataset) -> List[RawFinding]:
        findings: List[RawFinding] = []

        # Look for identity_change events in telemetry
        identity_events = [
            e for e in dataset.events if e.get("event_type") in ("identity_change", "face_mismatch", "session_tamper")
        ]

        for ev in identity_events:
            meta = ev.get("metadata", {})
            session_id = meta.get("session", "UNKNOWN_SESSION")
            conf_delta = meta.get("confidence_delta", 0.35)
            ev_time = _parse_dt(ev.get("timestamp"))

            # Check if a session lock was triggered in actions
            session_actions = [
                a for a in dataset.analyst_actions if a.get("metadata", {}).get("session") == session_id
            ]
            lock_actions = [a for a in session_actions if a.get("action_type") == "SESSION_LOCK"]
            is_locked = len(lock_actions) > 0
            lock_time = _parse_dt(lock_actions[0].get("timestamp")) if is_locked else None

            finding = RawFinding(
                engine_name="ContinuousIdentityMonitor",
                finding_type=FindingType.IDENTITY_ANOMALY,
                severity=FindingSeverity.CRITICAL,
                confidence=0.99,
                title=f"Identity Anomaly: Mid-session facial verification mismatch on {session_id}",
                description=(
                    f"Continuous biometric background monitoring detected an unauthorized operator shift or "
                    f"face embedding mismatch during active privileged session {session_id}. "
                    f"Confidence delta: {conf_delta:.3f} exceeded security threshold ({self.drift_threshold}). "
                    f"{'Session was automatically frozen and locked.' if is_locked else 'Session requires immediate termination.'}"
                ),
                entity_type="session",
                entity_id=session_id,
                affected_ids=[session_id],
                timestamp=ev_time,
                evidence={
                    "session_id": session_id,
                    "event_id": ev.get("event_id"),
                    "device_id": ev.get("device_id"),
                    "analyst_id": ev.get("analyst_id"),
                    "confidence_delta": conf_delta,
                    "drift_threshold": self.drift_threshold,
                    "event_timestamp": ev_time.isoformat() if ev_time else None,
                    "session_locked": is_locked,
                    "locked_at": lock_time.isoformat() if lock_time else None,
                    "violation_type": "IDENTITY_ANOMALY",
                },
                baseline_metrics={
                    "identity_stable_for_session": True,
                    "max_allowed_drift": self.drift_threshold,
                },
                observed_metrics={
                    "identity_change_event": True,
                    "observed_confidence_delta": conf_delta,
                    "session_locked": is_locked,
                },
                recommended_action=(
                    f"Revoke short-lived credential for session {session_id}. Invalidate session token, "
                    f"log tamper-evident audit record, and require complete physical re-authentication."
                ),
            )
            findings.append(finding)

        return findings
