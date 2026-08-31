'use client';

import React from 'react';
import { SeverityBadge } from '@/components/SeverityBadge';

export default function InvestigationsPage() {
  const queue = [
    { id: 'INV-2026-001', title: 'DC-PROD-01 Memory Forensics', analyst: 'A-01', priority: 'CRITICAL', duration: '42s', evidenceCount: 0, escalation: 'BYPASSED', finding: 'FND-EXEC-001' },
    { id: 'INV-2026-002', title: 'WORKSTATION-881 Beacon Triage', analyst: 'A-02', priority: 'HIGH', duration: '34m', evidenceCount: 6, escalation: 'TIER-3-PENDING', finding: 'FND-ABH-003' },
    { id: 'INV-2026-003', title: 'SQL-SRV-02 Kerberos Audit', analyst: 'A-03', priority: 'HIGH', duration: '52m', evidenceCount: 14, escalation: 'RESOLVED', finding: 'FND-PUN-004' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              OPERATIONS
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Investigation Case Queue Audit
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Audit of assigned analyst cases, active duration, forensic evidence counts, and escalation integrity.
          </p>
        </div>
      </div>

      <div className="border border-[#232732] bg-[#0C0E12] overflow-x-auto font-mono text-xs">
        <table className="soc-table">
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
              <tr key={q.id}>
                <td className="font-bold text-white">{q.id}</td>
                <td className="text-white font-bold font-sans">{q.title}</td>
                <td className="text-[#9CA3AF]">{q.analyst}</td>
                <td>
                  <SeverityBadge severity={q.priority as any} />
                </td>
                <td className={q.duration === '42s' ? 'text-white font-bold' : 'text-[#9CA3AF]'}>
                  {q.duration}
                </td>
                <td className={q.evidenceCount === 0 ? 'text-white font-bold' : 'text-white'}>
                  {q.evidenceCount} records
                </td>
                <td className="text-[#9CA3AF]">{q.escalation}</td>
                <td className="text-right text-white font-bold">{q.finding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
