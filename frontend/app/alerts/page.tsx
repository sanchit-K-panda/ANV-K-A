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
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Alert Explorer
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
              OPERATIONS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Raw SOC ingestion telemetry cross-referenced against supervisory investigation records.
          </p>
        </div>
      </div>

      <div className="soc-panel overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between font-mono">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts, assets, or sources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2.5 py-1.5 text-slate-900 placeholder-slate-400 rounded text-xs focus:outline-none focus:border-slate-400"
            />
          </div>
          <span className="text-slate-500 text-[10.5px]">{filtered.length} ALERT RECORDS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>ALERT ID</th>
                <th>TIMESTAMP</th>
                <th>SEVERITY</th>
                <th>SOURCE</th>
                <th>ASSET</th>
                <th>ANALYST</th>
                <th>INCIDENT</th>
                <th className="text-right">SUPERVISORY STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-slate-900 font-mono">{a.id}</td>
                  <td className="text-slate-500 font-mono">{a.time}</td>
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={a.severity as any} />
                  </td>
                  <td className="text-slate-700 font-sans">{a.source}</td>
                  <td className="text-slate-900 font-bold font-mono">{a.asset}</td>
                  <td className="text-slate-700 font-sans">{a.analyst}</td>
                  <td className="text-slate-700 font-mono">{a.incident}</td>
                  <td className="text-right whitespace-nowrap">
                    <span className={a.status.includes('UNINVESTIGATED') ? 'badge-critical' : 'badge-verified'}>
                      {a.status}
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
