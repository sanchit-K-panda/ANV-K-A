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
    critical: 'border-l-4 border-l-severity-critical border-soc-border hover:border-soc-border/80',
    high: 'border-l-4 border-l-severity-high border-soc-border hover:border-soc-border/80',
    medium: 'border-l-4 border-l-severity-medium border-soc-border hover:border-soc-border/80',
    low: 'border-l-4 border-l-severity-low border-soc-border hover:border-soc-border/80',
    verified: 'border-l-4 border-l-severity-verified border-soc-border hover:border-soc-border/80',
    normal: 'border-l-4 border-l-soc-accent border-soc-border hover:border-soc-border/80',
  };

  const valueStyles = {
    critical: 'text-severity-critical',
    high: 'text-severity-high',
    medium: 'text-severity-medium',
    low: 'text-soc-textSecondary',
    verified: 'text-severity-verified',
    normal: 'text-soc-textPrimary',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-soc-panel border rounded-md p-4 transition-all duration-150 ${borderStyles[severity]} ${
        onClick ? 'cursor-pointer hover:bg-soc-raised' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-soc-textSecondary">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-soc-textMuted" />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className={`text-2xl font-mono font-bold tracking-tight ${valueStyles[severity]}`}>
          {value}
        </span>
        {trendValue && (
          <span
            className={`text-xs font-mono font-medium ${
              trend === 'up'
                ? severity === 'critical' ? 'text-rose-400' : 'text-emerald-400'
                : trend === 'down'
                ? 'text-emerald-400'
                : 'text-soc-textSecondary'
            }`}
          >
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'} {trendValue}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-[11px] text-soc-textMuted mt-1.5 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
};
