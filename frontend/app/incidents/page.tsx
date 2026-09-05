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
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>INCIDENTS</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Incident Lifecycle &amp; Quality Audit</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Tracking forensic quality, containment dwell times, and omission flags across active and closed incidents.
          </p>
        </div>
      </div>

      {/* Incident table */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">Incident Register</span>
            <p className="text-2xs text-soc-textMuted mt-0.5">Active and closed incidents</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-soc-textMuted pointer-events-none" />
              <input
                type="text"
                placeholder="Search incident title, ID, or asset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="soc-input pl-8"
              />
            </div>
            <span className="font-mono text-2xs text-soc-textMuted tabular-nums whitespace-nowrap">
              {incidents.length} incident records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Incident ID</th>
                <th>Title</th>
                <th>Target asset</th>
                <th>Assigned analyst</th>
                <th>Dwell time</th>
                <th>Omission audit</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={inc.severity as any} />
                  </td>
                  <td className="col-mono text-soc-text">{inc.id}</td>
                  <td className="text-soc-text font-medium">{inc.title}</td>
                  <td className="font-mono text-2xs text-soc-textSecondary tabular-nums">{inc.asset}</td>
                  <td className="text-soc-textSecondary">{inc.analyst}</td>
                  <td className="col-mono">{inc.dwell}</td>
                  <td className="whitespace-nowrap">
                    {inc.missing !== 'None' ? (
                      <span className="text-xs text-soc-crit font-medium">{inc.missing}</span>
                    ) : (
                      <span className="text-xs text-soc-ok">Nominal</span>
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
