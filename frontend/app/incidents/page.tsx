'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';

export default function IncidentsPage() {
  const incidents = [
    { id: 'INC-84920', title: 'Ransomware Execution on DC-PROD-01', severity: 'CRITICAL', lifecycle: ['Alert ✓', 'Incident ✓', 'Investigation ✕', 'Escalation ✕', 'Response ✓', 'Resolution ✕'], dwell: '42s (GAMED)' },
    { id: 'INC-84801', title: 'Cobalt Strike C2 Beacon on WORKSTATION-881', severity: 'HIGH', lifecycle: ['Alert ✓', 'Incident ✓', 'Investigation ✓', 'Escalation ✕', 'Response ✓', 'Resolution ✓'], dwell: '12m' },
    { id: 'INC-84220', title: 'Kerberoasting Attack on SQL-SRV-02', severity: 'HIGH', lifecycle: ['Alert ✓', 'Incident ✓', 'Investigation ✓', 'Escalation ✓', 'Response ✕', 'Resolution ✕'], dwell: '48m' },
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
              Incident Explorer & Lifecycle Audit
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Full lifecycle stage tracking from ingestion through investigation, escalation, and resolution.
          </p>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {incidents.map((inc) => (
          <div key={inc.id} className="p-4 bg-[#0C0E12] border border-[#232732] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232732] pb-2">
              <div>
                <span className="text-xs font-bold text-white font-sans">{inc.title}</span>
                <div className="text-[10px] text-[#848B98]">{inc.id}</div>
              </div>
              <SeverityBadge severity={inc.severity as any} />
            </div>

            {/* Lifecycle Flow */}
            <div className="p-2.5 bg-[#060709] border border-[#232732] space-y-1.5">
              <div className="text-[9px] text-[#656C7A] uppercase font-bold">LIFECYCLE AUDIT TRAIL:</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {inc.lifecycle.map((stage, idx) => {
                  const isMissing = stage.includes('✕');
                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold ${
                          isMissing
                            ? 'dashed-gap-box text-white font-bold'
                            : 'bg-[#14171E] text-white border border-[#3A4050]'
                        }`}
                      >
                        {stage}
                      </span>
                      {idx < inc.lifecycle.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-[#656C7A]" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-[#848B98]">
              Dwell Duration: <span className="text-white font-bold">{inc.dwell}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
