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
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              OPERATIONS
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Alert Explorer
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Raw SOC ingestion telemetry cross-referenced against supervisory investigation records.
          </p>
        </div>
      </div>

      <div className="border border-[#232732] bg-[#0C0E12] font-mono text-xs">
        <div className="p-2.5 border-b border-[#232732] flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#656C7A]" />
            <input
              type="text"
              placeholder="Search alerts, assets, or sources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#060709] border border-[#232732] pl-8 pr-2 py-1 text-white placeholder-[#656C7A] focus:outline-none focus:border-white text-xs"
            />
          </div>
          <span className="text-[#656C7A] text-[10px]">{filtered.length} ALERT RECORDS</span>
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
                <tr key={a.id}>
                  <td className="font-bold text-white">{a.id}</td>
                  <td className="text-[#848B98]">{a.time}</td>
                  <td className="font-bold">
                    <SeverityBadge severity={a.severity as any} />
                  </td>
                  <td className="text-[#9CA3AF]">{a.source}</td>
                  <td className="text-white font-bold">{a.asset}</td>
                  <td className="text-[#9CA3AF]">{a.analyst}</td>
                  <td className="text-white font-mono">{a.incident}</td>
                  <td className="text-right">
                    <span className={a.status.includes('UNINVESTIGATED') ? 'badge-critical' : 'badge-verified'}>
                      [{a.status}]
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
