import { Finding, SocHealthOverview, QuadrantScore, AnalystWorkloadItem, ThreatRecurrenceItem, HistoricalTrendPoint, FindingSeverity, FindingType, FindingStatus } from '@/types';
import { MOCK_FINDINGS, MOCK_HEALTH_OVERVIEW, MOCK_QUADRANT_SCORE, MOCK_WORKLOAD, MOCK_THREAT_RECURRENCE, MOCK_HISTORICAL_TRENDS } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchHealthOverview(scenario: string = 'investigation_gap'): Promise<SocHealthOverview> {
  try {
    const res = await fetch(`${API_BASE}/analytics/overview?scenario=${scenario}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Return mock overview tailored to scenario
    const isHealthy = scenario === 'healthy';
    return {
      ...MOCK_HEALTH_OVERVIEW,
      health_score: isHealthy ? 94 : scenario === 'investigation_gap' ? 42 : scenario === 'analyst_overload' ? 58 : 64,
      status: isHealthy ? 'OPTIMAL' : 'DEGRADED',
      critical_findings: isHealthy ? 0 : 6,
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
    if (Array.isArray(data) && data.length > 0) return data;
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
    return await res.json();
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
    return await res.json();
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
