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
    <div className="soc-panel flex flex-col justify-between select-none h-full card-hover bg-soc-panel">
      <div>
        {/* Header */}
        <div className="soc-panel-header">
          <div>
            <span className="panel-label">SOC HEALTH VECTOR</span>
            <p className="text-2xs font-mono text-soc-textMuted mt-0.5">MEDHĀ · Operational Resilience</p>
          </div>
          <span className="soc-badge badge-neutral font-mono font-bold">GRADE {grade}</span>
        </div>

        {/* Main Score Readout */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-4xl font-extrabold tracking-tight tabular-nums ${isDegraded ? 'text-soc-crit' : isHealthy ? 'text-soc-ok' : 'text-soc-high'}`}>
              {score}
            </span>
            <span className="text-xs text-soc-textMuted font-mono">/ 100</span>
            <span className={`soc-badge ${statusBadge} ml-2 font-mono font-bold`}>{status}</span>
          </div>

          <div className="text-2xs font-mono text-soc-textMuted mt-2">
            PRIMARY DRIVER: <span className="font-bold text-soc-text">{primaryDriver}</span>
          </div>
        </div>

        {/* Contributing Factors Decomposition */}
        <div className="border-t border-soc-border px-4 py-3 space-y-2">
          <div className="text-2xs font-mono font-bold text-soc-textMuted uppercase tracking-wider">
            Factor Drag Vector
          </div>
          <div className="space-y-2">
            {factors.map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-soc-textSecondary text-[11px] truncate max-w-[180px]">{f.label}</span>
                  <span className="text-soc-crit font-bold text-2xs tabular-nums">{f.impact} PTS</span>
                </div>
                <div className="w-full bg-soc-raised h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-soc-crit/80 h-full rounded-full"
                    style={{ width: `${Math.min(Math.abs(f.impact) * 2.5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-4 py-3 border-t border-soc-border flex items-center justify-between bg-soc-raised/30">
        <span className="text-2xs font-mono text-soc-textMuted">MĀN QUANTIFICATION</span>
        <Link href="/risk" className="text-xs font-mono text-soc-accent hover:text-soc-accentBright font-bold flex items-center gap-0.5 transition-colors">
          <span>DECOMPOSITION</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
