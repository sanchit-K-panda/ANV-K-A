import React from 'react';

interface RiskScoreProps {
  score: number; // 0 - 100
  factorsCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskScore: React.FC<RiskScoreProps> = ({ score, factorsCount, size = 'md' }) => {
  let textClass = 'text-soc-low';
  let bgClass = 'bg-soc-lowDim border-soc-low/30';
  let label = 'LOW RISK';

  if (score >= 80) {
    textClass = 'text-soc-crit font-bold';
    bgClass = 'bg-soc-critDim border-soc-crit/40';
    label = 'CRITICAL';
  } else if (score >= 60) {
    textClass = 'text-soc-high font-semibold';
    bgClass = 'bg-soc-highDim border-soc-high/40';
    label = 'HIGH';
  } else if (score >= 40) {
    textClass = 'text-soc-med';
    bgClass = 'bg-soc-medDim border-soc-med/40';
    label = 'MED';
  }

  const sizes = {
    sm: 'text-2xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={`flex items-center gap-1.5 rounded-sm border font-mono tabular-nums ${bgClass} ${sizes[size]}`}>
        <span className={textClass}>{score}</span>
        <span className="text-2xs uppercase text-soc-textMuted">/100</span>
        <span className={`text-2xs uppercase tracking-wider ${textClass} hidden md:inline`}>{label}</span>
      </div>
      {factorsCount !== undefined && (
        <span className="text-2xs text-soc-textMuted font-mono hidden sm:inline">
          ({factorsCount} factors)
        </span>
      )}
    </div>
  );
};
