"""Ground-truth evaluation benchmark runner for ANVĪKṢA (Phases 14–15).

Evaluates the entire Supervisory Analytics Pipeline against all 7 SOC Simulator datasets:
1. Healthy SOC
2. Investigation Gap
3. Negative Space
4. KPI Manipulation
5. Analyst Overload
6. Recurring Threat
7. Identity Anomaly

Calculates Precision, Recall, and F1-score against known injected ground truth.

Consistency policy (REMEDIATION.md P0-2 fix #2): the healthy-scenario FP rule here MUST
match the window-level evaluator — a healthy window/case counts as a false positive only
when it would raise a HIGH or CRITICAL alert, so both evaluators agree by construction.
All percentages are reported with sample sizes (REMEDIATION.md P0-2 acceptance #3).
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Set

from ml.evaluation.metrics import ScenarioEvaluationResult
from ml.models.explainability_engine import SupervisoryAnalyticsPipeline
from ml.preprocessing.dataset_loader import LoadedDataset, load_dataset_from_dir
from ml.schemas import FindingOutput


# NOTE (REMEDIATION.md P0-2): the former SCENARIO_FINDING_MAP — which pre-filtered
# candidate findings by scenario name — was the benchmark's circularity artifact: the
# ground truth itself carries `expected_findings`, written independently by the
# simulator at injection time. Matching now uses ONLY the GT's expected_findings, so a
# workflow violation produced in ANY scenario (e.g. maturity-profile gaps inside the
# kpi_manipulation dataset) can match its label. No scenario→type assumptions remain.


def evaluate_scenario(dataset_dir: str | Path, pipeline: SupervisoryAnalyticsPipeline) -> ScenarioEvaluationResult:
    dataset = load_dataset_from_dir(dataset_dir)
    findings = pipeline.run(dataset)

    res = ScenarioEvaluationResult(
        scenario=dataset.scenario,
        ground_truth_count=len(dataset.ground_truth),
        detections_count=len(findings),
    )

    if not dataset.ground_truth:
        # Vacuous-GT guard (true healthy baseline without profiles): any HIGH/CRITICAL
        # finding is a false positive. Aligned with the window-level evaluator
        # (REMEDIATION.md P0-2 fix #2).
        critical_high_findings = [f for f in findings if f.severity in ("CRITICAL", "HIGH")]
        res.true_positives = 0
        res.false_positives = len(critical_high_findings)
        res.false_negatives = 0
        res.calculate_scores()
        return res

    # All findings are match candidates; the GT's expected_findings decide type match.
    relevant_findings = findings
    res.detections_count = len(relevant_findings)

    matched_gt_ids: Set[str] = set()
    matched_finding_ids: Set[str] = set()

    for gt in dataset.ground_truth:
        gt_id = gt.get("truth_id")
        gt_entity_type = gt.get("entity_type")
        gt_entity_id = gt.get("entity_id", "")
        gt_expected_findings = set(gt.get("expected_findings", []))
        gt_entity_set = set(gt_entity_id.split(","))

        # Look for matching finding. NOTE: one correlated finding may legitimately
        # satisfy SEVERAL ground-truth cases — a correlated card carries every covered
        # incident in `affected_ids`, so the operator is alerted about each. Requiring
        # strict 1:1 here turned correct detections into phantom false negatives
        # (REMEDIATION.md P0-2: evaluators must measure coverage, not card granularity).
        # Each ground-truth case still maps to at most ONE finding (break below).
        for f in relevant_findings:

            entity_matched = False
            if f.entity_id == gt_entity_id:
                entity_matched = True
            elif set(f.entity_id.split(",")) & gt_entity_set:
                entity_matched = True
            elif any(aid in gt_entity_set for aid in f.affected_ids):
                entity_matched = True
            elif gt_entity_type == "analyst_group" and any(aid in gt_entity_set for aid in f.entity_id.split(",")):
                entity_matched = True

            finding_types = {f.type.value}
            for d in f.raw_detections:
                finding_types.add(d.finding_type.value)
            
            # Map canonical names and synonyms
            if "KPI_MANIPULATION" in finding_types:
                finding_types.update(["POTENTIAL_KPI_MANIPULATION", "CLOSURE_ANOMALY"])
            if "WORKLOAD_IMBALANCE" in finding_types:
                finding_types.add("ANALYST_BOTTLENECK")
            if "RECURRING_THREAT" in finding_types:
                finding_types.add("REPEATED_UNRESOLVED_THREAT")
            if "EXECUTION_GAP" in finding_types:
                finding_types.add("CLOSURE_WITHOUT_INVESTIGATION")

            type_matched = bool(finding_types & gt_expected_findings)

            if entity_matched and type_matched:
                matched_gt_ids.add(gt_id)
                matched_finding_ids.add(f.id)
                res.matched_entities.append(f"{gt_id} -> {f.entity_id} ({f.type.value})")
                break

    res.true_positives = len(matched_gt_ids)
    res.false_negatives = len(dataset.ground_truth) - len(matched_gt_ids)
    # FP policy (REMEDIATION.md P0-2 fix #2, made uniform): an unmatched finding counts
    # as a false positive only when it is alert-worthy (HIGH/CRITICAL). MEDIUM findings
    # are watch items, not detections — counting them would conflate review queues with
    # alerting and would disagree with the window-level evaluator, which already uses
    # this exact rule for the healthy scenario.
    unmatched = [f for f in relevant_findings if f.id not in matched_finding_ids]
    res.false_positives = sum(1 for f in unmatched if f.severity in ("CRITICAL", "HIGH"))

    for gt in dataset.ground_truth:
        if gt.get("truth_id") not in matched_gt_ids:
            res.missed_entities.append(f"{gt.get('truth_id')}: {gt.get('entity_id')}")

    res.calculate_scores()
    return res


def run_full_benchmark(datasets_dir: str | Path) -> Dict[str, Any]:
    p = Path(datasets_dir)
    pipeline = SupervisoryAnalyticsPipeline()
    scenario_order = [
        "healthy",
        "investigation_gap",
        "negative_space",
        "kpi_manipulation",
        "analyst_overload",
        "recurring_threat",
        "identity_anomaly",
    ]

    results: Dict[str, ScenarioEvaluationResult] = {}

    for s_name in scenario_order:
        s_dir = p / s_name
        if s_dir.exists() and s_dir.is_dir():
            res = evaluate_scenario(s_dir, pipeline)
            results[s_name] = res

    # Summary table
    print("\n" + "=" * 92)
    print(" ANVIKSHA (SAT-SA) -- SUPERVISORY AI 7-SCENARIO GROUND TRUTH BENCHMARK")
    print("=" * 92)
    print(f"{'Scenario':<22} | {'GT':<4} | {'Det':<4} | {'TP':<4} | {'FP':<4} | {'FN':<4} | {'Precision':<10} | {'Recall':<8} | {'F1-Score':<8}")
    print("-" * 92)

    total_tp = sum(r.true_positives for r in results.values())
    total_fp = sum(r.false_positives for r in results.values())
    total_fn = sum(r.false_negatives for r in results.values())
    total_gt = sum(r.ground_truth_count for r in results.values())

    for name, r in results.items():
        print(
            f"{name:<22} | {r.ground_truth_count:<4} | {r.detections_count:<4} | "
            f"{r.true_positives:<4} | {r.false_positives:<4} | {r.false_negatives:<4} | "
            f"{r.precision * 100:>8.1f}% | {r.recall * 100:>6.1f}% | {r.f1_score * 100:>6.1f}%"
        )

    overall_prec = round(total_tp / (total_tp + total_fp), 4) if (total_tp + total_fp) > 0 else 1.0
    overall_rec = round(total_tp / (total_tp + total_fn), 4) if (total_tp + total_fn) > 0 else 1.0
    overall_f1 = (
        round(2 * (overall_prec * overall_rec) / (overall_prec + overall_rec), 4)
        if (overall_prec + overall_rec) > 0
        else 1.0
    )

    print("-" * 92)
    print(
        f"{'OVERALL (N GT cases = ' + str(total_gt) + ')':<22} | {'-':<4} | {'-':<4} | {total_tp:<4} | {total_fp:<4} | {total_fn:<4} | "
        f"{overall_prec * 100:>8.1f}% | {overall_rec * 100:>6.1f}% | {overall_f1 * 100:>6.1f}%"
    )
    print(f"\nSample size note: entity-level metrics over N={total_gt} ground-truth cases "
          f"across {len(results)} scenarios. Percentages are meaningless without this N.")
    print("=" * 92 + "\n")

    return {
        "evaluator": "entity_level_rules_pipeline",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "healthy_fp_rule": "HIGH/CRITICAL severity finding on healthy dataset (aligned with window-level evaluator)",
        "overall": {
            "precision": overall_prec,
            "recall": overall_rec,
            "f1_score": overall_f1,
            "sample_sizes": {
                "ground_truth_cases": total_gt,
                "scenarios": len(results),
            },
        },
        "scenarios": {k: vars(v) for k, v in results.items()},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ANVĪKṢA Ground Truth Benchmark")
    parser.add_argument("--datasets", default="soc-simulator/datasets", help="Path to simulator datasets directory")
    parser.add_argument("--output", default=None, help="Optional output JSON path")
    args = parser.parse_args()

    report = run_full_benchmark(args.datasets)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f"Benchmark results saved to: {args.output}")
