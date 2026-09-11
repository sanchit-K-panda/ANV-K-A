/**
 * Static scenario catalog — factual dataset descriptions, not simulated telemetry.
 *
 * REMEDIATION.md P1-6: this is deliberately NOT mock data. Scenario ids/descriptions
 * are static facts about the MĀYĀ benchmark suite (matching soc-simulator scenarios),
 * the same way a menu lists dishes without cooking them. Every number a page renders
 * about a SOC still comes exclusively from the backend.
 */
export interface ScenarioDescriptor {
  id: string;
  name: string;
  desc: string;
}

export const SCENARIOS: ScenarioDescriptor[] = [
  { id: 'investigation_gap', name: 'MĀYĀ-01 : Investigation Gap (Default)', desc: 'High-severity alerts closed without investigation records' },
  { id: 'analyst_overload', name: 'MĀYĀ-02 : Analyst Overload', desc: 'Workforce bottleneck and critical case concentration' },
  { id: 'negative_space', name: 'MĀYĀ-03 : Negative Space Gap (ABHĀVA)', desc: 'Missing mandatory forensic and containment actions' },
  { id: 'kpi_manipulation', name: 'MĀYĀ-04 : KPI Manipulation (VIKĀRA)', desc: 'Sub-60s rapid closures to artificially depress MTTR' },
  { id: 'recurring_threat', name: 'MĀYĀ-05 : Recurring Unresolved Threat', desc: 'Persistent attack pattern hitting same assets repeatedly' },
  { id: 'identity_anomaly', name: 'MĀYĀ-06 : Identity Anomaly (KAVACA)', desc: 'Session hijack & identity mismatch during privileged session' },
  { id: 'healthy', name: 'MĀYĀ-07 : Healthy Baseline SOC', desc: 'Nominal baseline operational metrics — must produce zero findings' },
];
