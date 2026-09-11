'use client';

import React from 'react';
import { TrendingDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface HealthGaugeProps {
  score: number;
  grade?: string;
  status?: string;
}

export function HealthGauge({ score = 78, grade = 'C-', status = 'DEGRADED' }: HealthGaugeProps) {
  const radius = 68;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return { stroke: 'rgb(var(--soc-ok))', dot: 'bg-soc-ok', text: 'text-soc-ok', bg: 'bg-soc-okDim', border: 'border-soc-ok/30' };
    if (s >= 70) return { stroke: 'rgb(var(--soc-med))', dot: 'bg-soc-med', text: 'text-soc-med', bg: 'bg-soc-medDim', border: 'border-soc-med/30' };
    return { stroke: 'rgb(var(--soc-crit))', dot: 'bg-soc-crit', text: 'text-soc-crit', bg: 'bg-soc-critDim', border: 'border-soc-crit/30' };
  };

  const currentTheme = getColor(score);

  return (
    <div className="soc-panel flex flex-col justify-between space-y-4 p-5 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${currentTheme.dot}`} aria-hidden="true" />
          <h3 className="panel-label">Overall SOC Health Score</h3>
        </div>
        <span className="rounded-md border border-soc-border bg-soc-raised px-2 py-0.5 text-2xs font-bold uppercase tracking-[0.08em] text-soc-textSecondary">
          GRADE: {grade}
        </span>
      </div>

      {/* Semi-Circular Radial Gauge */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        <svg className="h-[102px] w-48 overflow-visible" viewBox="0 0 160 85" role="img" aria-hidden="true" focusable="false">
          <title>SOC health score gauge: {score} of 100</title>
          <path d="M 12 80 A 68 68 0 0 1 148 80" fill="none" stroke="rgb(var(--soc-raised))" strokeWidth="12" />
          <path
            d="M 12 80 A 68 68 0 0 1 148 80"
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="12"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          <line x1="12" y1="82" x2="12" y2="88" stroke="rgb(var(--soc-borderStrong))" strokeWidth="1" aria-hidden="true" />
          <line x1="148" y1="82" x2="148" y2="88" stroke="rgb(var(--soc-borderStrong))" strokeWidth="1" aria-hidden="true" />
        </svg>

        <div className="absolute top-7 flex flex-col items-center text-center">
          <div className="text-3xl font-bold tabular-nums tracking-tight text-soc-text">
            {score}
            <span className="ml-0.5 text-sm font-normal text-soc-textMuted">/100</span>
          </div>
          <span
            className={`mt-1 rounded-md border px-2 py-0.5 text-2xs font-bold uppercase tracking-[0.08em] ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Driver Decomposition Footer */}
      <div className="flex items-center justify-between border-t border-soc-border pt-3 text-2xs">
        <span className="flex items-center gap-1.5 text-soc-textMuted">
          <TrendingDown className="h-3.5 w-3.5 text-soc-med" aria-hidden="true" />
          <span>
            Primary Drag:{' '}
            <strong className="font-semibold text-soc-text">
              Execution Gap <span className="text-soc-crit">(-31 pts)</span>
            </strong>
          </span>
        </span>
        <Link href="/risk" className="flex items-center gap-0.5 text-2xs text-soc-accent transition-colors hover:text-soc-accentBright">
          <span>MĀN Model</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
