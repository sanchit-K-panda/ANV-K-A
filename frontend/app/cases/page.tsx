'use client';

import React from 'react';

export default function CasesPage() {
  const cases = [
    { id: 'CASE-2026-089', title: 'SOC-04 Ransomware Execution Gap Incident', assignedTo: 'A. Sharma (Supervisor)', status: 'OPEN', relatedFinding: 'FND-EXEC-001', evidenceCount: 83, auditState: 'VERIFIED' },
    { id: 'CASE-2026-088', title: 'SOC-02 Cobalt Strike Lateral Movement', assignedTo: 'Tier 3 Senior IR', status: 'INVESTIGATING', relatedFinding: 'FND-ABH-003', evidenceCount: 19, auditState: 'VERIFIED' },
    { id: 'CASE-2026-087', title: 'SQL-SRV-02 Kerberoasting Remediation', assignedTo: 'Identity Admin Team', status: 'RESOLVED', relatedFinding: 'FND-PUN-004', evidenceCount: 5, auditState: 'VERIFIED' },
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
              Case Management
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Supervisory case assignments, evidence attachment, and immutable audit tracking.
          </p>
        </div>
      </div>

      <div className="border border-[#232732] bg-[#0C0E12] overflow-x-auto font-mono text-xs">
        <table className="soc-table">
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
              <tr key={c.id}>
                <td className="font-bold text-white">{c.id}</td>
                <td className="text-white font-bold font-sans">{c.title}</td>
                <td className="text-[#9CA3AF]">{c.assignedTo}</td>
                <td className="text-white font-bold">{c.evidenceCount} records</td>
                <td className="text-white font-bold">{c.relatedFinding}</td>
                <td className="text-right">
                  <span className="badge-verified">[VERIFIED]</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
