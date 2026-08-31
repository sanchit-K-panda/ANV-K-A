import React from 'react';

interface RiskScoreProps {
  score: number; // 0 - 100
  factorsCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskScore: React.FC<RiskScoreProps> = ({ score, factorsCount, size = 'md' }) => {
  let textClass = 'text-emerald-400';
  let bgClass = 'bg-emerald-950/30 border-emerald-800/40';
  let label = 'LOW RISK';

  if (score >= 80) {
    textClass = 'text-severity-critical font-bold';
    bgClass = 'bg-severity-criticalBg border-severity-criticalBorder';
    label = 'CRITICAL';
  } else if (score >= 60) {
    textClass = 'text-severity-high font-semibold';
    bgClass = 'bg-severity-highBg border-severity-highBorder';
    label = 'HIGH';
  } else if (score >= 40) {
    textClass = 'text-severity-medium';
    bgClass = 'bg-severity-mediumBg border-severity-mediumBorder';
    label = 'MED';
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-lg px-3.5 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={`flex items-center gap-1.5 rounded border font-mono ${bgClass} ${sizes[size]}`}>
        <span className={textClass}>{score}</span>
        <span className="text-[10px] uppercase text-soc-textSecondary">/100</span>
      </div>
      {factorsCount !== undefined && (
        <span className="text-[11px] text-soc-textSecondary font-mono hidden sm:inline">
          ({factorsCount} factors)
        </span>
      )}
    </div>
  );
};
