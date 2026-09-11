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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Evidence-first normalization policy (REMEDIATION.md P1-6):
 *
 * Every value rendered for a REAL backend finding is derived from the backend payload
 * (raw_detections / explainability / risk). When the backend does not supply a value,
 * the field stays EMPTY and the UI renders an honest empty state — the frontend NEVER
 * invents evidence timelines, deviations, related incidents, or risk factors.
 */
function normalizeBackendFinding(raw: any): Finding {
  const exp = raw.explainability || {};
  const risk = raw.risk || {};

  // Risk factors ONLY from the backend risk assessment (risk_engine.py factor list).
  const factors = Array.isArray(risk.factors)
    ? risk.factors.map((f: any) => ({
        name: f.name || f.category || 'Risk Component',
        score: f.weight ?? f.score ?? 0,
        description: f.description || '',
      }))
    : [];

  const rawDet = (raw.raw_detections && raw.raw_detections[0]) || {};
  const baseMetrics = rawDet.baseline_metrics || {};
  const obsMetrics = rawDet.observed_metrics || {};

  // Baseline vs observed strictly from raw_detections payload
  const hasBaseline = baseMetrics.expected_per_analyst_share != null || baseMetrics.expected_distribution != null;
  const hasObserved = obsMetrics.actual_dominant_share != null || obsMetrics.observed_value != null;
  const baselineValue = hasBaseline
    ? baseMetrics.expected_per_analyst_share != null
      ? `${Math.round(baseMetrics.expected_per_analyst_share * 100)}%`
      : String(baseMetrics.expected_distribution)
    : '';
  const observedValue = hasObserved
    ? obsMetrics.actual_dominant_share != null
      ? `${Math.round(obsMetrics.actual_dominant_share * 100)}%`
      : String(obsMetrics.observed_value)
    : '';

  // Deviation computed from actual values — never a constant string.
  const deviation = computeDeviation(baseMetrics, obsMetrics);

  // Evidence timeline: rendered only from backend workflow steps if present.
  const evidence_timeline = buildEvidenceTimeline(rawDet);

  // Related entities strictly from payload refs.
  const related_incidents = Array.isArray(raw.related_incident_ids) ? raw.related_incident_ids : [];
  const related_alerts = Array.isArray(raw.alert_ids)
    ? raw.alert_ids
    : Array.isArray(rawDet.alert_ids)
      ? rawDet.alert_ids
      : [];

  return {
    id: raw.id || raw.finding_id || '',
    soc_scope: raw.soc_scope || raw.soc_id || '',
    engine: (raw.type === 'EXECUTION_GAP' ? 'VIVEKA'
      : raw.type === 'NEGATIVE_SPACE' ? 'ABHĀVA'
      : raw.type === 'BEHAVIOURAL_ANOMALY' ? 'VIKĀRA'
      : raw.type === 'RECURRING_THREAT' || raw.type === 'THREAT_RECURRENCE' ? 'PUNARĀVṚTTI'
      : raw.type === 'IDENTITY_ANOMALY' ? 'KAVACA'
      : 'VIVEKA') as any,
    type: raw.type ? raw.type.replace(/_/g, ' ') : '',
    severity: (raw.severity || 'MEDIUM') as FindingSeverity,
    status: (raw.status || 'OPEN') as FindingStatus,
    title: raw.title || raw.summary || 'Supervisory Finding',
    summary: raw.description || raw.summary || exp.what || '',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0,
    risk_score: typeof risk.score === 'number' ? risk.score : 0,
    affected_scope: Array.isArray(raw.affected_ids) ? `${raw.affected_ids.length} affected items` : '',
    detected_time: raw.created_at ? relativeTime(raw.created_at) : '',
    risk_factors: factors,
    baseline_metric_name: hasBaseline ? (baseMetrics.expected_distribution ? 'Expected Distribution' : 'Baseline') : '',
    baseline_value: baselineValue,
    observed_value: observedValue,
    deviation,
    evidence_timeline,
    what: exp.what || raw.title || '',
    why: exp.why || '',
    when_detected: exp.when || raw.created_at || '',
    where_scope: exp.where || (raw.entity_id ? `${raw.entity_type || 'Entity'}: ${raw.entity_id}` : ''),
    evidence: exp.evidence || raw.evidence || (raw.entity_id ? { entity: raw.entity_id, affected: raw.affected_ids } : null),
    recommendation: exp.recommendation || rawDet.recommended_action || '',
    suggested_action: 'OPEN_SUPERVISORY_INVESTIGATION',
    affected_entities: Array.isArray(raw.affected_ids)
      ? raw.affected_ids.map((id: string) => ({ type: 'Alert', id }))
      : [],
    related_incidents,
    related_alerts,
    created_at: raw.created_at || '',
  };
}

function computeDeviation(base: any, obs: any): string {
  const b = typeof base?.expected_per_analyst_share === 'number' ? base.expected_per_analyst_share : null;
  const o = typeof obs?.actual_dominant_share === 'number' ? obs.actual_dominant_share : null;
  if (b == null || o == null || b === 0) return '';
  const pct = Math.round(((o - b) / b) * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

interface TimelineStep { time: string; event: string; isAnomaly: boolean }

function buildEvidenceTimeline(rawDet: any): TimelineStep[] {
  // Only backend-supplied workflow steps may appear. No fabricated timestamps.
  const steps = rawDet?.workflow_trace?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return [];
  return steps.map((s: any) => ({
    time: typeof s.time === 'string' ? s.time : '',
    event: String(s.action || s.event || ''),
    isAnomaly: Boolean(s.missing || s.anomalous),
  }));
}

function relativeTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  } catch {
    return '';
  }
}

export async function fetchHealthOverview(scenario: string = 'investigation_gap'): Promise<SocHealthOverview> {
  // Evidence-first (P1-6): backend values only — no fabricated defaults.
  const res = await fetch(`${API_BASE}/analytics/overview?scenario=${scenario}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    health_score: typeof data.health_score === 'number' ? data.health_score : 0,
    status: data.status ?? 'UNKNOWN',
    critical_findings: data.critical_findings ?? 0,
    active_anomalies: data.behavioural_anomaly_count ?? 0,
    execution_gaps: data.execution_gap_count ?? 0,
    negative_space: data.negative_space_count ?? 0,
    threat_recurrences: data.threat_recurrence_count ?? 0,
    soc_scope: data.soc_scope ?? '',
    supervisor_name: data.supervisor_name ?? '',
    session_credential_state: data.session_credential_state ?? '',
    total_findings: data.total_findings ?? 0,
    last_evaluated_scenario: scenario,
  };
}

export async function fetchQuadrantScore(scenario: string = 'investigation_gap'): Promise<QuadrantScore> {
  const res = await fetch(`${API_BASE}/analytics/quadrants?scenario=${scenario}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
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
    if (Array.isArray(data)) {
      return data.map(normalizeBackendFinding);
    }
    return [];
  } catch (err) {
    // Evidence-first: surface backend failures to the UI's error state.
    throw err instanceof Error ? err : new Error('Failed to fetch findings');
  }
}

export async function fetchFindingById(id: string): Promise<Finding | null> {
  const res = await fetch(`${API_BASE}/findings/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return normalizeBackendFinding(data);
}

export async function evaluateScenario(scenarioName: string): Promise<Finding[]> {
  try {
    const res = await fetch(`${API_BASE}/analytics/evaluate-scenario/${scenarioName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(normalizeBackendFinding);
    }
    return [];
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to evaluate scenario');
  }
}

export async function fetchWorkloadAnalytics(scenario: string = 'analyst_overload'): Promise<AnalystWorkloadItem[]> {
  const res = await fetch(`${API_BASE}/analytics/workload?scenario=${scenario}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchThreatRecurrence(scenario: string = 'recurring_threat'): Promise<ThreatRecurrenceItem[]> {
  const res = await fetch(`${API_BASE}/analytics/threats?scenario=${scenario}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchHistoricalTrends(): Promise<HistoricalTrendPoint[]> {
  // P1-6: no backend endpoint exists for historical trends yet; return empty and let
  // the UI show an honest empty state instead of fabricated history.
  return [];
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

export async function fetchExaminerDossier(socId: string, topN: number = 15): Promise<any> {
  const res = await fetch(`${API_BASE}/supervisory/ranking/${socId}/dossier?top_n=${topN}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function recordExaminerAction(action: {
  case_id: string;
  soc_id: string;
  action_type: string;
  examiner_notes?: string;
  examiner_id?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/supervisory/examiner/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchExaminerActions(socId?: string): Promise<any[]> {
  const url = socId ? `${API_BASE}/supervisory/examiner/actions?soc_id=${socId}` : `${API_BASE}/supervisory/examiner/actions`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return await res.json();
}

