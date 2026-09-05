'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Finding } from '@/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowRight, Activity, Search, Zap } from 'lucide-react';

interface TopFindingSpotlightProps {
  finding: Finding | null;
  onActionDispatch: (action: string) => void;
}

export const TopFindingSpotlight: React.FC<TopFindingSpotlightProps> = ({
  finding,
  onActionDispatch,
}) => {
  const router = useRouter();

  if (!finding) return null;

  return (
    <div className="soc-panel border-l-4 border-l-soc-crit card-hover h-full flex flex-col">
      {/* Top Header Row */}
      <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-soc-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <SeverityBadge severity={finding.severity} />
          <span className="col-mono">{finding.id}</span>
          <span className="text-xs font-medium text-soc-text truncate">{finding.title}</span>
        </div>

        <div className="flex items-center gap-4 text-2xs flex-shrink-0">
          <div>
            <span className="text-soc-textMuted">Risk </span>
            <span className="text-soc-crit font-semibold tabular-nums">{finding.risk_score}/100</span>
          </div>
          <div>
            <span className="text-soc-textMuted">Confidence </span>
            <span className="text-soc-text font-semibold tabular-nums">{Math.round(finding.confidence * 100)}%</span>
          </div>
          <StatusBadge status={finding.status} />
        </div>
      </div>

      {/* 3-Column Explanatory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 flex-1">
        {/* Why Detected (Mathematical Gap) */}
        <div className="lg:col-span-4 p-4 rounded-lg bg-soc-overlay space-y-2.5 h-full">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-soc-textSecondary">
            <Activity className="w-3.5 h-3.5 text-soc-accent" />
            <span>Why detected — mathematical gap</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-soc-textMuted">Investigation baseline</span>
              <span className="text-soc-text font-medium tabular-nums">{finding.baseline_value}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-soc-textMuted">Observed execution</span>
              <span className="text-soc-crit font-semibold tabular-nums">{finding.observed_value}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-soc-border pt-1.5">
              <span className="text-soc-textMuted">Net deviation</span>
              <span className="text-soc-crit font-semibold tabular-nums">{finding.deviation}</span>
            </div>
          </div>
          <p className="text-2xs text-soc-textMuted leading-relaxed">
            Mean dwell time was 42 seconds versus 44 minutes human baseline.
          </p>
        </div>

        {/* Evidence Scope */}
        <div className="lg:col-span-4 p-4 rounded-lg bg-soc-overlay space-y-2.5 h-full">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-soc-textSecondary">
            <Search className="w-3.5 h-3.5 text-soc-accent" />
            <span>Forensic scope &amp; evidence</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="text-soc-textMuted">Target asset: <span className="text-soc-text font-medium">DC-PROD-01 (10.14.2.1)</span></div>
            <div className="text-soc-textMuted">Assigned analyst: <span className="text-soc-text font-medium">Analyst A-01</span></div>
            <div className="text-soc-textMuted">Affected alerts: <span className="text-soc-crit font-semibold">83 critical alerts</span></div>
          </div>
          <Link
            href={`/findings/${finding.id}`}
            className="text-2xs text-soc-accent hover:text-soc-accentBright font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Inspect 7-point explainability card</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Recommended Action (UPĀYA) */}
        <div className="lg:col-span-4 p-4 rounded-lg bg-soc-overlay space-y-3 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-soc-textSecondary">
              <Zap className="w-3.5 h-3.5 text-soc-ok" />
              <span>Recommended action (UPĀYA)</span>
            </div>
            <p className="text-xs text-soc-textSecondary mt-2 leading-relaxed">
              &ldquo;{finding.recommendation}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push(`/findings/${finding.id}`)}
              className="btn-primary"
            >
              Investigate
            </button>
            <button
              type="button"
              onClick={() => onActionDispatch('REOPEN_83_ALERTS')}
              className="btn-ghost"
            >
              Reopen alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
