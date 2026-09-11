'use client';

import React, { useEffect, useState } from 'react';
import { fetchThreatRecurrence, fetchWorkloadAnalytics } from '@/lib/api';
import type { AnalystWorkloadItem, ThreatRecurrenceItem } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
};

/**
 * Analytics page (REMEDIATION.md P1-6 migration).
 *
 * Evidence-first: the PUNARĀVṚTTI and WORKLOAD tabs render backend data from
 * /api/analytics/threats and /api/analytics/workload. Tabs without a live backend
 * source (VIVEKA / ABHĀVA / VIKĀRA narrative panels, PERFORMANCE 24h trend) were
 * removed rather than fabricating numbers — the same intel is available with real
 * data on /findings, /threats, /workload and /supervision.
 */
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'PUNARĀVṚTTI' | 'WORKLOAD'>('PUNARĀVṚTTI');

  const [threats, setThreats] = useState<ThreatRecurrenceItem[] | null>(null);
  const [threatsError, setThreatsError] = useState<string | null>(null);
  const [workload, setWorkload] = useState<AnalystWorkloadItem[] | null>(null);
  const [workloadError, setWorkloadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchThreatRecurrence('recurring_threat')
      .then((d) => { if (alive) setThreats(d); })
      .catch((e) => { if (alive) setThreatsError(e instanceof Error ? e.message : 'Backend unreachable'); });
    fetchWorkloadAnalytics('analyst_overload')
      .then((d) => { if (alive) setWorkload(d); })
      .catch((e) => { if (alive) setWorkloadError(e instanceof Error ? e.message : 'Backend unreachable'); });
    return () => { alive = false; };
  }, []);

  const tabs = [
    { id: 'PUNARĀVṚTTI', label: 'Threat Recurrence (PUNARĀVṚTTI)' },
    { id: 'WORKLOAD', label: 'Analyst Workload Matrix' },
  ] as const;

  const closureData = (workload ?? [])
    .slice(0, 8)
    .map((w) => ({
      analyst: w.analyst_id.replace(/^ANA-/, ''),
      minutes: w.mean_closure_minutes,
      critical: w.critical_incidents ?? 0,
    }));

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
            Offline operational intelligence over live scenario telemetry — every value backend-sourced.
          </p>
        </div>

        <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" aria-hidden="true" />
          <span>LOCAL INFERENCE ENGINE ACTIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`px-3 py-1.5 text-2xs font-mono tracking-wide rounded-md border transition-colors ${
              activeTab === tab.id
                ? 'bg-soc-accentInk border-soc-accent/50 text-soc-accentBright'
                : 'bg-transparent border-soc-border text-soc-textSecondary hover:text-soc-text hover:bg-soc-raised'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PUNARĀVṚTTI — Threats */}
      {activeTab === 'PUNARĀVṚTTI' && (
        <div className="soc-panel">
          <div className="soc-panel-header">
            <h2 className="panel-label">PUNARĀVṚTTI — Threat Recurrence Intelligence</h2>
            <span className="soc-badge badge-medium">
              {threats ? `${threats.length} RECURRING` : '—'}
            </span>
          </div>

          {threatsError && (
            <div className="p-6 text-center text-xs font-mono text-red-500">
              BACKEND UNREACHABLE — {threatsError}
            </div>
          )}
          {!threatsError && threats === null && (
            <div className="p-6 text-center text-xs font-mono text-soc-textMuted animate-pulse">
              LOADING THREAT TELEMETRY…
            </div>
          )}
          {threats && threats.length === 0 && (
            <div className="p-6 text-center text-xs font-mono text-emerald-500">
              ✓ No recurring threats observed in the current dataset.
            </div>
          )}
          {threats && threats.length > 0 && (
            <div className="divide-y divide-soc-border">
              {threats.map((t) => (
                <div key={t.threat_id} className="px-4 py-3 space-y-1.5">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-xs font-medium text-soc-text">{t.name}</span>
                    <span className={`soc-badge ${t.remediation_applied ? 'badge-ok' : 'badge-critical'}`}>
                      {t.remediation_applied ? 'REMEDIATED' : 'NOT REMEDIATED'}
                    </span>
                  </div>
                  <div className="col-mono">
                    {t.threat_id} · {t.incident_count} incident{t.incident_count === 1 ? '' : 's'} · {t.affected_assets.length} asset{t.affected_assets.length === 1 ? '' : 's'}
                  </div>
                  <div className="text-2xs text-soc-textMuted font-mono">
                    STATUS {t.all_closed ? 'ALL INCIDENTS CLOSED' : 'INCIDENTS REMAIN OPEN'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKLOAD */}
      {activeTab === 'WORKLOAD' && (
        <div className="soc-panel overflow-hidden">
          <div className="soc-panel-header">
            <h2 className="panel-label">Analyst Workload Distribution &amp; Bottlenecks</h2>
            <span className="text-2xs font-mono text-soc-textMuted">SINGLE POINT OF FAILURE DETECTION</span>
          </div>

          {workloadError && (
            <div className="p-6 text-center text-xs font-mono text-red-500">
              BACKEND UNREACHABLE — {workloadError}
            </div>
          )}
          {!workloadError && workload === null && (
            <div className="p-6 text-center text-xs font-mono text-soc-textMuted animate-pulse">
              LOADING WORKLOAD MATRIX…
            </div>
          )}
          {workload && workload.length === 0 && (
            <div className="p-6 text-center text-xs font-mono text-soc-textMuted">
              No workload data available for this scenario.
            </div>
          )}
          {workload && workload.length > 0 && (
            <>
              {/* Mean-closure comparison derived from the same backend rows */}
              <div className="p-4 pb-0">
                <div className="panel-label mb-2">Mean Closure Minutes per Analyst</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={closureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                      <XAxis dataKey="analyst" tick={CHART_TICK} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                      <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(79,168,201,0.06)' }} />
                      <Bar dataKey="minutes" fill="rgb(var(--soc-accent))" name="Mean closure (min)" />
                      <Bar dataKey="critical" fill="rgb(var(--soc-crit))" name="Critical cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="soc-table">
                  <thead>
                    <tr>
                      <th>ANALYST</th>
                      <th>ROLE</th>
                      <th>CRITICAL CASES</th>
                      <th>CRITICAL SHARE</th>
                      <th>MEAN CLOSURE</th>
                      <th>INVESTIGATION RATE</th>
                      <th className="text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workload.map((w) => (
                      <tr key={w.analyst_id}>
                        <td className="text-soc-text font-medium">{w.name} <span className="col-mono ml-1">{w.analyst_id}</span></td>
                        <td className="text-soc-textSecondary">{w.role}</td>
                        <td className="font-mono text-soc-text font-semibold tabular-nums">{w.critical_incidents}</td>
                        <td className="font-mono text-soc-textSecondary tabular-nums">{Math.round(w.critical_case_share * 100)}%</td>
                        <td className="col-mono tabular-nums">{w.mean_closure_minutes} min</td>
                        <td className="col-mono tabular-nums">{Math.round(w.investigation_rate * 100)}%</td>
                        <td className="text-right">
                          <span className={`soc-badge ${w.is_bottleneck ? 'badge-critical' : 'badge-ok'}`}>
                            {w.is_bottleneck ? 'BOTTLENECK' : 'BALANCED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
