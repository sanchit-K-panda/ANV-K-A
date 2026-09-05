'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';

export default function AlertsPage() {
  const [search, setSearch] = useState('');

  const alerts = [
    { id: 'ALT-99201', time: '10:31:02', severity: 'CRITICAL', source: 'CrowdStrike EDR', asset: 'DC-PROD-01', analyst: 'A-01', incident: 'INC-84920', status: 'CLOSED_UNINVESTIGATED' },
    { id: 'ALT-99184', time: '10:28:15', severity: 'CRITICAL', source: 'Windows Event Log', asset: 'DC-PROD-01', analyst: 'A-01', incident: 'INC-84918', status: 'CLOSED_UNINVESTIGATED' },
    { id: 'ALT-99150', time: '10:24:40', severity: 'HIGH', source: 'Suricata NIDS', asset: 'WORKSTATION-881', analyst: 'A-04', incident: 'INC-84801', status: 'OPEN' },
    { id: 'ALT-99088', time: '10:18:10', severity: 'HIGH', source: 'Palo Alto FW', asset: 'SQL-SRV-02', analyst: 'A-02', incident: 'INC-84220', status: 'ESCALATED' },
    { id: 'ALT-98912', time: '10:05:00', severity: 'MEDIUM', source: 'Okta Identity', asset: 'AUTH-NODE-01', analyst: 'A-03', incident: 'INC-83900', status: 'INVESTIGATING' },
  ];

  const filtered = alerts.filter(
    (a) =>
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.asset.toLowerCase().includes(search.toLowerCase()) ||
      a.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>ALERTS</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Alert Explorer</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Raw SOC ingestion telemetry cross-referenced against supervisory investigation records.
          </p>
        </div>
      </div>

      {/* Alert queue */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">Alert Queue</span>
            <p className="text-2xs text-soc-textMuted mt-0.5">Raw telemetry from connected sources</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-soc-textMuted pointer-events-none" />
              <input
                type="text"
                placeholder="Search alerts, assets, or sources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="soc-input pl-8"
              />
            </div>
            <span className="font-mono text-2xs text-soc-textMuted tabular-nums whitespace-nowrap">
              {filtered.length} alert records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Asset</th>
                <th>Analyst</th>
                <th>Incident</th>
                <th className="text-right">Supervisory status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="col-mono text-soc-text">{a.id}</td>
                  <td className="col-mono">{a.time}</td>
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={a.severity as any} />
                  </td>
                  <td className="text-soc-textSecondary">{a.source}</td>
                  <td className="font-mono text-2xs text-soc-text tabular-nums">{a.asset}</td>
                  <td className="font-mono text-2xs text-soc-textSecondary tabular-nums">{a.analyst}</td>
                  <td className="col-mono">{a.incident}</td>
                  <td className="text-right whitespace-nowrap">
                    <span className={`soc-badge ${a.status.includes('UNINVESTIGATED') ? 'badge-critical' : 'badge-verified'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="panel-label mb-1">No matching alerts</div>
                    <p className="text-xs text-soc-textMuted">Adjust the search query to match alert ID, asset, or source.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
