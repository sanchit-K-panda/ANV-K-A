'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface SocHealthScoreProps {
  score: number;
  grade?: string;
  status?: string;
  primaryDriver?: string;
  factors?: { label: string; impact: number }[];
}

export const SocHealthScore: React.FC<SocHealthScoreProps> = ({
  score = 42,
  grade = 'C-',
  status = 'DEGRADED',
  primaryDriver = 'Investigation effectiveness',
  factors = [
    { label: 'Investigation', impact: -31 },
    { label: 'Escalation', impact: -18 },
    { label: 'Threat recurrence', impact: -7 },
    { label: 'Closure anomaly', impact: -11 },
  ],
}) => {
  const isHealthy = score >= 80;
  const isDegraded = score < 70;

  const statusBadge = isDegraded ? 'badge-critical' : isHealthy ? 'badge-ok' : 'badge-medium';

  return (
    <div className="soc-panel flex flex-col justify-between select-none h-full card-hover">
      <div>
        {/* Header */}
        <div className="soc-panel-header">
          <span className="panel-label">SOC Health Assessment</span>
          <span className="soc-badge badge-neutral">Grade {grade}</span>
        </div>

        {/* Main Score Readout */}
        <div className="px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-soc-text tabular-nums">
              {score}
            </span>
            <span className="text-sm text-soc-textMuted font-mono">/ 100</span>
            <span className={`soc-badge ${statusBadge} ml-2`}>{status}</span>
          </div>

          <div className="text-2xs text-soc-textMuted mt-2">
            Primary driver: <span className="font-medium text-soc-textSecondary">{primaryDriver}</span>
          </div>
        </div>

        {/* Contributing Factors Decomposition */}
        <div className="border-t border-soc-border px-5 py-3.5 space-y-2">
          <div className="text-[11px] font-medium text-soc-textMuted mb-0.5">Contributing factor drag</div>
          {factors.map((f) => (
            <div key={f.label} className="flex justify-between items-center text-xs">
              <span className="text-soc-textSecondary">{f.label}</span>
              <span className="font-mono text-soc-crit font-medium tabular-nums">{f.impact} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-5 py-3.5 border-t border-soc-border flex items-center justify-between">
        <span className="text-2xs text-soc-textMuted">Quantified via MĀN Engine</span>
        <Link href="/risk" className="text-xs text-soc-accent hover:text-soc-accentBright font-medium flex items-center gap-0.5 transition-colors">
          <span>Decomposition</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
