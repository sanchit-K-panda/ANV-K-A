'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface TotalRiskMeterProps {
  score?: number;
  maxScore?: number;
  confidence?: number;
  scope?: string;
  trendDelta?: string;
}

export const TotalRiskMeter: React.FC<TotalRiskMeterProps> = ({
  score = 91,
  maxScore = 100,
  confidence = 94,
  scope = 'SOC-04',
  trendDelta = '+18 pts (Shift Delta)',
}) => {
  const percentage = Math.min(Math.max(score, 0), maxScore);

  // 180-degree semi-circle meter with gradient stroke
  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getRiskLevel = (val: number) => {
    if (val >= 80) return { label: 'Critical risk', badge: 'badge-critical', tip: 'rgb(var(--soc-crit))' };
    if (val >= 60) return { label: 'Elevated risk', badge: 'badge-high', tip: 'rgb(var(--soc-high))' };
    if (val >= 35) return { label: 'Moderate risk', badge: 'badge-medium', tip: 'rgb(var(--soc-med))' };
    return { label: 'Low risk', badge: 'badge-ok', tip: 'rgb(var(--soc-ok))' };
  };

  const riskLevel = getRiskLevel(score);
  const gradId = `risk-grad-${scope.replace(/[^a-zA-Z0-9]/g, '') || 'soc'}`;

  const factorContributions = [
    { label: 'Investigation Gaps (VIVEKA)', pts: '+31', percent: '34%' },
    { label: 'Escalation Anomaly', pts: '+24', percent: '26%' },
    { label: 'Negative Space Omissions (ABHĀVA)', pts: '+18', percent: '20%' },
    { label: 'Closure MTTR Gaming (VIKĀRA)', pts: '+11', percent: '12%' },
  ];

  return (
    <div className="soc-panel flex flex-col justify-between select-none h-full card-hover">
      <div>
        {/* Header */}
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">Total Composite Risk</span>
            <p className="text-2xs text-soc-textMuted mt-0.5">MĀN · additive factor decomposition</p>
          </div>
          <span className={`soc-badge ${riskLevel.badge}`}>{riskLevel.label}</span>
        </div>

        {/* Main Readout with Arc Gauge */}
        <div className="px-5 pt-5 pb-2 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[44px] leading-none font-bold tracking-tight text-soc-text tabular-nums">
                {score}
              </span>
              <span className="text-sm text-soc-textDim font-mono">/ {maxScore}</span>
            </div>
            <div className="text-2xs text-soc-textMuted mt-2">
              Scope <span className="font-semibold text-soc-textSecondary font-mono">{scope}</span>
              <span className="mx-1.5 text-soc-textDim">·</span>
              Confidence <span className="font-semibold text-soc-accent">{confidence}%</span>
            </div>
          </div>

          {/* Arc Gauge */}
          <div className="relative w-32 h-16 flex items-end justify-center flex-shrink-0">
            <svg className="w-32 h-16 overflow-visible" viewBox="0 0 140 78" role="img" aria-label={`Composite risk ${score} of ${maxScore}`}>
              <defs>
                <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(var(--soc-accent))" />
                  <stop offset="100%" stopColor={riskLevel.tip} />
                </linearGradient>
              </defs>
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="rgb(var(--soc-raised))"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Contributing Factors — always itemized, never opaque */}
        <div className="border-t border-soc-border px-5 py-3.5 space-y-2">
          <div className="flex justify-between text-[11px] font-medium text-soc-textMuted">
            <span>Primary risk drivers</span>
            <span className="text-soc-crit font-semibold">Total +{score} pts</span>
          </div>
          {factorContributions.map((f) => (
            <div key={f.label} className="flex justify-between items-center text-xs">
              <span className="text-soc-textSecondary">{f.label}</span>
              <span className="font-mono text-2xs tabular-nums">
                <span className="text-soc-crit font-semibold">{f.pts}</span>
                <span className="text-soc-textDim ml-1.5">({f.percent})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-5 py-3.5 border-t border-soc-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs text-soc-high font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trendDelta}</span>
        </div>
        <Link href="/risk" className="text-xs text-soc-accent hover:text-soc-accentBright font-medium flex items-center gap-0.5 transition-colors">
          <span>All factors</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
