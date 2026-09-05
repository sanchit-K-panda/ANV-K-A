import React from 'react';
import { RiskFactor } from '@/types';

interface RiskFactorBreakdownProps {
  factors: RiskFactor[];
  totalScore: number;
}

export const RiskFactorBreakdown: React.FC<RiskFactorBreakdownProps> = ({ factors, totalScore }) => {
  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <h3 className="panel-label">Itemized Risk Factor Attribution</h3>
        <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
          <span className="text-soc-textMuted">Total Risk:</span>
          <span className={`soc-badge ${totalScore >= 80 ? 'badge-critical' : totalScore >= 60 ? 'badge-high' : 'badge-medium'}`}>
            {totalScore}/100
          </span>
        </div>
      </div>

      <div className="divide-y divide-soc-border">
        {factors.map((factor, index) => {
          const percentageOfTotal = totalScore > 0 ? Math.min(100, Math.round((factor.score / totalScore) * 100)) : 0;
          return (
            <div key={index} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1 font-mono text-xs tabular-nums">
                <span className="text-soc-text font-medium">{factor.name}</span>
                <span className="text-soc-accent font-semibold">
                  +{factor.score} pts
                  <span className="text-soc-textMuted font-normal ml-2">({percentageOfTotal}%)</span>
                </span>
              </div>
              {factor.description && (
                <p className="text-2xs text-soc-textMuted mb-2 max-w-prose">{factor.description}</p>
              )}
              <div className="risk-factor-bar">
                <div
                  className="risk-factor-fill transition-all duration-300"
                  style={{ width: `${percentageOfTotal}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
