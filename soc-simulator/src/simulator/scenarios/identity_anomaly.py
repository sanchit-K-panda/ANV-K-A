"""IDENTITY_ANOMALY — supervisor session telemetry with an identity change mid-session.

Generates login → verification → session → admin actions → anomaly → session lock.
No actual biometrics — only the telemetry a future identity subsystem consumes.
"""
from __future__ import annotations

import logging
from datetime import timedelta

from simulator.generators.telemetry import lognormal_seconds
from simulator.scenarios.base import Scenario
from simulator.schemas.entities import Event
from simulator.schemas.enums import ActionType, Severity

log = logging.getLogger(__name__)


class IdentityAnomalyScenario(Scenario):
    name = "identity_anomaly"

    def inject(self, tel) -> None:
        rng = self.rng
        soc = self.world.socs[0]
        sups = [a for a in self.world.analysts_of(soc.soc_id) if a.role == "SUPERVISOR"]
        if not sups:  # guarantee a supervisor exists for the identity scenario
            from datetime import datetime, timezone
            base = next(a for a in self.world.analysts_of(soc.soc_id))
            supervisor = type(base)(analyst_id=base.analyst_id, soc_id=base.soc_id,
                                    name=base.name, role="SUPERVISOR",
                                    skill_level=5, shift=base.shift,
                                    status=base.status, created_at=base.created_at)
            self.world.analysts = [supervisor if x.analyst_id == base.analyst_id else x
                                   for x in self.world.analysts]
        else:
            supervisor = sups[0]
        device = self.world.devices_of(soc.soc_id)[0]

        for s in range(self.cfg.identity_session_count):
            t0 = self.world.rand_time()
            analyst = supervisor if s < self.cfg.identity_session_count - 1 else supervisor
            # normal sessions: login → verify → admin action → logout
            for atype, offset in (("LOGIN", 0), ("IDENTITY_VERIFICATION", 8),
                                  ("ADMIN_ACTION", 300), ("LOGOUT", 900)):
                pass  # actions appended below in one loop
            t = t0
            for atype, delay in (("LOGIN", 0), ("IDENTITY_VERIFICATION", 10),
                                 ("ADMIN_ACTION", None), ("LOGOUT", None)):
                if delay is not None:
                    t = t0 + timedelta(seconds=delay)
                else:
                    t = t + timedelta(seconds=lognormal_seconds(rng, 240))
                tel.actions.append(type(tel.actions[0])(
                    action_id=self.world.next_id("ACT"), analyst_id=analyst.analyst_id,
                    soc_id=soc.soc_id, incident_id=None, action_type=atype,
                    timestamp=t, duration_seconds=rng.randint(5, 600),
                    metadata={"session": f"SESS-{s:04d}", "device_id": device.device_id}))

        # The anomaly: final session shows an identity change mid-session.
        anomaly_session = f"SESS-{self.cfg.identity_session_count - 1:04d}"
        sess_actions = sorted([a for a in tel.actions
                               if a.metadata.get("session") == anomaly_session],
                              key=lambda a: a.timestamp)
        mid_t = sess_actions[2].timestamp + timedelta(seconds=60)
        tel.events.append(Event(
            event_id=self.world.next_id("EV"), soc_id=soc.soc_id, timestamp=mid_t,
            event_type="identity_change", source="AUTH_SERVICE",
            device_id=device.device_id, analyst_id=supervisor.analyst_id,
            severity=Severity.CRITICAL,
            description="Face embedding mismatch during active privileged session",
            metadata={"session": anomaly_session,
                      "confidence_delta": round(rng.uniform(0.25, 0.45), 3)}))
        lock_t = mid_t + timedelta(seconds=rng.randint(10, 40))
        tel.actions.append(type(tel.actions[0])(
            action_id=self.world.next_id("ACT"), analyst_id=supervisor.analyst_id,
            soc_id=soc.soc_id, incident_id=None, action_type="SESSION_LOCK",
            timestamp=lock_t, duration_seconds=0,
            metadata={"session": anomaly_session, "reason": "IDENTITY_MISMATCH"}))

        self.gt.add(
            entity_type="session", entity_id=anomaly_session,
            expected_behaviour={"identity_stable_for_session": True},
            actual_behaviour={
                "identity_change_event": True,
                "event_at": str(mid_t.isoformat()),
                "session_locked": True, "locked_at": str(lock_t.isoformat())},
            expected_findings=["IDENTITY_ANOMALY"],
            severity=Severity.CRITICAL, start_time=sess_actions[0].timestamp,
            end_time=lock_t)
        log.info("Injected identity anomaly into session %s", anomaly_session)
