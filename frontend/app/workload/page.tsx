'use client';

import React from 'react';
import { MOCK_WORKLOAD } from '@/lib/mockData';

export default function WorkloadPage() {
  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>WORKLOAD</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Analyst Workload &amp; Capacity</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Supervisory monitoring of alert fatigue, rapid-closure anomalies, and ticket concentration.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {MOCK_WORKLOAD.length} analysts on shift
        </span>
      </div>

      {/* Workload table */}
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
                <th>Active cases</th>
                <th>Mean closure</th>
                <th>Investigation rate</th>
                <th className="text-right">Workload status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_WORKLOAD.map((w) => (
                <tr key={w.analyst_id}>
                  <td className="text-soc-text font-medium">
                    {w.name} <span className="col-mono">({w.analyst_id})</span>
                  </td>
                  <td className="text-soc-textSecondary">{w.role}</td>
                  <td className="font-mono text-2xs text-soc-text tabular-nums">{w.critical_cases}</td>
                  <td className="font-mono text-2xs text-soc-textSecondary tabular-nums">{w.active_cases}</td>
                  <td className="col-mono">{w.mean_closure_minutes} min</td>
                  <td className="font-mono text-2xs text-soc-text tabular-nums">
                    {Math.round(w.investigation_rate * 100)}%
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <span
                      className={`soc-badge ${
                        w.workload_level === 'HIGH'
                          ? 'badge-critical'
                          : w.workload_level === 'NORMAL'
                          ? 'badge-ok'
                          : 'badge-low'
                      }`}
                    >
                      {w.workload_level}
                      {w.is_bottleneck ? ' · BOTTLENECK' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
