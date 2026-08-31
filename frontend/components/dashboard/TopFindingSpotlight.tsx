'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Finding } from '@/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowRight, AlertTriangle, Search, Activity, Zap } from 'lucide-react';

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
    <div className="soc-panel p-5 space-y-4 border-l-4 border-l-rose-500">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <SeverityBadge severity={finding.severity} />
          <span className="font-mono text-xs font-bold text-slate-900">{finding.id}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-900">{finding.title}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500">RISK: </span>
            <strong className="text-rose-700 font-bold text-sm">{finding.risk_score}/100</strong>
          </div>
          <div>
            <span className="text-slate-500">CONFIDENCE: </span>
            <strong className="text-slate-900 font-bold">{Math.round(finding.confidence * 100)}%</strong>
          </div>
          <StatusBadge status={finding.status} />
        </div>
      </div>

      {/* 3-Column Explanatory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
        {/* Why Detected (Mathematical Gap) */}
        <div className="lg:col-span-4 bg-slate-50 p-3.5 rounded border border-slate-200/80 space-y-2 font-mono">
          <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Why Detected (Mathematical Gap)</span>
          </div>
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Investigation Baseline:</span>
              <span className="text-slate-900 font-bold">{finding.baseline_value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Observed Execution:</span>
              <span className="text-rose-700 font-bold">{finding.observed_value}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1">
              <span className="text-slate-500">Net Deviation:</span>
              <span className="text-rose-700 font-bold">{finding.deviation}</span>
            </div>
          </div>
          <p className="text-[11.5px] font-sans text-slate-600 pt-1 leading-normal">
            Mean dwell time was 42 seconds versus 44 minutes human baseline.
          </p>
        </div>

        {/* Evidence Scope */}
        <div className="lg:col-span-4 bg-slate-50 p-3.5 rounded border border-slate-200/80 space-y-2 font-mono">
          <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Forensic Scope &amp; Evidence</span>
          </div>
          <div className="space-y-1 text-xs pt-1 text-slate-700">
            <div>Target Asset: <strong className="text-slate-900">DC-PROD-01 (10.14.2.1)</strong></div>
            <div>Assigned Analyst: <strong className="text-slate-900">Analyst A-01</strong></div>
            <div>Affected Alerts: <strong className="text-rose-700 font-bold">83 critical alerts</strong></div>
          </div>
          <Link
            href={`/findings/${finding.id}`}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium pt-1 inline-flex items-center gap-1"
          >
            <span>Inspect 7-Point Explainability Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recommended Action (UPĀYA) */}
        <div className="lg:col-span-4 bg-slate-50 p-3.5 rounded border border-slate-200/80 space-y-2.5 flex flex-col justify-between font-mono">
          <div>
            <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Action (UPĀYA)</span>
            </div>
            <p className="text-xs font-sans text-slate-800 mt-1.5 leading-snug">
              &ldquo;{finding.recommendation}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => router.push(`/findings/${finding.id}`)}
              className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition-colors shadow-xs"
            >
              INVESTIGATE
            </button>
            <button
              type="button"
              onClick={() => onActionDispatch('REOPEN_83_ALERTS')}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded hover:bg-slate-100 transition-colors"
            >
              REOPEN ALERTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
