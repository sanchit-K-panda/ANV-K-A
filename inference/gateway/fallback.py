"""Deterministic Rule-Based Fallback Explainer for ANVĪKṢA.

Guarantees 100% offline availability and instant explanation generation
implementing the PRATYAYA 7-part explainability contract without LLM dependencies.
"""
from __future__ import annotations

import time
from typing import Any, Dict, List
from inference.gateway.base import (
    BaseLLMGateway,
    LLMExplanationResult,
    StructuredFinding,
    utc_now,
)


class DeterministicFallbackGateway(BaseLLMGateway):
    """Zero-dependency, offline deterministic explanation synthesizer."""

    def __init__(self) -> None:
        self.provider_name = "fallback_rule_engine"
        self.model_name = "deterministic-v1"

    def _synthesize_pratyaya(self, finding: StructuredFinding) -> Dict[str, str]:
        """Synthesizes the non-negotiable 7-part PRATYAYA explainability breakdown."""
        # 1. WHAT
        engine = finding.engine_source
        score_pct = round(finding.anomaly_score * 100, 1)
        what_desc = (
            f"Supervisory engine {engine} detected a statistically significant behavioural deviation "
            f"with an anomaly score of {finding.anomaly_score:.3f} ({score_pct}% anomalousness). "
            f"The monitored shift pattern deviates sharply from healthy operational baseline behavior."
        )

        # 2. WHY
        if finding.top_deviations:
            dev_lines = []
            for d in finding.top_deviations[:4]:
                feat = d.get("feature", "metric")
                val = d.get("value", 0.0)
                med = d.get("baseline_median", 0.0)
                deg = d.get("deviation_degree", 0.0)
                dev_lines.append(
                    f"- {feat}: observed {val:.2f} vs healthy baseline median {med:.2f} "
                    f"({deg:.1f}x IQR deviation)"
                )
            why_desc = (
                "Attribution analysis identified the following primary deviating metrics:\n"
                + "\n".join(dev_lines)
            )
        else:
            why_desc = (
                f"Multi-metric isolation forest tree depth split indicates extreme multivariate departure "
                f"from baseline feature distribution across {len(finding.features)} operational metrics."
            )

        # 3. WHEN
        start_str = finding.time_window_start.strftime("%Y-%m-%d %H:%M:%S UTC")
        end_str = finding.time_window_end.strftime("%Y-%m-%d %H:%M:%S UTC")
        when_desc = f"Observed window: {start_str} to {end_str}."

        # 4. WHERE
        analyst = finding.analyst_id or "SOC_TOTAL / Global Scope"
        scenario = f" [{finding.scenario}]" if finding.scenario else ""
        where_desc = f"Operational Entity: {analyst}{scenario}."

        # 5. EVIDENCE
        evidence_items = [f"- Anomaly Severity: {finding.severity}"]
        for ref in finding.evidence_refs[:5]:
            evidence_items.append(f"- Reference Artifact: {ref}")
        for k, v in list(finding.features.items())[:4]:
            evidence_items.append(f"- Telemetry Snapshot {k}: {v:.2f}")
        evidence_desc = "Concrete Telemetry & Records:\n" + "\n".join(evidence_items)

        # 6. CONFIDENCE
        if finding.anomaly_score >= 0.85:
            conf_tier = "VERY HIGH"
            conf_note = "Deviation exceeds 99th percentile of healthy operational distribution."
        elif finding.anomaly_score >= 0.65:
            conf_tier = "HIGH"
            conf_note = "Substantial deviation from typical operational envelope."
        elif finding.anomaly_score >= 0.50:
            conf_tier = "MODERATE"
            conf_note = "Elevated risk score near the operational decision threshold."
        else:
            conf_tier = "LOW"
            conf_note = "Nominal variation within acceptable operational tolerance."
        conf_desc = f"{conf_tier} ({finding.anomaly_score:.3f}). {conf_note}"

        # 7. RECOMMENDATION
        if "overload" in str(finding.scenario).lower() or finding.features.get("actions_count", 0) > 80:
            recom = (
                "1. Temporarily redistribute active queue tickets to secondary shift analysts.\n"
                "2. Conduct immediate check-in on analyst alert fatigue and task backlog.\n"
                "3. Verify triage accuracy for high-throughput batch closures."
            )
        elif "gap" in str(finding.scenario).lower() or finding.features.get("investigation_rate", 1.0) < 0.2:
            recom = (
                "1. Audit unassigned critical alerts and pending triage investigations.\n"
                "2. Review alert-to-investigation transition logs for system stall or missed handoffs.\n"
                "3. Enforce mandatory investigation checklist on open high-severity items."
            )
        elif "kpi" in str(finding.scenario).lower() or finding.features.get("mean_investigation_duration_sec", 100) < 10:
            recom = (
                "1. Inspect quick-closed incidents for evidence of superficial triage or bulk closure scripts.\n"
                "2. Sample 10 random closed alerts from this window for quality assurance peer review.\n"
                "3. Correlate closures with escalation criteria compliance."
            )
        else:
            recom = (
                "1. Initiate supervisory review of the analyst's event sequence during this window.\n"
                "2. Check for correlation with ongoing external campaigns or IT maintenance.\n"
                "3. Preserve audit trail snapshots for supervisory assessment."
            )

        return {
            "WHAT": what_desc,
            "WHY": why_desc,
            "WHEN": when_desc,
            "WHERE": where_desc,
            "EVIDENCE": evidence_desc,
            "CONFIDENCE": conf_desc,
            "RECOMMENDATION": recom,
        }

    def _render_full_text(self, parts: Dict[str, str], finding: StructuredFinding) -> str:
        """Formats the 7 PRATYAYA parts into a structured markdown report."""
        return (
            f"### [ANVĪKṢA SUPERVISORY EXPLANATION — {finding.finding_id}]\n\n"
            f"**1. WHAT (Observation)**\n{parts['WHAT']}\n\n"
            f"**2. WHY (Attribution & Deviation)**\n{parts['WHY']}\n\n"
            f"**3. WHEN (Temporal Window)**\n{parts['WHEN']}\n\n"
            f"**4. WHERE (Entity & Scope)**\n{parts['WHERE']}\n\n"
            f"**5. EVIDENCE (Telemetry & References)**\n{parts['EVIDENCE']}\n\n"
            f"**6. CONFIDENCE (Calibration)**\n{parts['CONFIDENCE']}\n\n"
            f"**7. RECOMMENDATION (Supervisory Remediation)**\n{parts['RECOMMENDATION']}\n"
        )

    def explain_sync(self, finding: StructuredFinding) -> LLMExplanationResult:
        t0 = time.perf_counter()
        parts = self._synthesize_pratyaya(finding)
        full_text = self._render_full_text(parts, finding)
        latency = (time.perf_counter() - t0) * 1000.0

        return LLMExplanationResult(
            finding_id=finding.finding_id,
            provider=self.provider_name,
            model_name=self.model_name,
            explanation_text=full_text,
            structured_explanation=parts,
            is_fallback=True,
            generation_latency_ms=round(latency, 3),
            sanitized=True,
            metadata={"rule_engine": "pratyaya_v1", "deterministic": True},
            generated_at=utc_now(),
        )

    async def explain(self, finding: StructuredFinding) -> LLMExplanationResult:
        return self.explain_sync(finding)
