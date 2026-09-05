'use client';

import React, { useState } from 'react';
import {
  MOCK_WORKLOAD,
  MOCK_THREAT_RECURRENCE,
} from '@/lib/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const CHART_GRID = 'rgb(var(--soc-border))';
const CHART_TICK = { fill: 'rgb(var(--soc-textMuted))', fontSize: 11, fontFamily: 'var(--font-jetbrains)' };
const TOOLTIP_STYLE = {
  backgroundColor: 'rgb(var(--soc-panel))',
  border: '1px solid rgb(var(--soc-borderStrong))',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'var(--font-inter)',
  color: 'rgb(var(--soc-text))',
  boxShadow: 'var(--shadow-dropdown)',
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<
    'PERFORMANCE' | 'VIVEKA' | 'ABHĀVA' | 'VIKĀRA' | 'PUNARĀVṚTTI' | 'WORKLOAD'
  >('VIVEKA');

  const performanceTrendData = [
    { hour: '00:00', detection: 94, investigation: 32, escalation: 45 },
    { hour: '04:00', detection: 92, investigation: 28, escalation: 40 },
    { hour: '08:00', detection: 95, investigation: 20, escalation: 35 },
    { hour: '12:00', detection: 90, investigation: 35, escalation: 50 },
    { hour: '16:00', detection: 93, investigation: 25, escalation: 38 },
    { hour: '20:00', detection: 91, investigation: 31, escalation: 48 },
  ];

  const closureDistributionData = [
    { range: '<1m', observed: 42, baseline: 2 },
    { range: '1-5m', observed: 35, baseline: 5 },
    { range: '5-15m', observed: 12, baseline: 18 },
    { range: '15-30m', observed: 8, baseline: 35 },
    { range: '30-60m', observed: 3, baseline: 30 },
    { range: '>60m', observed: 0, baseline: 10 },
  ];

  const tabs = [
    { id: 'VIVEKA', label: 'Execution Gaps (VIVEKA)' },
    { id: 'ABHĀVA', label: 'Negative Space (ABHĀVA)' },
    { id: 'VIKĀRA', label: 'Behavioural ML (VIKĀRA)' },
    { id: 'PERFORMANCE', label: 'SOC Performance Lifecycle' },
    { id: 'PUNARĀVṚTTI', label: 'Threat Recurrence' },
    { id: 'WORKLOAD', label: 'Analyst Workload Matrix' },
  ] as const;

  const sopSteps = ['Alert Ingestion', 'Triage & Correlation', 'Mandatory Forensic Investigation', 'Tier 2 Escalation', 'Host & Network Response', 'Supervisory Case Closure'];

  const actualExecution = [
    { label: '1. Alert Ingestion', ok: true },
    { label: '2. Triage & Correlation', ok: true },
    { label: '3. Forensic Investigation (Omitted)', ok: false },
    { label: '4. Escalation (Bypassed)', ok: false },
    { label: '5. Response (Partial Containment)', ok: true },
    { label: '6. Direct Closure (False Positive Claim)', ok: false },
  ];

  return (
    <div className="space-y-4 pb-16">
      {/* Title Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-soc-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Supervisory Analytics</h1>
            <span className="soc-badge badge-accent">MEDHĀ ENGINES</span>
          </div>
          <p className="text-xs text-soc-textMuted mt-1">
            Offline operational intelligence: Execution Gaps, Negative Space, Behavioural Deviations, and Threat Recurrence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" aria-hidden="true" />
          <span>LOCAL INFERENCE ENGINE ACTIVE</span>
        </div>
      </div>

      {/* Engine Tabs */}
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`px-3 py-1.5 text-2xs font-mono tracking-wide rounded-sm border transition-colors ${
              activeTab === tab.id
                ? 'bg-soc-accentInk border-soc-accent/50 text-soc-accentBright'
                : 'bg-transparent border-soc-border text-soc-textSecondary hover:text-soc-text hover:bg-soc-raised'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIVEKA — Execution Gaps */}
      {activeTab === 'VIVEKA' && (
        <div className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <h2 className="panel-label">VIVEKA — Expected vs Actual Operational Workflow</h2>
              <p className="text-2xs text-soc-textMuted mt-0.5 font-sans">
                Pinpoints where human analyst actions omitted or bypassed mandatory SOC standard operating procedures.
              </p>
            </div>
            <span className="soc-badge badge-critical">14 EXECUTION GAPS</span>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected */}
              <div className="p-3.5 bg-soc-overlay rounded-lg space-y-2">
                <div className="panel-label">Expected Workflow — SOP Standard</div>
                <div className="space-y-1.5">
                  {sopSteps.map((step, i) => (
                    <div key={i} className="flex items-center justify-between px-2.5 py-2 bg-soc-panel border border-soc-border rounded-sm text-xs text-soc-textSecondary">
                      <span>{i + 1}. {step}</span>
                      <span className="w-4 h-4 rounded-sm border border-soc-ok/50 text-soc-ok flex items-center justify-center font-mono text-2xs">
                        ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actual */}
              <div className="p-3.5 bg-soc-overlay rounded-lg space-y-2">
                <div className="panel-label">Actual Observed Execution — SOC-04</div>
                <div className="space-y-1.5">
                  {actualExecution.map((step) => (
                    <div
                      key={step.label}
                      className={`flex items-center justify-between px-2.5 py-2 border rounded-sm text-xs ${
                        step.ok
                          ? 'bg-soc-panel border-soc-border text-soc-textSecondary'
                          : 'bg-soc-critDim border-soc-crit/30 text-soc-crit font-medium'
                      }`}
                    >
                      <span>{step.label}</span>
                      <span
                        className={`w-4 h-4 rounded-sm flex items-center justify-center font-mono text-2xs flex-shrink-0 ${
                          step.ok
                            ? 'border border-soc-ok/50 text-soc-ok'
                            : 'border border-soc-crit/60 text-soc-crit'
                        }`}
                      >
                        {step.ok ? '✓' : '✕'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'GAP FREQUENCY', value: '83 Alerts (74%)', tone: 'text-soc-text' },
                { label: 'SEVERITY', value: 'CRITICAL', tone: 'text-soc-crit' },
                { label: 'AFFECTED SOCS', value: 'SOC-04, SOC-02', tone: 'text-soc-text' },
                { label: 'ASSIGNED ANALYST', value: 'Analyst A-01', tone: 'text-soc-text' },
              ].map((s) => (
                <div key={s.label} className="p-3.5 rounded-lg bg-soc-overlay">
                  <div className="text-[11px] font-medium text-soc-textMuted">{s.label}</div>
                  <div className={`text-sm font-semibold mt-1 ${s.tone}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABHĀVA — Negative Space */}
      {activeTab === 'ABHĀVA' && (
        <div className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <h2 className="panel-label">ABHĀVA — Negative-Space Intelligence</h2>
              <p className="text-xs font-medium text-soc-text mt-0.5">
                &ldquo;What actions should have occurred but didn&apos;t?&rdquo;
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'INVESTIGATIONS', observed: 17, expected: 80, missing: 63, unit: 'investigations' },
                { label: 'ESCALATIONS', observed: 2, expected: 30, missing: 28, unit: 'escalations' },
                { label: 'EVIDENCE LOGS', observed: 21, expected: 75, missing: 54, unit: 'evidence records' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-soc-overlay space-y-2 card-hover">
                  <div className="text-[11px] font-medium text-soc-textMuted">{item.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold text-soc-text tabular-nums">{item.observed}</span>
                    <span className="text-xs text-soc-textMuted">/ {item.expected}</span>
                  </div>
                  <div className="risk-factor-bar">
                    <div className="risk-factor-fill bg-soc-crit" style={{ width: `${(item.observed / item.expected) * 100}%` }} />
                  </div>
                  <div className="text-2xs text-soc-crit font-medium">
                    {item.missing} missing {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIKĀRA — Behaviour */}
      {activeTab === 'VIKĀRA' && (
        <div className="soc-panel">
          <div className="soc-panel-header">
            <div>
              <h2 className="panel-label">VIKĀRA — Behavioural Anomaly Intelligence</h2>
              <p className="text-2xs text-soc-textMuted mt-0.5 font-sans">
                Identifies MTTR manipulation, rapid alert dismissals, and burnout anomalies.
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-soc-overlay rounded-lg space-y-2 font-mono text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-soc-textMuted">NORMAL BASELINE</span>
                  <span className="text-soc-text font-medium">Closure: 35-55 min</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-soc-textMuted">OBSERVED EXECUTION</span>
                  <span className="text-soc-crit font-semibold">Closure: 3-5 min</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-soc-border pt-2">
                  <span className="text-soc-textMuted">Investigation Evidence</span>
                  <span className="text-soc-crit font-semibold">↓ 71%</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-soc-textMuted">Escalation Rate</span>
                  <span className="text-soc-crit font-semibold">↓ 63%</span>
                </div>
              </div>

              {/* Closure Distribution Chart */}
              <div className="p-3 bg-soc-overlay rounded-lg">
                <div className="panel-label mb-2">Closure Dwell Distribution</div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={closureDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                      <XAxis dataKey="range" tick={CHART_TICK} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                      <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(79,168,201,0.06)' }} />
                      <Bar dataKey="observed" fill="rgb(var(--soc-crit))" name="Observed Bursts" />
                      <Bar dataKey="baseline" fill="rgb(var(--soc-low))" name="Human Baseline" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Lifecycle */}
      {activeTab === 'PERFORMANCE' && (
        <div className="soc-panel">
          <div className="soc-panel-header">
            <h2 className="panel-label">Operational Lifecycle Trend (24h)</h2>
            <span className="text-2xs font-mono text-soc-textMuted">SLA BENCHMARKS</span>
          </div>
          <div className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="hour" tick={CHART_TICK} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                  <YAxis tick={CHART_TICK} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="detection" stroke="rgb(var(--soc-ok))" name="Detection %" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="investigation" stroke="rgb(var(--soc-crit))" name="Investigation %" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="escalation" stroke="rgb(var(--soc-med))" name="Escalation %" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* PUNARĀVṚTTI — Threats */}
      {activeTab === 'PUNARĀVṚTTI' && (
        <div className="soc-panel">
          <div className="soc-panel-header">
            <h2 className="panel-label">PUNARĀVṚTTI — Threat Recurrence Intelligence</h2>
            <span className="soc-badge badge-medium">{MOCK_THREAT_RECURRENCE.length} RECURRING</span>
          </div>

          <div className="divide-y divide-soc-border">
            {MOCK_THREAT_RECURRENCE.map((t) => (
              <div key={t.threat_id} className="px-4 py-3 space-y-1.5">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs font-medium text-soc-text">{t.name}</span>
                  <span className="font-mono text-2xs text-soc-crit tabular-nums">RECURRENCE SCORE {t.recurrence_score}/100</span>
                </div>
                <div className="col-mono">
                  INCIDENT CHAIN {t.incident_chain.join(' → ')}
                </div>
                <div className="text-2xs text-soc-textMuted font-mono">
                  RESOLUTION {t.resolution_history}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyst Workload */}
      {activeTab === 'WORKLOAD' && (
        <div className="soc-panel overflow-hidden">
          <div className="soc-panel-header">
            <h2 className="panel-label">Analyst Workload Distribution &amp; Bottlenecks</h2>
            <span className="text-2xs font-mono text-soc-textMuted">SINGLE POINT OF FAILURE DETECTION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>ANALYST</th>
                  <th>CRITICAL CASES</th>
                  <th>ACTIVE CASES</th>
                  <th>MEAN CLOSURE</th>
                  <th>INVESTIGATION RATE</th>
                  <th className="text-right">WORKLOAD STATUS</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WORKLOAD.map((w) => (
                  <tr key={w.analyst_id}>
                    <td className="text-soc-text font-medium">{w.name} <span className="col-mono ml-1">{w.analyst_id}</span></td>
                    <td className="font-mono text-soc-text font-semibold tabular-nums">{w.critical_cases}</td>
                    <td className="font-mono text-soc-textSecondary tabular-nums">{w.active_cases}</td>
                    <td className="col-mono tabular-nums">{w.mean_closure_minutes} min</td>
                    <td className="col-mono tabular-nums">{Math.round(w.investigation_rate * 100)}%</td>
                    <td className="text-right">
                      <span className={`soc-badge ${w.workload_level === 'HIGH' ? 'badge-critical' : w.workload_level === 'NORMAL' ? 'badge-medium' : 'badge-low'}`}>
                        {w.workload_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
