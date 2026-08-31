'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const RiskContributionBreakdown: React.FC = () => {
  const factors = [
    { name: 'Investigation Gap (VIVEKA)', score: 31, color: '#BE123C', percent: 34 },
    { name: 'Escalation Anomaly', score: 24, color: '#B45309', percent: 26 },
    { name: 'Negative Space Omission (ABHĀVA)', score: 18, color: '#854D0E', percent: 20 },
    { name: 'Closure Speed MTTR Gaming (VIKĀRA)', score: 11, color: '#475569', percent: 12 },
    { name: 'Threat Recurrence (PUNARĀVṚTTI)', score: 7, color: '#64748B', percent: 8 },
  ];

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Risk Contribution Infographic (91 / 100)
          </h3>
        </div>
        <span className="text-[10.5px] text-slate-500">MĀN MATHEMATICAL DECOMPOSITION</span>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
        {factors.map((f) => (
          <div
            key={f.name}
            style={{ width: `${f.percent}%`, backgroundColor: f.color }}
            title={`${f.name}: +${f.score} pts (${f.percent}%)`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 text-xs">
        {factors.map((f) => (
          <div key={f.name} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
              <span className="truncate text-slate-700 font-sans">{f.name}</span>
            </div>
            <span className="font-bold text-slate-900 font-mono flex-shrink-0">+{f.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
