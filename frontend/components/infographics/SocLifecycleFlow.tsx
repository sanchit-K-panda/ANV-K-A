'use client';

import React from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

export const SocLifecycleFlow: React.FC = () => {
  const lifecycle = [
    { stage: 'Alert', expected: '100% Ingested', actual: '100% Ingested', pass: true },
    { stage: 'Triage', expected: 'Classification in <2m', actual: 'Classified in 16s', pass: true },
    { stage: 'Investigation', expected: '85% Forensic Memory Check', actual: '11% Checked (74% Drop)', pass: false },
    { stage: 'Escalation', expected: '30% Tier-2 Route', actual: '7% Routed (Bypassed)', pass: false },
    { stage: 'Response', expected: 'Host Isolation in <5m', actual: 'Partial (No Host Isolation)', pass: false },
    { stage: 'Resolution', expected: 'Human Verification', actual: 'Rapid False-Positive Claim', pass: false },
  ];

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
          SOC Lifecycle Infographic: Expected vs Observed Path
        </h3>
        <span className="text-[10.5px] text-slate-400">END-TO-END AUDIT</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {lifecycle.map((item, i) => (
          <div
            key={item.stage}
            className={`p-3 rounded border space-y-1.5 ${
              item.pass ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 font-sans">{item.stage}</span>
              {item.pass ? (
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
              ) : (
                <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✕
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">
              Expected: <strong className="text-slate-700 font-mono">{item.expected}</strong>
            </div>
            <div className={`text-[10.5px] font-bold font-mono ${item.pass ? 'text-emerald-700' : 'text-rose-700'}`}>
              {item.actual}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
