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
    <div className="soc-panel card-hover h-full flex flex-col overflow-hidden bg-soc-panel select-none">
      {/* Top Header Row */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-soc-border bg-soc-raised/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <SeverityBadge severity={finding.severity} />
          <span className="font-mono text-xs font-semibold text-soc-accent">{finding.id}</span>
          <span className="text-xs font-semibold text-soc-text truncate font-display">{finding.title}</span>
        </div>

        <div className="flex items-center gap-2 text-2xs flex-shrink-0 font-mono">
          <div className="px-2 py-0.5 rounded-md border border-soc-crit/30 bg-soc-crit/10 text-soc-crit font-semibold">
            RISK: {finding.risk_score}/100
          </div>
          <div className="px-2 py-0.5 rounded-md border border-soc-accent/30 bg-soc-accent/10 text-soc-accent font-semibold">
            CONF: {Math.round(finding.confidence * 100)}%
          </div>
          <StatusBadge status={finding.status} />
        </div>
      </div>

      {/* 3-Column Explanatory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 flex-1 bg-soc-panel">
        {/* Why Detected (Mathematical Gap) */}
        <div className="lg:col-span-4 p-3.5 rounded-lg bg-soc-overlay border border-soc-border space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-2xs font-semibold font-mono text-soc-accent uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-soc-accent" />
              <span>MATHEMATICAL GAP (VIVEKA)</span>
            </div>
            <div className="space-y-2 text-xs font-mono mt-2.5">
              <div className="flex justify-between items-center gap-3">
                <span className="text-soc-textMuted text-2xs">Human Baseline</span>
                <span className="text-soc-text font-semibold tabular-nums">{finding.baseline_value}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-soc-textMuted text-2xs">Observed Telemetry</span>
                <span className="text-soc-crit font-semibold tabular-nums">{finding.observed_value}</span>
              </div>
              {/* Visual Delta Meter */}
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-soc-raised rounded-full overflow-hidden flex">
                  <div className="h-full bg-soc-accent w-[8%]" title="Observed (42s)" />
                  <div className="h-full bg-soc-crit/40 flex-1" title="Gap (43m 18s)" />
                </div>
                <div className="flex justify-between text-2xs text-soc-textMuted">
                  <span>42s OBSERVED</span>
                  <span className="text-soc-crit font-semibold">98.4% DWELL TIME VOID</span>
                </div>
              </div>
              <div className="flex justify-between gap-3 border-t border-soc-border pt-2">
                <span className="text-soc-textMuted text-2xs uppercase">Net Deviation</span>
                <span className="text-soc-crit font-semibold tabular-nums">
                  {finding.deviation}
                </span>
              </div>
            </div>
          </div>
          <p className="text-2xs font-mono text-soc-textSecondary leading-relaxed border-t border-soc-border/40 pt-2">
            Mean dwell time was 42 seconds versus 44 minutes mandatory human SOP baseline.
          </p>
        </div>

        {/* Evidence Scope */}
        <div className="lg:col-span-4 p-3.5 rounded-lg bg-soc-overlay border border-soc-border space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-2xs font-semibold font-mono text-soc-accent uppercase tracking-wider">
              <Search className="w-3.5 h-3.5 text-soc-accent" />
              <span>FORENSIC SCOPE (PRATYAYA)</span>
            </div>
            <div className="space-y-2 text-xs font-mono mt-2.5">
              <div className="flex justify-between text-soc-textSecondary text-2xs">
                <span>TARGET ASSET:</span>
                <span className="text-soc-text font-semibold">DC-PROD-01 (10.14.2.1)</span>
              </div>
              <div className="flex justify-between text-soc-textSecondary text-2xs">
                <span>ASSIGNED OPERATOR:</span>
                <span className="text-soc-text font-semibold">Analyst A-01</span>
              </div>
              <div className="flex justify-between text-soc-textSecondary text-2xs">
                <span>CASCADE IMPACT:</span>
                <span className="text-soc-crit font-semibold">83 critical alerts bypassed</span>
              </div>
            </div>
          </div>
          <Link
            href={`/findings/${finding.id}`}
            className="text-2xs font-mono text-soc-accent hover:text-soc-accentBright font-semibold inline-flex items-center gap-1.5 transition-colors pt-2 border-t border-soc-border/40 group"
          >
            <span>INSPECT 7-POINT EXPLAINABILITY</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Recommended Action (UPĀYA) */}
        <div className="lg:col-span-4 p-3.5 rounded-lg bg-soc-overlay border border-soc-border space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-2xs font-semibold font-mono text-soc-ok uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-soc-ok" />
              <span>RECOMMENDED ACTION (UPĀYA)</span>
            </div>
            <p className="text-xs text-soc-textSecondary mt-2 leading-relaxed font-medium">
              &ldquo;{finding.recommendation}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-soc-border/40">
            <button
              type="button"
              onClick={() => router.push(`/findings/${finding.id}`)}
              className="btn-primary flex-1 font-mono text-xs"
            >
              INVESTIGATE
            </button>
            <button
              type="button"
              onClick={() => onActionDispatch('REOPEN_83_ALERTS')}
              className="btn-ghost font-mono text-xs"
            >
              REOPEN ALERTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
