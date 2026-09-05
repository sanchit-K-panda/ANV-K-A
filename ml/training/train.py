"""ANVĪKṢA ML training pipeline — offline, deterministic, air-gapped.

Trains the behaviour-detection model set from simulator-generated corpora:

1. **Isolation Forest (semi-supervised)** — fit exclusively on benign
   `healthy`-scenario analyst samples from many seeds. At inference the
   pre-trained forest scores evaluation cohorts; the eval data itself never
   contaminates the model (the legacy fallback fit on the live cohort does).
2. **Behaviour classifier (supervised)** — a Random Forest over a richer
   analyst feature vector, labeled from simulator ground truth
   (analyst/analyst_group entities). Its out-of-fold probability rescues
   divergent analysts the forest scores as inliers and calibrates confidence.

Usage:
    py -3.14 -m ml.training.train                          # full corpus (default seeds 43-54)
    py -3.14 -m ml.training.train --seeds 43-48 --events 8000
    py -3.14 -m ml.training.train --smoke                  # tiny end-to-end validation run
    py -3.14 -m ml.training.train --skip-eval              # train only, no benchmark re-run

Artifacts: ml/models/artifacts/{behaviour_isolation_forest.joblib,
behaviour_classifier.joblib, registry.json, training_report.json}.
"""
from __future__ import annotations

import argparse
import json
import logging
import platform
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import precision_recall_curve, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict

from ml.models.registry import ModelRegistry, TrainedBehaviourModels
from ml.training import corpus as corpus_mod
from ml.training.sample_builder import (
    BEHAVIOUR_CLF_FEATURES,
    BEHAVIOUR_IF_FEATURES,
    AnalystSample,
    build_samples,
    feature_matrix,
)

log = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EVAL_DATASETS = REPO_ROOT / "soc-simulator" / "datasets"


# --------------------------------------------------------------------------- train
def train_isolation_forest(
    benign_samples: Sequence[AnalystSample],
    contamination: float = 0.02,
    n_estimators: int = 300,
    random_state: int = 42,
) -> Tuple[Optional[IsolationForest], Dict[str, Any]]:
    """Fits the Isolation Forest on benign-only samples (semi-supervised)."""
    if len(benign_samples) < 10:
        log.warning("Only %d benign samples — skipping Isolation Forest training", len(benign_samples))
        return None, {"n_benign": len(benign_samples), "trained": False}

    X = feature_matrix(benign_samples, BEHAVIOUR_IF_FEATURES)
    model = IsolationForest(
        contamination=contamination,
        n_estimators=n_estimators,
        random_state=random_state,
    )
    model.fit(X)

    train_preds = model.predict(X)
    benign_fp_rate = float(np.mean(train_preds == -1))
    metrics = {
        "trained": True,
        "n_benign_samples": int(len(benign_samples)),
        "n_features": len(BEHAVIOUR_IF_FEATURES),
        "contamination": contamination,
        "n_estimators": n_estimators,
        "flagged_rate_on_benign_train": round(benign_fp_rate, 4),
        "mean_decision_function": round(float(np.mean(model.decision_function(X))), 4),
    }
    log.info("Isolation Forest trained: %s", metrics)
    return model, metrics


def train_behaviour_classifier(
    samples: Sequence[AnalystSample],
    n_estimators: int = 400,
    random_state: int = 42,
    n_splits: int = 5,
) -> Tuple[Optional[RandomForestClassifier], float, Dict[str, Any]]:
    """Fits the supervised behaviour classifier and selects a probability
    decision threshold by maximizing out-of-fold F1 (recall matters in a
    supervisory tool, but healthy cohorts must stay clean)."""
    labels = [s.label for s in samples]
    n_pos = int(sum(labels))
    if n_pos < 5 or n_pos > len(labels) - 5:
        log.warning(
            "Insufficient class balance for supervised training (pos=%d, total=%d) — skipping",
            n_pos, len(samples),
        )
        return None, 0.5, {"trained": False, "n_positives": n_pos, "n_total": len(samples)}

    X = feature_matrix(samples, BEHAVIOUR_CLF_FEATURES)
    y = np.array(labels, dtype=np.int8)

    model = RandomForestClassifier(
        n_estimators=n_estimators,
        class_weight="balanced",
        min_samples_leaf=1,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X, y)

    min_class = int(min(y.sum(), (1 - y).sum()))
    n_splits_eff = max(2, min(n_splits, min_class))
    oof_proba = cross_val_predict(
        model, X, y, cv=StratifiedKFold(n_splits=n_splits_eff, shuffle=True, random_state=random_state),
        method="predict_proba", n_jobs=-1,
    )[:, 1]

    auc = float(roc_auc_score(y, oof_proba))
    precision, recall, thresholds = precision_recall_curve(y, oof_proba)
    f1 = 2 * precision * recall / np.maximum(precision + recall, 1e-12)
    best_idx = int(np.argmax(f1[:-1]))  # last precision/recall pair has no threshold
    threshold = float(np.clip(thresholds[best_idx], 0.20, 0.90))

    oof_pred = (oof_proba >= threshold).astype(int)
    tp = int(np.sum((oof_pred == 1) & (y == 1)))
    fp = int(np.sum((oof_pred == 1) & (y == 0)))
    fn = int(np.sum((oof_pred == 0) & (y == 1)))
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0

    by_scenario: Dict[str, Dict[str, Any]] = {}
    for scen in sorted({s.scenario for s in samples}):
        mask = np.array([s.scenario == scen for s in samples])
        if y[mask].sum() == 0:
            continue
        scen_pred = (oof_proba[mask] >= threshold).astype(int)
        scen_tp = int(np.sum((scen_pred == 1) & (y[mask] == 1)))
        scen_fp = int(np.sum((scen_pred == 1) & (y[mask] == 0)))
        by_scenario[scen] = {
            "positives": int(y[mask].sum()),
            "oof_precision": round(scen_tp / max(1, scen_tp + scen_fp), 4),
            "oof_recall": round(scen_tp / max(1, int(y[mask].sum())), 4),
            "max_probability": round(float(np.max(oof_proba[mask])), 4),
        }
    healthy_mask = np.array([s.scenario == "healthy" for s in samples])
    healthy_max_p = round(float(np.max(oof_proba[healthy_mask])), 4) if healthy_mask.any() else None

    metrics = {
        "trained": True,
        "model_type": "RandomForestClassifier",
        "n_estimators": n_estimators,
        "n_samples": int(len(samples)),
        "n_positives": n_pos,
        "class_balance": round(n_pos / len(samples), 4),
        "oof_roc_auc": round(auc, 4),
        "decision_threshold": round(threshold, 4),
        "oof_precision": round(prec, 4),
        "oof_recall": round(rec, 4),
        "oof_f1": round(2 * prec * rec / max(prec + rec, 1e-12), 4),
        "oof_confusion": {"tp": tp, "fp": fp, "fn": fn},
        "oof_by_scenario": by_scenario,
        "healthy_max_probability": healthy_max_p,
    }
    log.info("Behaviour classifier trained: %s", {k: v for k, v in metrics.items() if k != "oof_by_scenario"})
    return model, threshold, metrics


def train_models(
    samples: Sequence[AnalystSample],
    if_contamination: float = 0.02,
    clf_estimators: int = 400,
    random_state: int = 42,
) -> Tuple[TrainedBehaviourModels, Dict[str, Any]]:
    """Trains the full behaviour model set from labeled samples."""
    benign = [s for s in samples if s.scenario == "healthy"]
    iso, iso_metrics = train_isolation_forest(
        benign, contamination=if_contamination, n_estimators=300, random_state=random_state
    )
    clf, threshold, clf_metrics = train_behaviour_classifier(
        samples, n_estimators=clf_estimators, random_state=random_state
    )
    models = TrainedBehaviourModels(
        isolation_forest=iso,
        classifier=clf,
        decision_threshold=threshold,
        if_features=list(BEHAVIOUR_IF_FEATURES),
        clf_features=list(BEHAVIOUR_CLF_FEATURES),
        metadata={},
    )
    return models, {"isolation_forest": iso_metrics, "classifier": clf_metrics}


# --------------------------------------------------------------------------- evaluate
def evaluate_benchmark(eval_dir: Path) -> Dict[str, Any]:
    """Runs the 7-scenario ground-truth benchmark with a fresh auto-loading pipeline."""
    from ml.evaluation.benchmark import run_full_benchmark  # noqa: PLC0415

    report = run_full_benchmark(eval_dir)
    return {
        "overall": report["overall"],
        "scenarios": {
            name: {
                "ground_truth_count": r["ground_truth_count"],
                "detections_count": r["detections_count"],
                "true_positives": r["true_positives"],
                "false_positives": r["false_positives"],
                "false_negatives": r["false_negatives"],
                "precision": r["precision"],
                "recall": r["recall"],
                "f1_score": r["f1_score"],
            }
            for name, r in report["scenarios"].items()
        },
    }


# --------------------------------------------------------------------------- CLI
def parse_seeds(spec: str) -> List[int]:
    seeds: List[int] = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            lo, hi = part.split("-", 1)
            seeds.extend(range(int(lo), int(hi) + 1))
        elif part:
            seeds.append(int(part))
    return sorted(set(seeds))


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Train ANVĪKṢA behaviour models offline")
    parser.add_argument("--seeds", default="43-54", help="Seed list/range for the training corpus (default 43-54)")
    parser.add_argument("--scenarios", default="all", help="Comma-separated scenarios or 'all'")
    parser.add_argument("--events", type=int, default=10_000)
    parser.add_argument("--socs", type=int, default=2)
    parser.add_argument("--sparse", action="store_true", help="Use default (thin) telemetry instead of dense")
    parser.add_argument("--out", default=None, help="Artifact directory (default ml/models/artifacts)")
    parser.add_argument("--cache", action="store_true", help="Cache generated datasets to ml/training_data/")
    parser.add_argument("--eval-datasets", default=str(DEFAULT_EVAL_DATASETS))
    parser.add_argument("--skip-eval", action="store_true", help="Skip the post-training benchmark run")
    parser.add_argument("--smoke", action="store_true", help="Tiny corpus for an end-to-end validation run")
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    if args.smoke:
        seeds, events, socs = [9001, 9002], 3000, 1
    else:
        seeds, events, socs = parse_seeds(args.seeds), args.events, args.socs
    scenarios = corpus_mod.ALL_SCENARIOS if args.scenarios == "all" else tuple(
        s.strip() for s in args.scenarios.split(",") if s.strip()
    )
    dense = not args.sparse

    print("=" * 78)
    print(" ANVĪKṢA — OFFLINE BEHAVIOUR MODEL TRAINING (air-gapped, seed-deterministic)")
    print("=" * 78)
    print(f" corpus: scenarios={list(scenarios)} seeds={seeds[:3]}{'…' if len(seeds) > 3 else ''} "
          f"events={events} socs={socs} dense={dense}")

    # 1. Corpus + samples (streamed: one dataset in memory at a time)
    sample_counter: Counter = Counter()
    samples: List[AnalystSample] = []
    for scenario, seed, ds in corpus_mod.iter_corpus(
        scenarios, seeds, events=events, soc_count=socs, dense=dense, cache=args.cache
    ):
        samples.extend(build_samples([ds]))
        sample_counter[scenario] += 1
    if not samples:
        print("No training samples produced — aborting.")
        return 1
    n_pos = sum(s.label for s in samples)
    print(f"\n samples: {len(samples)} total, {n_pos} ground-truth positives, "
          f"{sum(1 for s in samples if s.scenario == 'healthy')} benign (healthy)")

    # 2. Train
    models, train_metrics = train_models(samples)

    # 3. Persist artifacts
    registry = ModelRegistry(Path(args.out) if args.out else None)
    models.metadata = {
        "corpus": {
            "scenarios": list(scenarios),
            "seeds": seeds,
            "events_per_run": events,
            "soc_count": socs,
            "dense_telemetry": dense,
            "runs_per_scenario": dict(sample_counter),
        },
        "samples": {"total": len(samples), "positives": n_pos},
        "training": train_metrics,
        "python": platform.python_version(),
        "source": "soc-simulator (bundled, offline)",
    }
    out_dir = registry.save(models)
    print(f"\n artifacts saved to: {out_dir}")

    # 4. Post-training benchmark against the committed (seed-42) eval datasets
    if not args.skip_eval:
        eval_dir = Path(args.eval_datasets)
        print(f"\n running 7-scenario ground-truth benchmark on {eval_dir} …")
        bench = evaluate_benchmark(eval_dir)
        registry.save_report(
            {
                "trained_models": models.metadata,
                "benchmark_after_training": bench,
            }
        )
        overall = bench["overall"]
        print(
            f"\n benchmark overall: precision={overall['precision'] * 100:.1f}%  "
            f"recall={overall['recall'] * 100:.1f}%  f1={overall['f1_score'] * 100:.1f}%"
        )

    print("\nTraining complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
