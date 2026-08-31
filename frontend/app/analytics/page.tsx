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
import { Check, X } from 'lucide-react';

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
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              MEDHĀ
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Intelligence Analytics
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Offline supervisory engines: Execution Gaps, Negative Space, Behavioural Deviations, and Threat Recurrence.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#232732] pb-2 font-mono text-xs">
        {[
          { id: 'PERFORMANCE', label: 'SOC Performance' },
          { id: 'VIVEKA', label: 'VIVEKA — Execution Gaps' },
          { id: 'ABHĀVA', label: 'ABHĀVA — Negative Space' },
          { id: 'VIKĀRA', label: 'VIKĀRA — Behaviour' },
          { id: 'PUNARĀVṚTTI', label: 'PUNARĀVṚTTI — Threats' },
          { id: 'WORKLOAD', label: 'Analyst Workload' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1 font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'bg-[#0C0E12] text-[#848B98] hover:text-white border border-[#232732]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: SOC Performance */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#0C0E12] border border-[#232732]">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
              Operational Lifecycle Trend (24h)
            </h2>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232732" />
                  <XAxis dataKey="hour" stroke="#656C7A" />
                  <YAxis stroke="#656C7A" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0C0E12', border: '1px solid #232732' }} />
                  <Line type="monotone" dataKey="detection" stroke="#FFFFFF" name="Detection %" strokeWidth={2} />
                  <Line type="monotone" dataKey="investigation" stroke="#848B98" name="Investigation %" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="escalation" stroke="#4A5162" name="Escalation %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: VIVEKA — Execution Gaps */}
      {activeTab === 'VIVEKA' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3">
            <div className="flex justify-between items-center border-b border-[#232732] pb-2">
              <div>
                <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                  VIVEKA — Expected vs Actual Operational Workflow
                </h2>
                <p className="text-[10px] text-[#848B98]">
                  Pinpointing where human analyst actions deviated from mandatory SOP steps
                </p>
              </div>
              <span className="text-white font-bold text-xs bg-[#1C2029] px-2 py-0.5 border border-[#4A5162]">
                14 EXECUTION GAPS
              </span>
            </div>

            {/* Visual Workflow Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected */}
              <div className="p-3 bg-[#060709] border border-[#232732] space-y-2">
                <div className="text-[10px] font-bold text-[#848B98] uppercase tracking-wider">
                  EXPECTED WORKFLOW (SOP STANDARD)
                </div>
                <div className="space-y-1.5">
                  {['Alert Ingestion', 'Triage & Correlation', 'Mandatory Forensic Investigation', 'Tier 2 Escalation', 'Host & Network Response', 'Supervisory Case Closure'].map((step, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-[#0C0E12] border border-[#232732] text-white">
                      <span>{i + 1}. {step}</span>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actual */}
              <div className="p-3 bg-[#060709] border border-[#4A5162] space-y-2">
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">
                  ACTUAL OBSERVED (SOC-04)
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-1.5 bg-[#0C0E12] border border-[#232732] text-white">
                    <span>1. Alert Ingestion</span>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-[#0C0E12] border border-[#232732] text-white">
                    <span>2. Triage & Correlation</span>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 dashed-gap-box text-white font-bold">
                    <span>3. Forensic Investigation (Omitted ✕)</span>
                    <X className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 dashed-gap-box text-white font-bold">
                    <span>4. Escalation (Bypassed ✕)</span>
                    <X className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-[#0C0E12] border border-[#232732] text-white">
                    <span>5. Response (Partial)</span>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 dashed-gap-box text-white font-bold">
                    <span>6. Direct Closure (False Positive Claim ✕)</span>
                    <X className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#232732]">
              <div className="p-2.5 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Gap Frequency</div>
                <div className="text-sm font-bold text-white mt-0.5">83 Alerts (74%)</div>
              </div>
              <div className="p-2.5 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Gap Severity</div>
                <div className="text-sm font-bold text-white mt-0.5">CRITICAL</div>
              </div>
              <div className="p-2.5 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Affected SOCs</div>
                <div className="text-sm font-bold text-white mt-0.5">SOC-04, SOC-02</div>
              </div>
              <div className="p-2.5 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Affected Analysts</div>
                <div className="text-sm font-bold text-white mt-0.5">12 Analysts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ABHĀVA — Negative Space */}
      {activeTab === 'ABHĀVA' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3">
            <div className="border-b border-[#232732] pb-2">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                ABHĀVA — Negative-Space Intelligence
              </h2>
              <p className="text-xs font-semibold text-white font-sans mt-0.5">
                &ldquo;What should have happened but didn&apos;t?&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#060709] border border-[#232732] text-center space-y-1.5">
                <div className="text-[10px] text-[#656C7A] font-bold uppercase">INVESTIGATIONS</div>
                <div className="text-xl font-bold text-white">17 <span className="text-xs text-[#656C7A]">/ 80</span></div>
                <div className="text-[11px] text-white font-bold">63 missing investigations</div>
              </div>

              <div className="p-3.5 bg-[#060709] border border-[#232732] text-center space-y-1.5">
                <div className="text-[10px] text-[#656C7A] font-bold uppercase">ESCALATIONS</div>
                <div className="text-xl font-bold text-white">2 <span className="text-xs text-[#656C7A]">/ 30</span></div>
                <div className="text-[11px] text-white font-bold">28 missing escalations</div>
              </div>

              <div className="p-3.5 bg-[#060709] border border-[#232732] text-center space-y-1.5">
                <div className="text-[10px] text-[#656C7A] font-bold uppercase">EVIDENCE RECORDS</div>
                <div className="text-xl font-bold text-white">21 <span className="text-xs text-[#656C7A]">/ 75</span></div>
                <div className="text-[11px] text-white font-bold">54 missing evidence records</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: VIKĀRA — Behaviour */}
      {activeTab === 'VIKĀRA' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3">
            <div className="border-b border-[#232732] pb-2">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                VIKĀRA — Behavioural Anomaly Intelligence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[#060709] border border-[#232732] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#656C7A]">NORMAL BASELINE:</span>
                  <span className="text-white font-bold">Closure: 35–55 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">OBSERVED:</span>
                  <span className="text-white font-bold">Closure: 3–5 min</span>
                </div>
                <div className="flex justify-between border-t border-[#1C2029] pt-1.5">
                  <span className="text-[#848B98]">Investigation Evidence:</span>
                  <span className="text-white font-bold">↓ 71%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#848B98]">Escalation Rate:</span>
                  <span className="text-white font-bold">↓ 63%</span>
                </div>
              </div>

              {/* Closure Distribution Chart */}
              <div className="p-3 bg-[#060709] border border-[#232732]">
                <div className="text-[10px] text-white font-bold mb-1">Closure Dwell Distribution</div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={closureDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#232732" />
                      <XAxis dataKey="range" stroke="#656C7A" />
                      <YAxis stroke="#656C7A" />
                      <Tooltip contentStyle={{ backgroundColor: '#0C0E12', border: '1px solid #232732' }} />
                      <Bar dataKey="observed" fill="#FFFFFF" name="Observed Bursts" />
                      <Bar dataKey="baseline" fill="#4A5162" name="Human Baseline" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: PUNARĀVṚTTI — Threats */}
      {activeTab === 'PUNARĀVṚTTI' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3">
            <div className="border-b border-[#232732] pb-2">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                PUNARĀVṚTTI — Threat Recurrence Intelligence
              </h2>
            </div>

            <div className="space-y-2">
              {MOCK_THREAT_RECURRENCE.map((t) => (
                <div key={t.threat_id} className="p-3 bg-[#060709] border border-[#232732] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-sans">{t.name}</span>
                    <span className="text-white font-bold text-[10px]">Score: {t.recurrence_score}/100</span>
                  </div>
                  <div className="text-[10px] text-[#848B98]">
                    Incident Chain: {t.incident_chain.join(' → ')}
                  </div>
                  <div className="text-[10px] text-[#656C7A]">
                    Resolution: {t.resolution_history}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Analyst Workload */}
      {activeTab === 'WORKLOAD' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3">
            <div className="border-b border-[#232732] pb-2">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                Analyst Workload Distribution & Bottlenecks
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
                      <td className="font-bold text-white">{w.analyst_id} ({w.name})</td>
                      <td className="text-white font-bold">{w.critical_cases}</td>
                      <td className="text-white">{w.active_cases}</td>
                      <td className="text-[#848B98]">{w.mean_closure_minutes} min</td>
                      <td className="text-[#848B98]">{Math.round(w.investigation_rate * 100)}%</td>
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
                          [{w.workload_level}]
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
