'use client';

import React from 'react';
import { ArrowRight, Cpu } from 'lucide-react';

interface CorrelationNode {
  type: string;
  label: string;
  sub: string;
  severity: 'neutral' | 'crit';
  emphasis?: boolean;
}

export const FindingCorrelationGraph: React.FC = () => {
  const nodes: CorrelationNode[] = [
    { type: 'RAW ALERT', label: 'ALT-99201', sub: 'vssadmin delete', severity: 'neutral' },
    { type: 'INCIDENT', label: 'INC-84920', sub: 'DC-PROD-01', severity: 'neutral' },
    { type: 'ANALYST', label: 'Analyst A-01', sub: '42s dwell time', severity: 'neutral' },
    { type: 'OMISSION', label: '0 Dumps', sub: 'Memory skipped', severity: 'crit' },
    { type: 'THREAT', label: 'T-0042', sub: 'Repeat Ransomware', severity: 'crit' },
    { type: 'FINDING', label: 'FND-EXEC-001', sub: 'Score: 91/100', severity: 'crit', emphasis: true },
  ];

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
          <h3 className="panel-label">Finding Correlation Graph (Alert ➔ Finding Provenance)</h3>
        </div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-soc-textDim">MĀN Correlation Engine</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {nodes.map((n, idx) => {
          const isCrit = n.severity === 'crit';
          return (
            <React.Fragment key={n.label}>
              <div
                className={`min-w-[120px] flex-1 rounded-sm border p-3 text-center ${
                  n.emphasis
                    ? 'border-soc-crit/60 bg-soc-critDim'
                    : isCrit
                    ? 'border-soc-crit/40 bg-soc-critDim/60'
                    : 'border-soc-border bg-soc-overlay'
                }`}
              >
                <div className="text-[9px] uppercase tracking-[0.14em] text-soc-textMuted">{n.type}</div>
                <div className={`mt-0.5 text-xs font-bold ${isCrit ? 'text-soc-crit' : 'text-soc-text'}`}>{n.label}</div>
                <div className="mt-0.5 text-[10px] text-soc-textSecondary">{n.sub}</div>
              </div>
              {idx < nodes.length - 1 && (
                <ArrowRight className="hidden h-3.5 w-3.5 flex-shrink-0 text-soc-textDim md:block" aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
