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
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>CASES</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Case Management &amp; Supervisory Action</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Supervisory case assignments, evidence attachment, and immutable audit tracking.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {cases.length} open cases
        </span>
      </div>

      {/* Case register */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">Case Register</span>
            <p className="text-2xs text-soc-textMuted mt-0.5">Supervisory assignments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Case title</th>
                <th>Assigned supervisor</th>
                <th>Status</th>
                <th>Evidence items</th>
                <th>Supervisory finding</th>
                <th className="text-right">Audit integrity</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td className="col-mono text-soc-text">{c.id}</td>
                  <td className="text-soc-text font-medium">{c.title}</td>
                  <td className="text-soc-textSecondary">{c.assignedTo}</td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={c.status as any} />
                  </td>
                  <td className="font-mono text-2xs text-soc-text tabular-nums">
                    {c.evidenceCount} <span className="text-soc-textMuted">records</span>
                  </td>
                  <td className="col-mono text-soc-text">{c.relatedFinding}</td>
                  <td className="text-right whitespace-nowrap">
                    <span className="soc-badge badge-verified">{c.auditState}</span>
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
