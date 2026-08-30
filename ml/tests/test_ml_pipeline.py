"""Unit tests for ANVĪKṢA ML engines and preprocessing."""
from __future__ import annotations

import pytest
import numpy as np

from ml.preprocessing.dataset_loader import load_dataset_from_dir
from ml.preprocessing.feature_extraction import FeatureExtractor
from ml.anomaly.execution_gap import ExecutionGapEngine
from ml.anomaly.negative_space import NegativeSpaceEngine
from ml.anomaly.workload import WorkloadEngine
from ml.behaviour.baseline import BaselineEngine
from ml.behaviour.isolation_forest import BehavioralIsolationForest
from ml.behaviour.kpi_manipulation import KpiManipulationEngine
from ml.recurrence.threat_recurrence import ThreatRecurrenceEngine
from ml.biometric.face_embedding import FaceEmbeddingEngine
from ml.biometric.liveness import LivenessEngine
from ml.biometric.continuous_monitor import ContinuousIdentityMonitor
from ml.models.correlation_engine import CorrelationEngine
from ml.models.risk_engine import RiskEngine
from ml.models.explainability_engine import ExplainabilityEngine, SupervisoryAnalyticsPipeline
from ml.schemas import FindingSeverity, FindingType, RawFinding


def test_dataset_loader():
    ds = load_dataset_from_dir("soc-simulator/datasets/healthy")
    assert ds.scenario == "healthy"
    assert len(ds.events) > 0
    assert len(ds.incidents) > 0
    assert len(ds.socs) > 0
    assert len(ds.analysts) > 0


def test_feature_extractor():
    ds = load_dataset_from_dir("soc-simulator/datasets/healthy")
    traces = FeatureExtractor.extract_incident_traces(ds)
    assert len(traces) == len(ds.incidents)
    
    analysts = FeatureExtractor.extract_analyst_features(ds, traces)
    assert len(analysts) == len(ds.analysts)
    for af in analysts.values():
        assert af.investigation_rate >= 0.0
        assert af.critical_case_share >= 0.0


def test_execution_gap_engine():
    ds = load_dataset_from_dir("soc-simulator/datasets/investigation_gap")
    traces = FeatureExtractor.extract_incident_traces(ds)
    engine = ExecutionGapEngine()
    findings = engine.analyze(ds, traces)
    
    assert len(findings) >= 2
    for f in findings:
        assert f.finding_type == FindingType.EXECUTION_GAP
        assert f.severity in (FindingSeverity.CRITICAL, FindingSeverity.HIGH)
        assert f.confidence >= 0.90
        assert "expected_actions" in f.evidence
        assert "actual_actions" in f.evidence


def test_negative_space_engine():
    ds = load_dataset_from_dir("soc-simulator/datasets/negative_space")
    traces = FeatureExtractor.extract_incident_traces(ds)
    engine = NegativeSpaceEngine()
    findings = engine.analyze(ds, traces)
    
    assert len(findings) >= 2
    for f in findings:
        assert f.finding_type == FindingType.NEGATIVE_SPACE
        assert "missing_actions" in f.evidence
        assert f.confidence >= 0.85


def test_workload_engine():
    ds = load_dataset_from_dir("soc-simulator/datasets/analyst_overload")
    traces = FeatureExtractor.extract_incident_traces(ds)
    analysts = FeatureExtractor.extract_analyst_features(ds, traces)
    engine = WorkloadEngine()
    findings = engine.analyze(ds, traces, analysts)
    
    assert len(findings) == 1
    f = findings[0]
    assert f.finding_type == FindingType.WORKLOAD_IMBALANCE
    assert f.entity_id == "AN-00024"
    assert f.evidence["dominant_share"] >= 0.50


def test_kpi_manipulation_engine():
    ds = load_dataset_from_dir("soc-simulator/datasets/kpi_manipulation")
    traces = FeatureExtractor.extract_incident_traces(ds)
    analysts = FeatureExtractor.extract_analyst_features(ds, traces)
    engine = KpiManipulationEngine()
    findings = engine.analyze(ds, traces, analysts)
    
    assert len(findings) >= 1
    f = findings[0]
    assert f.finding_type == FindingType.KPI_MANIPULATION
    assert "AN-00012" in f.entity_id


def test_threat_recurrence_engine():
    ds = load_dataset_from_dir("soc-simulator/datasets/recurring_threat")
    engine = ThreatRecurrenceEngine()
    findings = engine.analyze(ds)
    
    assert len(findings) == 1
    f = findings[0]
    assert f.finding_type == FindingType.RECURRING_THREAT
    assert f.entity_id == "THR-00006"
    assert f.severity == FindingSeverity.CRITICAL


def test_biometric_face_embedding():
    engine = FaceEmbeddingEngine(match_threshold=0.75)
    img1 = b"fake_photographic_frame_supervisor_alice_001"
    img2 = b"fake_photographic_frame_supervisor_alice_001"
    img3 = b"fake_photographic_frame_intruder_bob_002"

    emb1 = engine.extract_embedding_from_bytes(img1)
    emb2 = engine.extract_embedding_from_bytes(img2)
    emb3 = engine.extract_embedding_from_bytes(img3)

    assert len(emb1) == 128
    assert np.isclose(np.linalg.norm(emb1), 1.0)

    is_match, score = engine.verify(emb1, emb2)
    assert is_match is True
    assert score >= 0.99

    is_match_intruder, score_intruder = engine.verify(emb1, emb3)
    assert score_intruder < score


def test_biometric_liveness():
    engine = LivenessEngine()
    frame = b"realistic_varied_pixel_data_stream_entropy_" * 10
    is_live, score, metrics = engine.evaluate_liveness(frame)
    assert isinstance(is_live, bool)
    assert 0.0 <= score <= 1.0
    assert "entropy" in metrics


def test_continuous_identity_monitor():
    ds = load_dataset_from_dir("soc-simulator/datasets/identity_anomaly")
    monitor = ContinuousIdentityMonitor()
    findings = monitor.analyze(ds)
    
    assert len(findings) == 1
    f = findings[0]
    assert f.finding_type == FindingType.IDENTITY_ANOMALY
    assert f.entity_id == "SESS-0039"
    assert f.severity == FindingSeverity.CRITICAL


def test_risk_engine_additive_factors():
    det = RawFinding(
        engine_name="TestEngine",
        finding_type=FindingType.EXECUTION_GAP,
        severity=FindingSeverity.CRITICAL,
        confidence=0.95,
        title="Test Critical Gap",
        description="Test description",
        entity_type="incident",
        entity_id="INC-001",
    )
    result = RiskEngine.calculate_risk(
        primary_type=FindingType.EXECUTION_GAP,
        severity=FindingSeverity.CRITICAL,
        confidence=0.95,
        detections=[det],
    )
    
    assert 0 <= result.score <= 100
    assert len(result.factors) >= 2
    assert "Severity Impact" in result.breakdown
    assert "Investigation Gap" in result.breakdown
    assert sum(f.weight for f in result.factors) >= result.score


def test_explainability_card_contract():
    pipeline = SupervisoryAnalyticsPipeline()
    ds = load_dataset_from_dir("soc-simulator/datasets/investigation_gap")
    findings = pipeline.run(ds)
    
    assert len(findings) > 0
    for f in findings:
        exp = f.explainability
        # Mandatory 7-part fields
        assert exp.what
        assert exp.why
        assert exp.when
        assert exp.where
        assert exp.evidence
        assert 0.0 <= exp.confidence <= 1.0
        assert exp.recommendation
