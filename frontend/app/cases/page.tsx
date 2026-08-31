'use client';

import React from 'react';
import { StatusBadge } from '@/components/StatusBadge';

export default function CasesPage() {
  const cases = [
    { id: 'CASE-2026-089', title: 'SOC-04 Ransomware Execution Gap Incident', assignedTo: 'Dr. A. Sharma (Supervisor)', status: 'OPEN', relatedFinding: 'FND-EXEC-001', evidenceCount: 83, auditState: 'VERIFIED' },
    { id: 'CASE-2026-088', title: 'SOC-02 Cobalt Strike Lateral Movement', assignedTo: 'Tier 3 Senior IR', status: 'INVESTIGATING', relatedFinding: 'FND-ABH-003', evidenceCount: 19, auditState: 'VERIFIED' },
    { id: 'CASE-2026-087', title: 'SQL-SRV-02 Kerberoasting Remediation', assignedTo: 'Identity Admin Team', status: 'RESOLVED', relatedFinding: 'FND-PUN-004', evidenceCount: 5, auditState: 'VERIFIED' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Case Management &amp; Supervisory Action
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              OPERATIONS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Supervisory case assignments, evidence attachment, and immutable audit tracking.
          </p>
        </div>
      </div>

      <div className="soc-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>CASE TITLE</th>
                <th>ASSIGNED SUPERVISOR</th>
                <th>EVIDENCE ITEMS</th>
                <th>SUPERVISORY FINDING</th>
                <th className="text-right">AUDIT INTEGRITY</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-slate-900 font-mono">{c.id}</td>
                  <td className="text-slate-900 font-bold font-sans">{c.title}</td>
                  <td className="text-slate-600 font-sans">{c.assignedTo}</td>
                  <td className="text-slate-900 font-bold">{c.evidenceCount} records</td>
                  <td className="text-slate-900 font-bold font-mono">{c.relatedFinding}</td>
                  <td className="text-right whitespace-nowrap">
                    <span className="badge-verified">VERIFIED</span>
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
