'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingDown } from 'lucide-react';

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

  return (
    <div className="soc-panel p-5 flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-mono text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            SOC HEALTH ASSESSMENT
          </span>
          <span className="px-2 py-0.5 text-[10.5px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-800 rounded">
            GRADE {grade}
          </span>
        </div>

        {/* Main Score Readout */}
        <div className="py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono tracking-tight text-slate-900">
              {score}
            </span>
            <span className="text-base text-slate-400 font-mono font-normal">/ 100</span>
            <span
              className={`ml-2 px-2 py-0.5 text-[10.5px] font-bold font-mono uppercase tracking-wider rounded ${
                isDegraded
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : isHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="text-xs text-slate-600 mt-2 font-sans">
            <span className="text-slate-400">Primary driver: </span>
            <strong className="text-slate-900 font-semibold">{primaryDriver}</strong>
          </div>
        </div>

        {/* Contributing Factors Decomposition */}
        <div className="border-t border-slate-100 pt-3 space-y-1.5 font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Contributing Factor Drag:
          </div>
          {factors.map((f) => (
            <div key={f.label} className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-sans">{f.label}</span>
              <span className="font-bold text-rose-700 font-mono">{f.impact} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="text-[11px]">Quantified via MĀN Engine</span>
        <Link href="/risk" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 text-xs">
          <span>Decomposition</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
