import React from 'react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0.0 - 1.0
  showLabel?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence, showLabel = true }) => {
  const percentage = Math.round(confidence * 100);

  let color = 'text-soc-ok border-soc-ok/30 bg-soc-okDim';
  let barColor = 'bg-soc-ok';

  if (percentage < 50) {
    color = 'text-soc-crit border-soc-crit/30 bg-soc-critDim';
    barColor = 'bg-soc-crit';
  } else if (percentage < 70) {
    color = 'text-soc-med border-soc-med/30 bg-soc-medDim';
    barColor = 'bg-soc-med';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 bg-soc-raised rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`soc-badge border ${color} tabular-nums`}>
          {percentage}%
        </span>
      )}
    </div>
  );
};
