'use client';

import React, { useEffect, useState } from 'react';
import { fetchWorkloadAnalytics } from '@/lib/api';
import type { AnalystWorkloadItem } from '@/types';

export default function WorkloadPage() {
  const [items, setItems] = useState<AnalystWorkloadItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchWorkloadAnalytics('analyst_overload')
      .then((data) => { if (alive) setItems(data); })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : 'Backend unreachable'); });
    return () => { alive = false; };
  }, []);

  const loading = items === null && !error;

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>WORKLOAD</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Analyst Workload &amp; Capacity</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Supervisory monitoring of alert fatigue, rapid-closure anomalies, and ticket concentration.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {items ? `${items.length} analysts on shift` : '—'}
        </span>
      </div>

      {loading && (
        <div className="soc-panel p-8 text-center text-xs font-mono text-soc-textMuted animate-pulse">
          LOADING WORKLOAD MATRIX…
        </div>
      )}

      {error && (
        <div className="soc-panel p-8 text-center">
          <p className="text-xs font-mono text-red-500 mb-2">BACKEND UNREACHABLE — {error}</p>
          <p className="text-2xs text-soc-textMuted">
            This screen renders only backend-sourced workload data.
          </p>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="soc-panel p-8 text-center text-xs font-mono text-soc-textMuted">
          NO WORKLOAD DATA AVAILABLE for this scenario.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="soc-panel-header">
            <div>
              <span className="panel-label">Capacity Matrix</span>
              <p className="text-2xs text-soc-textMuted mt-0.5">Tier assignment load</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Analyst</th>
                  <th>Role</th>
                  <th>Critical cases</th>
                  <th>Critical share</th>
                  <th>Mean closure</th>
                  <th>Investigation rate</th>
                  <th className="text-right">Workload status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.analyst_id}>
                    <td className="text-soc-text font-medium">
                      {w.name} <span className="col-mono">({w.analyst_id})</span>
                    </td>
                    <td className="text-soc-textSecondary">{w.role}</td>
                    <td className="font-mono text-2xs text-soc-text tabular-nums">{w.critical_incidents}</td>
                    <td className="font-mono text-2xs text-soc-textSecondary tabular-nums">
                      {Math.round(w.critical_case_share * 100)}%
                    </td>
                    <td className="col-mono">{w.mean_closure_minutes} min</td>
                    <td className="font-mono text-2xs text-soc-text tabular-nums">
                      {Math.round(w.investigation_rate * 100)}%
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <span className={`soc-badge ${w.is_bottleneck ? 'badge-critical' : 'badge-ok'}`}>
                        {w.is_bottleneck ? 'BOTTLENECK' : 'BALANCED'}
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
