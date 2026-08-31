'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, TrendingUp, ArrowUpRight } from 'lucide-react';

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
  // Normalize percentage for arc gauge (0 - 100)
  const percentage = Math.min(Math.max(score, 0), maxScore);
  
  // Calculate SVG arc parameters for a clean 180-degree semi-circle meter
  const radius = 65;
  const circumference = Math.PI * radius; // 180 degree semi-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getRiskLevel = (val: number) => {
    if (val >= 80) return { label: 'CRITICAL RISK', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200 text-rose-700' };
    if (val >= 60) return { label: 'ELEVATED RISK', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200 text-amber-700' };
    if (val >= 35) return { label: 'MODERATE RISK', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200 text-yellow-700' };
    return { label: 'LOW RISK', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
  };

  const riskLevel = getRiskLevel(score);

  const factorContributions = [
    { label: 'Investigation Gaps (VIVEKA)', pts: '+31', percent: '34%' },
    { label: 'Escalation Anomaly', pts: '+24', percent: '26%' },
    { label: 'Negative Space Omissions (ABHĀVA)', pts: '+18', percent: '20%' },
    { label: 'Closure MTTR Gaming (VIKĀRA)', pts: '+11', percent: '12%' },
  ];

  return (
    <div className="soc-panel p-5 flex flex-col justify-between select-none h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-mono text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              TOTAL COMPOSITE RISK METER
            </span>
          </div>
          <span className={`px-2 py-0.5 text-[10.5px] font-mono font-bold border rounded ${riskLevel.bg}`}>
            {riskLevel.label}
          </span>
        </div>

        {/* Main Readout with Arc Gauge */}
        <div className="py-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900">
                {score}
              </span>
              <span className="text-base text-slate-400 font-mono font-normal">/ {maxScore}</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 font-sans">
              <span className="text-slate-400">Target Scope: </span>
              <strong className="text-slate-900 font-semibold">{scope}</strong>
              <span className="text-slate-400 ml-2">Confidence: </span>
              <strong className="text-slate-900 font-semibold">{confidence}%</strong>
            </div>
          </div>

          {/* Mini Arc Gauge */}
          <div className="relative w-28 h-14 flex items-end justify-center flex-shrink-0">
            <svg className="w-28 h-14 overflow-visible" viewBox="0 0 140 75">
              {/* Background Track Arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Active Risk Gauge Arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="#BE123C"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Contributing Factors Decomposition */}
        <div className="border-t border-slate-100 pt-3 space-y-1.5 font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex justify-between">
            <span>Primary Risk Drivers:</span>
            <span className="text-rose-700 font-bold">TOTAL: +{score} PTS</span>
          </div>
          {factorContributions.map((f) => (
            <div key={f.label} className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-sans">{f.label}</span>
              <span className="font-bold text-rose-700 font-mono">
                {f.pts} pts <span className="text-slate-400 text-[10px] font-normal">({f.percent})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <div className="flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trendDelta}</span>
        </div>
        <Link href="/risk" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 text-xs">
          <span>View MĀN Factors</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
