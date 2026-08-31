export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED';

export type SanskritEngine =
  | 'VIVEKA'       // Execution-Gap Intelligence
  | 'ABHĀVA'       // Negative-Space Intelligence
  | 'VIKĀRA'       // Behavioural Anomaly Intelligence
  | 'PUNARĀVṚTTI'  // Threat Recurrence Intelligence
  | 'SAṄGATI'      // Correlation Engine
  | 'MĀN'          // Risk Quantification Engine
  | 'PRATYAYA'     // Evidence & Explainability
  | 'UPĀYA'        // Recommendation Engine
  | 'KAVACA'       // Secure Access Layer
  | 'DARŚANA'      // Biometric Identity Verification
  | 'NETRA-3D'     // LiDAR / Depth Verification
  | 'KṢAṆA'        // Ephemeral Session Security
  | 'BANDHA'       // Device & Session Binding
  | 'SAKṢĪ'        // Audit & Evidence Integrity
  | 'AKṢARA'       // Immutable Trust Ledger
  | 'SATYA'        // Evidence Integrity Verification
  | 'SAṄGRAHA'     // Data Ingestion
  | 'ŚODHANA'      // Data Normalization
  | 'MĀYĀ'         // SOC Simulation Engine
  | 'PARĪKṢA';     // Validation & Testing Engine

export type FindingStatus =
  | 'OPEN'
  | 'REVIEW'
  | 'INVESTIGATING'
  | 'CONFIRMED'
  | 'RESOLVED'
  | 'FALSE_POSITIVE';

export type FindingType = string;

export interface HistoricalTrendPoint {
  timestamp: string;
  health_score: number;
  critical_findings_count: number;
  active_anomalies_count: number;
}



export interface RiskFactor {
  name: string;
  score: number;
  description?: string;
}

export interface AffectedEntity {
  type: string;
  id: string;
  name?: string;
}

export interface EvidenceTimelineStep {
  time: string;
  event: string;
  isAnomaly?: boolean;
  type?: string;
}

export interface Finding {
  id: string;
  soc_scope: string; // e.g. "SOC-04"
  engine: SanskritEngine;
  type: string; // e.g. "Execution Gap", "VIKĀRA", "ABHĀVA"
  severity: FindingSeverity;
  status: FindingStatus;
  title: string;
  summary: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.94)
  risk_score: number; // 0 - 100 (e.g. 91)
  affected_scope: string; // e.g. "83 alerts affected", "12 analysts"
  detected_time: string; // e.g. "2m ago"
  risk_factors: RiskFactor[];
  
  // Baseline vs Observed (WHY DETECTED)
  baseline_metric_name: string;
  baseline_value: string;
  observed_value: string;
  deviation: string; // e.g. "-74%"
  
  // Timeline
  evidence_timeline: EvidenceTimelineStep[];
  
  what: string;
  why: string;
  when_detected: string;
  where_scope: string;
  evidence: Record<string, any>;
  recommendation: string;
  suggested_action: string;
  affected_entities: AffectedEntity[];
  related_incidents: string[];
  related_alerts: string[];
  created_at: string;
}

export interface SocHealthOverview {
  health_score: number; // e.g. 78
  status: string; // e.g. "OPTIMAL", "DEGRADED"
  critical_findings: number; // e.g. 7
  active_anomalies: number; // e.g. 23
  execution_gaps: number; // e.g. 14
  negative_space: number; // e.g. 6
  threat_recurrences: number; // e.g. 8
  soc_scope: string;
  supervisor_name: string;
  session_credential_state: string;
  total_findings?: number;
  last_evaluated_scenario?: string;
}


export interface QuadrantScore {
  detection_score: number;
  investigation_score: number;
  escalation_score: number;
  response_score: number;
  composite_grade: string;
}

export interface AnalystWorkloadItem {
  analyst_id: string;
  name: string;
  role: string;
  critical_cases: number;
  active_cases: number;
  workload_level: 'HIGH' | 'NORMAL' | 'LOW';
  mean_closure_minutes: number;
  investigation_rate: number;
  is_bottleneck: boolean;
}

export interface ThreatRecurrenceItem {
  threat_id: string;
  name: string;
  category: string;
  incident_chain: string[];
  first_seen: string;
  last_seen: string;
  affected_assets: string[];
  resolution_history: string;
  recurrence_score: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_role: string;
  action: string;
  device_id: string;
  integrity_state: 'VERIFIED' | 'TAMPERED';
  target_id: string;
  previous_hash: string;
  current_hash: string;
  details: string;
}
