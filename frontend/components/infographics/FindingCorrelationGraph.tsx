'use client';

import React from 'react';
import { ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

export const FindingCorrelationGraph: React.FC = () => {
  const nodes = [
    { type: 'RAW ALERT', label: 'ALT-99201', sub: 'vssadmin delete', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { type: 'INCIDENT', label: 'INC-84920', sub: 'DC-PROD-01', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { type: 'ANALYST', label: 'Analyst A-01', sub: '42s dwell time', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { type: 'OMISSION', label: '0 Dumps', sub: 'Memory skipped', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    { type: 'THREAT', label: 'T-0042', sub: 'Repeat Ransomware', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    { type: 'FINDING', label: 'FND-EXEC-001', sub: 'Score: 91/100', color: 'bg-rose-600 text-white border-rose-600' },
  ];

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Finding Correlation Graph (Alert ➔ Finding Provenance)
          </h3>
        </div>
        <span className="text-[10.5px] text-slate-500">MĀN CORRELATION ENGINE</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {nodes.map((n, idx) => (
          <React.Fragment key={n.label}>
            <div className={`p-3 rounded border text-center flex-1 min-w-[120px] ${n.color}`}>
              <div className="text-[9.5px] uppercase font-bold tracking-wider opacity-75">{n.type}</div>
              <div className="text-xs font-bold font-mono mt-0.5">{n.label}</div>
              <div className="text-[10px] mt-0.5 opacity-90">{n.sub}</div>
            </div>
            {idx < nodes.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
