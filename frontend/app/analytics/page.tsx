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
import { Check, X, BarChart3, Activity, Users, ShieldAlert, Cpu } from 'lucide-react';

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

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      {/* Title Header */}
      <div className="soc-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              MEDHĀ Supervisory Analytics
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
              ANALYTIC ENGINES
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Offline operational intelligence: Execution Gaps, Negative Space, Behavioural Deviations, and Threat Recurrence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Local Inference Engine Active</span>
        </div>
      </div>

      {/* Reusable Enterprise Tabs */}
      <div className="flex flex-wrap gap-1 font-mono text-xs">
        {[
          { id: 'VIVEKA', label: 'Execution Gaps (VIVEKA)' },
          { id: 'ABHĀVA', label: 'Negative Space (ABHĀVA)' },
          { id: 'VIKĀRA', label: 'Behavioural ML (VIKĀRA)' },
          { id: 'PERFORMANCE', label: 'SOC Performance Lifecycle' },
          { id: 'PUNARĀVṚTTI', label: 'Threat Recurrence' },
          { id: 'WORKLOAD', label: 'Analyst Workload Matrix' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 font-semibold rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: VIVEKA — Execution Gaps */}
      {activeTab === 'VIVEKA' && (
        <div className="soc-panel p-5 space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                VIVEKA — Expected vs Actual Operational Workflow
              </h2>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Pinpoints where human analyst actions omitted or bypassed mandatory SOC standard operating procedures.
              </p>
            </div>
            <span className="text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              14 EXECUTION GAPS
            </span>
          </div>

          {/* Visual Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Expected */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
                Expected Workflow (SOP Standard)
              </div>
              <div className="space-y-1.5">
                {['Alert Ingestion', 'Triage & Correlation', 'Mandatory Forensic Investigation', 'Tier 2 Escalation', 'Host & Network Response', 'Supervisory Case Closure'].map((step, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-slate-800">
                    <span className="font-sans font-medium">{i + 1}. {step}</span>
                    <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actual */}
            <div className="p-3.5 bg-slate-50 border border-rose-200 rounded space-y-2">
              <div className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider">
                Actual Observed Execution (SOC-04)
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-slate-800">
                  <span className="font-sans font-medium">1. Alert Ingestion</span>
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-slate-800">
                  <span className="font-sans font-medium">2. Triage &amp; Correlation</span>
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded text-rose-900 font-bold">
                  <span className="font-sans">3. Forensic Investigation (Omitted ✕)</span>
                  <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">✕</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded text-rose-900 font-bold">
                  <span className="font-sans">4. Escalation (Bypassed ✕)</span>
                  <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">✕</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-slate-800">
                  <span className="font-sans font-medium">5. Response (Partial Containment)</span>
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded text-rose-900 font-bold">
                  <span className="font-sans">6. Direct Closure (False Positive Claim ✕)</span>
                  <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">✕</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500 text-[10.5px]">Gap Frequency</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">83 Alerts (74%)</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500 text-[10.5px]">Severity</div>
              <div className="text-sm font-bold text-rose-700 mt-0.5">CRITICAL</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500 text-[10.5px]">Affected SOCs</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">SOC-04, SOC-02</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500 text-[10.5px]">Assigned Analyst</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Analyst A-01</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ABHĀVA — Negative Space */}
      {activeTab === 'ABHĀVA' && (
        <div className="soc-panel p-5 space-y-4 font-mono">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ABHĀVA — Negative-Space Intelligence
            </h2>
            <p className="text-xs font-semibold text-slate-700 font-sans mt-0.5">
              &ldquo;What actions should have occurred but didn&apos;t?&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center space-y-1.5">
              <div className="text-[10.5px] text-slate-500 font-bold uppercase">INVESTIGATIONS</div>
              <div className="text-2xl font-black text-slate-900">17 <span className="text-xs text-slate-400 font-normal">/ 80</span></div>
              <div className="text-xs text-rose-700 font-bold">63 missing investigations</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center space-y-1.5">
              <div className="text-[10.5px] text-slate-500 font-bold uppercase">ESCALATIONS</div>
              <div className="text-2xl font-black text-slate-900">2 <span className="text-xs text-slate-400 font-normal">/ 30</span></div>
              <div className="text-xs text-rose-700 font-bold">28 missing escalations</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center space-y-1.5">
              <div className="text-[10.5px] text-slate-500 font-bold uppercase">EVIDENCE LOGS</div>
              <div className="text-2xl font-black text-slate-900">21 <span className="text-xs text-slate-400 font-normal">/ 75</span></div>
              <div className="text-xs text-rose-700 font-bold">54 missing evidence records</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: VIKĀRA — Behaviour */}
      {activeTab === 'VIKĀRA' && (
        <div className="soc-panel p-5 space-y-4 font-mono">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              VIKĀRA — Behavioural Anomaly Intelligence
            </h2>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Identifies MTTR manipulation, rapid alert dismissals, and burnout anomalies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">NORMAL BASELINE:</span>
                <span className="text-slate-900 font-bold">Closure: 35–55 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OBSERVED EXECUTION:</span>
                <span className="text-rose-700 font-bold">Closure: 3–5 min</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Investigation Evidence:</span>
                <span className="text-rose-700 font-bold">↓ 71%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escalation Rate:</span>
                <span className="text-rose-700 font-bold">↓ 63%</span>
              </div>
            </div>

            {/* Closure Distribution Chart */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-[10.5px] text-slate-700 font-bold mb-1">Closure Dwell Distribution</div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={closureDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', fontSize: '11px' }} />
                    <Bar dataKey="observed" fill="#BE123C" name="Observed Bursts" />
                    <Bar dataKey="baseline" fill="#94A3B8" name="Human Baseline" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Performance Lifecycle */}
      {activeTab === 'PERFORMANCE' && (
        <div className="soc-panel p-5 space-y-4 font-mono">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operational Lifecycle Trend (24h)
            </h2>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" domain={[0, 100]} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', fontSize: '11px' }} />
                <Line type="monotone" dataKey="detection" stroke="#10B981" name="Detection %" strokeWidth={2} />
                <Line type="monotone" dataKey="investigation" stroke="#EF4444" name="Investigation %" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="escalation" stroke="#F59E0B" name="Escalation %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 5: PUNARĀVṚTTI — Threats */}
      {activeTab === 'PUNARĀVṚTTI' && (
        <div className="soc-panel p-5 space-y-4 font-mono">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              PUNARĀVṚTTI — Threat Recurrence Intelligence
            </h2>
          </div>

          <div className="space-y-2.5">
            {MOCK_THREAT_RECURRENCE.map((t) => (
              <div key={t.threat_id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 font-sans">{t.name}</span>
                  <span className="text-rose-700 font-bold text-[10.5px]">Recurrence Score: {t.recurrence_score}/100</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Incident Chain: {t.incident_chain.join(' → ')}
                </div>
                <div className="text-[10.5px] text-slate-500">
                  Resolution: {t.resolution_history}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Analyst Workload */}
      {activeTab === 'WORKLOAD' && (
        <div className="soc-panel p-5 space-y-4 font-mono">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Analyst Workload Distribution &amp; Bottlenecks
            </h2>
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
                    <td className="font-bold text-slate-900">{w.analyst_id} ({w.name})</td>
                    <td className="text-slate-900 font-bold">{w.critical_cases}</td>
                    <td className="text-slate-700">{w.active_cases}</td>
                    <td className="text-slate-500">{w.mean_closure_minutes} min</td>
                    <td className="text-slate-500">{Math.round(w.investigation_rate * 100)}%</td>
                    <td className="text-right">
                      <span
                        className={
                          w.workload_level === 'HIGH'
                            ? 'badge-critical'
                            : w.workload_level === 'NORMAL'
                            ? 'badge-medium'
                            : 'badge-low'
                        }
                      >
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
