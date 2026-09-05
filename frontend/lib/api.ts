import {
  Finding,
  SocHealthOverview,
  QuadrantScore,
  AnalystWorkloadItem,
  ThreatRecurrenceItem,
  HistoricalTrendPoint,
  FindingSeverity,
  FindingType,
  FindingStatus,
} from '@/types';
import {
  MOCK_FINDINGS,
  MOCK_HEALTH_OVERVIEW,
  MOCK_QUADRANT_SCORE,
  MOCK_WORKLOAD,
  MOCK_THREAT_RECURRENCE,
  MOCK_HISTORICAL_TRENDS,
} from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Normalizes backend finding shape into frontend Finding interface
 */
function normalizeBackendFinding(raw: any): Finding {
  const exp = raw.explainability || {};
  const risk = raw.risk || {};
  const factors = Array.isArray(risk.factors)
    ? risk.factors.map((f: any) => ({
        name: f.name || f.category || 'Risk Component',
        score: f.weight || f.score || 10,
        description: f.description || '',
      }))
    : [
        { name: 'Investigation Gap Impact', score: 31, description: 'Direct omission of required investigation SOP step' },
        { name: 'Escalation Anomaly', score: 24, description: 'Tier 2/3 supervisor escalation bypassed' },
        { name: 'Negative Space Weight', score: 18, description: 'Expected forensic evidence not created' },
      ];

  const rawDet = (raw.raw_detections && raw.raw_detections[0]) || {};
  const baseMetrics = rawDet.baseline_metrics || {};
  const obsMetrics = rawDet.observed_metrics || {};

  return {
    id: raw.id || 'FND-EXEC-001',
    soc_scope: raw.soc_scope || 'SOC-04',
    engine: (raw.type === 'EXECUTION_GAP' ? 'VIVEKA' : raw.type === 'NEGATIVE_SPACE' ? 'ABHĀVA' : raw.type === 'BEHAVIOURAL_ANOMALY' ? 'VIKĀRA' : raw.type === 'THREAT_RECURRENCE' ? 'PUNARĀVṚTTI' : 'VIVEKA') as any,
    type: raw.type ? raw.type.replace(/_/g, ' ') : 'Execution Gap',
    severity: (raw.severity || 'CRITICAL') as FindingSeverity,
    status: (raw.status || 'OPEN') as FindingStatus,
    title: raw.title || 'Supervisory Anomaly Finding',
    summary: raw.description || raw.summary || exp.what || 'Supervisory detection flagged operational anomaly.',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.94,
    risk_score: typeof risk.score === 'number' ? risk.score : 91,
    affected_scope: Array.isArray(raw.affected_ids) ? `${raw.affected_ids.length} affected items` : '83 alerts affected',
    detected_time: 'Just now',
    risk_factors: factors,
    baseline_metric_name: baseMetrics.expected_distribution ? 'Expected Distribution' : 'Investigation Baseline',
    baseline_value: baseMetrics.expected_per_analyst_share ? `${Math.round(baseMetrics.expected_per_analyst_share * 100)}%` : '85% mandatory',
    observed_value: obsMetrics.actual_dominant_share ? `${Math.round(obsMetrics.actual_dominant_share * 100)}%` : '11% observed',
    deviation: '-74%',
    evidence_timeline: [
      { time: '10:31:02', event: 'Alert Ingested by Sensor', isAnomaly: false },
      { time: '10:31:18', event: 'Triage Stage Completed', isAnomaly: false },
      { time: '10:32:44', event: 'Mandatory Forensic Investigation Omitted', isAnomaly: true },
      { time: '10:34:01', event: 'Tier 2 Escalation Bypassed', isAnomaly: true },
      { time: '10:34:22', event: 'Ticket Closed (False Positive Claimed)', isAnomaly: true },
    ],
    what: exp.what || raw.title || 'Investigation gap detected in critical alert queue',
    why: exp.why || 'Observed investigation execution rate fell 74% below baseline SOP requirements',
    when_detected: exp.when || raw.created_at || '2026-08-31 10:34:22 UTC',
    where_scope: exp.where || (raw.entity_id ? `${raw.entity_type || 'Entity'}: ${raw.entity_id}` : 'DC-PROD-01 (10.14.2.1)'),
    evidence: exp.evidence || raw.evidence || { entity: raw.entity_id, affected: raw.affected_ids },
    recommendation: exp.recommendation || rawDet.recommended_action || 'Audit affected cases, revoke closure status on uninvestigated alerts, and enforce escalation policies.',
    suggested_action: 'OPEN_SUPERVISORY_INVESTIGATION',
    affected_entities: Array.isArray(raw.affected_ids)
      ? raw.affected_ids.map((id: string) => ({ type: 'Alert', id }))
      : [{ type: 'Host', id: 'DC-PROD-01' }],
    related_incidents: ['INC-84920', 'INC-84921'],
    related_alerts: ['ALT-99201', 'ALT-99202', 'ALT-99203'],
    created_at: raw.created_at || '2026-08-31T10:34:22Z',
  };
}

export async function fetchHealthOverview(scenario: string = 'investigation_gap'): Promise<SocHealthOverview> {
  try {
    const res = await fetch(`${API_BASE}/analytics/overview?scenario=${scenario}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      health_score: data.health_score ?? 78,
      status: data.status ?? 'DEGRADED',
      critical_findings: data.critical_findings ?? 7,
      active_anomalies: data.behavioural_anomaly_count ?? 23,
      execution_gaps: data.execution_gap_count ?? 14,
      negative_space: data.negative_space_count ?? 6,
      threat_recurrences: data.threat_recurrence_count ?? 8,
      soc_scope: 'SOC-04',
      supervisor_name: 'A. Sharma',
      session_credential_state: 'ACTIVE',
      total_findings: data.total_findings ?? 18,
      last_evaluated_scenario: scenario,
    };
  } catch (err) {
    const isHealthy = scenario === 'healthy';
    return {
      ...MOCK_HEALTH_OVERVIEW,
      health_score: isHealthy ? 94 : scenario === 'investigation_gap' ? 78 : scenario === 'analyst_overload' ? 58 : 64,
      status: isHealthy ? 'OPTIMAL' : 'DEGRADED',
      critical_findings: isHealthy ? 0 : 7,
      total_findings: isHealthy ? 1 : 18,
      last_evaluated_scenario: scenario,
    };
  }
}

export async function fetchQuadrantScore(scenario: string = 'investigation_gap'): Promise<QuadrantScore> {
  try {
    const res = await fetch(`${API_BASE}/analytics/quadrants?scenario=${scenario}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (scenario === 'healthy') {
      return {
        detection_score: 95,
        investigation_score: 92,
        escalation_score: 89,
        response_score: 94,
        composite_grade: 'A',
      };
    }
    return MOCK_QUADRANT_SCORE;
  }
}

export async function fetchFindings(params?: {
  severity?: FindingSeverity;
  type?: FindingType;
  status?: FindingStatus;
  scenario?: string;
}): Promise<Finding[]> {
  try {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);

    const url = `${API_BASE}/findings${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeBackendFinding);
    }
    throw new Error('Empty backend findings');
  } catch (err) {
    let filtered = [...MOCK_FINDINGS];
    if (params?.severity) filtered = filtered.filter(f => f.severity === params.severity);
    if (params?.type) filtered = filtered.filter(f => f.type === params.type);
    if (params?.status) filtered = filtered.filter(f => f.status === params.status);
    return filtered;
  }
}

export async function fetchFindingById(id: string): Promise<Finding | null> {
  try {
    const res = await fetch(`${API_BASE}/findings/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return normalizeBackendFinding(data);
  } catch (err) {
    const match = MOCK_FINDINGS.find(f => f.id === id);
    return match || MOCK_FINDINGS[0];
  }
}

export async function evaluateScenario(scenarioName: string): Promise<Finding[]> {
  try {
    const res = await fetch(`${API_BASE}/analytics/evaluate-scenario/${scenarioName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeBackendFinding);
    }
    return MOCK_FINDINGS;
  } catch (err) {
    return MOCK_FINDINGS;
  }
}

export async function fetchWorkloadAnalytics(scenario: string = 'analyst_overload'): Promise<AnalystWorkloadItem[]> {
  try {
    const res = await fetch(`${API_BASE}/analytics/workload?scenario=${scenario}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return MOCK_WORKLOAD;
  }
}

export async function fetchThreatRecurrence(scenario: string = 'recurring_threat'): Promise<ThreatRecurrenceItem[]> {
  try {
    const res = await fetch(`${API_BASE}/analytics/threats?scenario=${scenario}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return MOCK_THREAT_RECURRENCE;
  }
}

export async function fetchHistoricalTrends(): Promise<HistoricalTrendPoint[]> {
  return MOCK_HISTORICAL_TRENDS;
}

export interface FindingExplanationResponse {
  finding_id: string;
  soc_id: string;
  severity: string;
  risk_score: number;
  confidence: number;
  title: string;
  summary: string;
  what_happened: string;
  why_it_matters: string;
  evidence_summary: string;
  confidence_statement: string;
  recommended_action: string;
  limitations: string[];
  source_model: string;
  is_fallback: boolean;
  latency_ms?: number;
}

export interface LLMHealthStatus {
  status: 'READY' | 'MODEL_MISSING' | 'OFFLINE';
  ollama_reachable: boolean;
  base_url: string;
  configured_model: string;
  available_models: string[];
}

export async function fetchLLMHealth(): Promise<LLMHealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/llm/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      status: 'OFFLINE',
      ollama_reachable: false,
      base_url: 'http://127.0.0.1:11434',
      configured_model: 'deepseek-r1:8b',
      available_models: [],
    };
  }
}

export async function explainFindingWithLLM(finding: Finding): Promise<FindingExplanationResponse> {
  const payload = {
    finding_id: finding.id,
    finding_type: finding.engine === 'ABHĀVA' ? 'NEGATIVE_SPACE' : 'EXECUTION_GAP',
    soc_id: finding.soc_scope || 'SOC-04',
    severity: finding.severity || 'CRITICAL',
    confidence: typeof finding.confidence === 'number' ? finding.confidence : 0.94,
    risk_score: typeof finding.risk_score === 'number' ? finding.risk_score : 91,
    title: finding.title || 'Supervisory Anomaly Finding',
    summary: finding.summary || finding.what || 'Supervisory detection flagged operational anomaly.',
    baseline: {
      baseline_metric_name: finding.baseline_metric_name || 'Investigation Baseline',
      baseline_value: finding.baseline_value || '85% mandatory',
    },
    observed: {
      observed_value: finding.observed_value || '11% observed',
      deviation: finding.deviation || '-74%',
    },
    missing_actions: ['INVESTIGATION', 'ESCALATION'],
    evidence: Array.isArray(finding.evidence_timeline)
      ? finding.evidence_timeline.map((e, idx) => ({
          event_id: `EV-${idx + 101}`,
          action: e.event,
          time: e.time,
        }))
      : [],
    recommendation: finding.recommendation || 'Audit affected cases and review escalation workflow.',
  };

  try {
    const res = await fetch(`${API_BASE}/llm/explain-finding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Zero crash guarantee: Return deterministic fallback
    return {
      finding_id: finding.id,
      soc_id: finding.soc_scope,
      severity: finding.severity,
      risk_score: finding.risk_score,
      confidence: finding.confidence,
      title: finding.title,
      summary: finding.summary,
      what_happened: finding.what || finding.summary,
      why_it_matters: finding.why || 'Baseline investigation standards were violated.',
      evidence_summary: `Observed ${finding.observed_value} vs baseline requirement ${finding.baseline_value}.`,
      confidence_statement: `Deterministic assessment certainty: ${Math.round(finding.confidence * 100)}%.`,
      recommended_action: finding.recommendation,
      limitations: ['Deterministic template fallback active (Local AI offline).'],
      source_model: 'deterministic-fallback',
      is_fallback: true,
      latency_ms: 0,
    };
  }
}
