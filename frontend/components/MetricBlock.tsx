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
    critical: 'border-l-4 border-l-soc-crit',
    high: 'border-l-4 border-l-soc-high',
    medium: 'border-l-4 border-l-soc-med',
    low: 'border-l-4 border-l-soc-low',
    verified: 'border-l-4 border-l-soc-ok',
    normal: 'border-l-4 border-l-soc-accent',
  };

  const valueStyles = {
    critical: 'text-soc-crit',
    high: 'text-soc-high',
    medium: 'text-soc-med',
    low: 'text-soc-textSecondary',
    verified: 'text-soc-ok',
    normal: 'text-soc-accent',
  };

  return (
    <div
      onClick={onClick}
      className={`soc-panel card-hover p-4 transition-all duration-200 ${borderStyles[severity]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-soc-textSecondary uppercase tracking-wider font-mono">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${severity === 'critical' ? 'text-soc-crit' : severity === 'verified' ? 'text-soc-ok' : 'text-soc-accent'}`} />}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${valueStyles[severity]}`}>
          {value}
        </span>
        {trendValue && (
          <span
            className={`text-2xs font-mono font-bold tabular-nums px-1.5 py-0.5 rounded border ${
              trend === 'up'
                ? severity === 'critical' ? 'text-soc-crit border-soc-crit/30 bg-soc-crit/10' : 'text-soc-ok border-soc-ok/30 bg-soc-ok/10'
                : trend === 'down'
                ? 'text-soc-ok border-soc-ok/30 bg-soc-ok/10'
                : 'text-soc-textSecondary border-soc-border bg-soc-raised'
            }`}
          >
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trendValue}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-2xs font-mono text-soc-textMuted mt-2 line-clamp-1 border-t border-soc-border/40 pt-1.5">
          {subtext}
        </p>
      )}
    </div>
  );
};
