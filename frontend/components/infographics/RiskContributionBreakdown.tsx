'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const RiskContributionBreakdown: React.FC = () => {
  const factors = [
    { name: 'Investigation Gap (VIVEKA)', score: 31, color: 'rgb(var(--soc-crit))', percent: 34 },
    { name: 'Escalation Anomaly', score: 24, color: 'rgb(var(--soc-high))', percent: 26 },
    { name: 'Negative Space Omission (ABHĀVA)', score: 18, color: 'rgb(var(--soc-med))', percent: 20 },
    { name: 'Closure Speed MTTR Gaming (VIKĀRA)', score: 11, color: 'rgb(var(--soc-low))', percent: 12 },
    { name: 'Threat Recurrence (PUNARĀVṚTTI)', score: 7, color: 'rgb(var(--soc-textDim))', percent: 8 },
  ];

  return (
    <div className="soc-panel space-y-3 p-5 font-mono select-none">
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-soc-crit" aria-hidden="true" />
          <h3 className="panel-label">Risk Contribution Infographic (91 / 100)</h3>
        </div>
        <span className="text-2xs uppercase tracking-[0.14em] text-soc-textDim">MĀN Mathematical Decomposition</span>
      </div>

      {/* Stacked Contribution Bar */}
      <div className="flex h-2.5 w-full overflow-hidden bg-soc-raised">
        {factors.map((f) => (
          <div
            key={f.name}
            style={{ width: `${f.percent}%`, backgroundColor: f.color }}
            title={`${f.name}: +${f.score} pts (${f.percent}%)`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {factors.map((f) => (
          <div key={f.name} className="flex items-center justify-between rounded-md border border-soc-border bg-soc-overlay p-2.5">
            <div className="flex items-center gap-2 truncate">
              <span className="h-2 w-2 flex-shrink-0" style={{ backgroundColor: f.color }} aria-hidden="true" />
              <span className="truncate font-sans text-2xs text-soc-textSecondary">{f.name}</span>
            </div>
            <span className="flex-shrink-0 font-mono text-xs font-bold tabular-nums text-soc-text">+{f.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
