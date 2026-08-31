import React from 'react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 - 1.0
  showLabel?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence, showLabel = true }) => {
  const percentage = Math.round(confidence * 100);
  
  let color = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
  let barColor = 'bg-emerald-500';

  if (percentage < 70) {
    color = 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    barColor = 'bg-amber-500';
  } else if (percentage < 50) {
    color = 'text-rose-400 border-rose-500/30 bg-rose-950/20';
    barColor = 'bg-rose-500';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-soc-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded border ${color}`}>
          {percentage}%
        </span>
      )}
    </div>
  );
};
