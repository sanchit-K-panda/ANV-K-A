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
    <div className="soc-panel flex flex-col justify-between select-none h-full card-hover bg-soc-panel">
      <div>
        {/* Header */}
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">COMPOSITE RISK VECTOR</span>
            <p className="text-2xs font-mono text-soc-textMuted mt-0.5">MĀN · Bayesian Additive Weights</p>
          </div>
          <span className={`soc-badge ${riskLevel.badge}`}>{riskLevel.label}</span>
        </div>

        {/* Main Readout with Technical Precision Gauge */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-mono text-4xl font-extrabold tracking-tight tabular-nums ${score >= 80 ? 'text-soc-crit' : score >= 60 ? 'text-soc-high' : 'text-soc-text'}`}>
                {score}
              </span>
              <span className="text-xs text-soc-textMuted font-mono">/ {maxScore}</span>
            </div>
            <div className="text-[11px] text-soc-textMuted mt-1 font-mono">
              SCOPE: <span className="font-semibold text-soc-text">{scope}</span>
              <span className="mx-1 text-soc-textDim">·</span>
              CONF: <span className="font-semibold text-soc-accent">{confidence}%</span>
            </div>
          </div>

          {/* Precision Gauge */}
          <div className="relative w-28 h-14 flex items-end justify-center flex-shrink-0">
            <svg className="w-28 h-14 overflow-visible" viewBox="0 0 140 75" role="img" aria-label={`Composite risk ${score} of ${maxScore}`}>
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke="rgb(var(--soc-raised))"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke={score >= 80 ? 'rgb(var(--soc-crit))' : score >= 60 ? 'rgb(var(--soc-high))' : score >= 35 ? 'rgb(var(--soc-med))' : 'rgb(var(--soc-ok))'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Contributing Factors — always itemized, never opaque */}
        <div className="border-t border-soc-border px-4 py-3 space-y-2">
          <div className="flex justify-between text-2xs font-mono font-bold text-soc-textMuted uppercase tracking-wider">
            <span>Primary Risk Drivers</span>
            <span className="text-soc-crit">+{score} PTS TOTAL</span>
          </div>
          <div className="space-y-2">
            {factorContributions.map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-soc-textSecondary text-[11px] truncate max-w-[200px]">{f.label}</span>
                  <span className="text-2xs tabular-nums">
                    <span className="text-soc-crit font-bold">{f.pts}</span>
                    <span className="text-soc-textDim ml-1">({f.percent})</span>
                  </span>
                </div>
                <div className="w-full bg-soc-raised h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-soc-crit h-full rounded-full transition-all duration-500"
                    style={{ width: f.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-4 py-3 border-t border-soc-border flex items-center justify-between bg-soc-raised/30">
        <div className="flex items-center gap-1.5 text-2xs font-mono text-soc-high font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trendDelta}</span>
        </div>
        <Link href="/risk" className="text-xs font-mono text-soc-accent hover:text-soc-accentBright font-bold flex items-center gap-0.5 transition-colors">
          <span>ALL FACTORS</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
