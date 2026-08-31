'use client';

import React from 'react';
import { SeverityBadge } from '@/components/SeverityBadge';

export default function InvestigationsPage() {
  const queue = [
    { id: 'INV-2026-001', title: 'DC-PROD-01 Memory Forensics', analyst: 'Analyst A-01', priority: 'CRITICAL', duration: '42s', evidenceCount: 0, escalation: 'BYPASSED', finding: 'FND-EXEC-001' },
    { id: 'INV-2026-002', title: 'WORKSTATION-881 Beacon Triage', analyst: 'Analyst A-02', priority: 'HIGH', duration: '34m', evidenceCount: 6, escalation: 'TIER-3-PENDING', finding: 'FND-ABH-003' },
    { id: 'INV-2026-003', title: 'SQL-SRV-02 Kerberos Audit', analyst: 'Analyst A-03', priority: 'HIGH', duration: '52m', evidenceCount: 14, escalation: 'RESOLVED', finding: 'FND-PUN-004' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Investigation Case Queue Audit
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              OPERATIONS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Audit of assigned analyst cases, active duration, forensic evidence counts, and escalation integrity.
          </p>
        </div>
      </div>

      <div className="soc-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>INVESTIGATION TITLE</th>
                <th>ANALYST</th>
                <th>PRIORITY</th>
                <th>DURATION</th>
                <th>EVIDENCE ITEMS</th>
                <th>ESCALATION</th>
                <th className="text-right">FINDING REF</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-slate-900 font-mono">{q.id}</td>
                  <td className="text-slate-900 font-bold font-sans">{q.title}</td>
                  <td className="text-slate-600 font-sans">{q.analyst}</td>
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={q.priority as any} />
                  </td>
                  <td className={q.duration === '42s' ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                    {q.duration}
                  </td>
                  <td className={q.evidenceCount === 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}>
                    {q.evidenceCount} records
                  </td>
                  <td className="text-slate-600">{q.escalation}</td>
                  <td className="text-right font-bold text-slate-900 font-mono">{q.finding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
