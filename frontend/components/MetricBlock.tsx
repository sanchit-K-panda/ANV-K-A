import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricBlockProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'normal' | 'verified';
  icon?: LucideIcon;
  onClick?: () => void;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  label,
  value,
  subtext,
  trend,
  trendValue,
  severity = 'normal',
  icon: Icon,
  onClick,
}) => {
  const borderStyles = {
    critical: 'border-l-2 border-l-soc-crit',
    high: 'border-l-2 border-l-soc-high',
    medium: 'border-l-2 border-l-soc-med',
    low: 'border-l-2 border-l-soc-low',
    verified: 'border-l-2 border-l-soc-ok',
    normal: 'border-l-2 border-l-soc-accent',
  };

  const valueStyles = {
    critical: 'text-soc-crit',
    high: 'text-soc-high',
    medium: 'text-soc-med',
    low: 'text-soc-textSecondary',
    verified: 'text-soc-ok',
    normal: 'text-soc-text',
  };

  return (
    <div
      onClick={onClick}
      className={`soc-panel card-hover border-l-4 p-4 ${borderStyles[severity]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-soc-textMuted">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-soc-textMuted" />}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-2xl font-semibold tracking-tight tabular-nums ${valueStyles[severity]}`}>
          {value}
        </span>
        {trendValue && (
          <span
            className={`text-2xs font-medium tabular-nums ${
              trend === 'up'
                ? severity === 'critical' ? 'text-soc-crit' : 'text-soc-ok'
                : trend === 'down'
                ? 'text-soc-ok'
                : 'text-soc-textSecondary'
            }`}
          >
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trendValue}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-2xs text-soc-textMuted mt-1.5 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
};
