'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';

export default function IncidentsPage() {
  const [search, setSearch] = useState('');

  const incidents = [
    { id: 'INC-84920', title: 'Ransomware Shadow Copy Deletion', severity: 'CRITICAL', asset: 'DC-PROD-01', analyst: 'Analyst A-01', dwell: '42s', missing: 'Memory dump omitted', status: 'OPEN' },
    { id: 'INC-84918', title: 'PowerShell Encoded Script Execution', severity: 'HIGH', asset: 'DC-PROD-01', analyst: 'Analyst A-01', dwell: '55s', missing: 'Process tree unanalyzed', status: 'REVIEW' },
    { id: 'INC-84801', title: 'Suspicious Lateral Kerberos Ticket Query', severity: 'HIGH', asset: 'WORKSTATION-881', analyst: 'Analyst A-04', dwell: '18m', missing: 'None', status: 'INVESTIGATING' },
    { id: 'INC-84220', title: 'Outbound C2 Beaconing to Dynamic DNS', severity: 'MEDIUM', asset: 'SQL-SRV-02', analyst: 'Analyst A-02', dwell: '45m', missing: 'None', status: 'RESOLVED' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Incident Lifecycle &amp; Quality Audit
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
              OPERATIONS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Tracking forensic quality, containment dwell times, and omission flags across active and closed incidents.
          </p>
        </div>
      </div>

      <div className="soc-panel overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between font-mono">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incident title, ID, or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2.5 py-1.5 text-slate-900 placeholder-slate-400 rounded text-xs focus:outline-none focus:border-slate-400"
            />
          </div>
          <span className="text-slate-500 text-[10.5px]">{incidents.length} INCIDENT RECORDS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>SEVERITY</th>
                <th>INCIDENT ID</th>
                <th>TITLE</th>
                <th>TARGET ASSET</th>
                <th>ASSIGNED ANALYST</th>
                <th>DWELL TIME</th>
                <th>OMISSION AUDIT</th>
                <th className="text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={inc.severity as any} />
                  </td>
                  <td className="font-bold text-slate-900 font-mono">{inc.id}</td>
                  <td className="font-sans font-bold text-slate-900">{inc.title}</td>
                  <td className="font-mono text-slate-800">{inc.asset}</td>
                  <td className="text-slate-700">{inc.analyst}</td>
                  <td className="font-mono text-slate-500">{inc.dwell}</td>
                  <td className="text-xs">
                    {inc.missing !== 'None' ? (
                      <span className="text-rose-700 font-semibold">{inc.missing}</span>
                    ) : (
                      <span className="text-emerald-700">Nominal</span>
                    )}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <StatusBadge status={inc.status as any} />
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
