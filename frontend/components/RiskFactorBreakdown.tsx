import React from 'react';
import { RiskFactor } from '@/types';
import { ShieldAlert, Plus } from 'lucide-react';

interface RiskFactorBreakdownProps {
  factors: RiskFactor[];
  totalScore: number;
}

export const RiskFactorBreakdown: React.FC<RiskFactorBreakdownProps> = ({ factors, totalScore }) => {
  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-soc-border mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-severity-critical" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-soc-textPrimary">
            Itemized Risk Factor Attribution
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-soc-textSecondary">Total Risk:</span>
          <span className="font-bold text-severity-critical px-2 py-0.5 bg-severity-criticalBg rounded border border-severity-criticalBorder">
            {totalScore}/100
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((factor, index) => {
          const percentageOfTotal = totalScore > 0 ? Math.min(100, Math.round((factor.score / totalScore) * 100)) : 0;
          return (
            <div key={index} className="p-3 bg-soc-base rounded border border-soc-border">
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <span className="text-soc-textPrimary font-semibold">{factor.name}</span>
                <span className="text-severity-critical font-bold flex items-center">
                  <Plus className="w-3 h-3 inline" />
                  {factor.score} pts
                </span>
              </div>
              {factor.description && (
                <p className="text-[11px] text-soc-textMuted mb-2">{factor.description}</p>
              )}
              <div className="w-full bg-soc-border h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-severity-critical h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, factor.score * 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
