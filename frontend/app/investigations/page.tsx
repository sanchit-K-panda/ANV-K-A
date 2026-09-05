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
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>INVESTIGATIONS</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Investigation Case Queue Audit</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Audit of assigned analyst cases, active duration, forensic evidence counts, and escalation integrity.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {queue.length} active investigations
        </span>
      </div>

      {/* Investigation queue */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">Investigation Queue</span>
            <p className="text-2xs text-soc-textMuted mt-0.5">Assigned case audit</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Investigation title</th>
                <th>Analyst</th>
                <th>Priority</th>
                <th>Duration</th>
                <th>Evidence items</th>
                <th>Escalation</th>
                <th className="text-right">Finding ref</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.id}>
                  <td className="col-mono text-soc-text">{q.id}</td>
                  <td className="text-soc-text font-medium">{q.title}</td>
                  <td className="text-soc-textSecondary">{q.analyst}</td>
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={q.priority as any} />
                  </td>
                  <td className={q.duration === '42s' ? 'col-mono text-soc-crit font-semibold' : 'col-mono'}>
                    {q.duration}
                  </td>
                  <td className="font-mono text-2xs tabular-nums">
                    <span className={q.evidenceCount === 0 ? 'text-soc-crit font-semibold' : 'text-soc-text'}>
                      {q.evidenceCount}
                    </span>{' '}
                    <span className="text-soc-textMuted">records</span>
                  </td>
                  <td className="font-mono text-2xs text-soc-textSecondary">{q.escalation}</td>
                  <td className="text-right col-mono text-soc-text">{q.finding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
