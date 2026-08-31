'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  trendDelta = '+18 pts (Last 24h)',
}) => {
  // Normalize percentage for arc gauge (0 - 100)
  const percentage = Math.min(Math.max(score, 0), maxScore);
  
  // Calculate SVG arc parameters for a clean 180-degree semi-circle meter
  const radius = 70;
  const circumference = Math.PI * radius; // 180 degree semi-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getRiskLevel = (val: number) => {
    if (val >= 80) return { label: 'CRITICAL RISK', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200 text-rose-800' };
    if (val >= 60) return { label: 'ELEVATED RISK', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200 text-amber-800' };
    if (val >= 35) return { label: 'MODERATE RISK', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
    return { label: 'LOW RISK', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
  };

  const riskLevel = getRiskLevel(score);

  const factorContributions = [
    { label: 'Investigation Gaps', pts: '+31', percent: '34%', color: 'bg-rose-600' },
    { label: 'Escalation Anomaly', pts: '+24', percent: '26%', color: 'bg-amber-600' },
    { label: 'Negative Space Omissions', pts: '+18', percent: '20%', color: 'bg-amber-500' },
    { label: 'Closure MTTR Gaming', pts: '+11', percent: '12%', color: 'bg-slate-600' },
    { label: 'Threat Recurrence (Repeat)', pts: '+7', percent: '8%', color: 'bg-slate-400' },
  ];

  return (
    <div className="soc-panel p-5 flex flex-col justify-between space-y-4 font-mono select-none h-full border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
            Total Composite Risk Meter (MĀN)
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskLevel.bg}`}>
          {riskLevel.label}
        </span>
      </div>

      {/* Main Semi-Circle Meter Stage */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative w-44 h-24 flex items-end justify-center">
          <svg className="w-44 h-24 overflow-visible" viewBox="0 0 160 90">
            {/* Background Track Arc */}
            <path
              d="M 15 80 A 65 65 0 0 1 145 80"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Active Risk Gauge Arc */}
            <path
              d="M 15 80 A 65 65 0 0 1 145 80"
              fill="none"
              stroke="#BE123C"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Readout inside Arc */}
          <div className="absolute bottom-0 text-center flex flex-col items-center">
            <div className="text-3xl font-black text-slate-900 leading-none">
              {score}
              <span className="text-xs text-slate-400 font-normal ml-0.5">/ {maxScore}</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">
              Composite Index
            </div>
          </div>
        </div>

        {/* Range Reference Ticks */}
        <div className="w-44 flex justify-between text-[9.5px] text-slate-400 font-mono mt-1 px-1">
          <span>0 (Low)</span>
          <span>50 (Moderate)</span>
          <span>100 (Critical)</span>
        </div>
      </div>

      {/* Factor Breakdown Stack */}
      <div className="space-y-2 pt-1">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex justify-between items-center">
          <span>Key Risk Contributors</span>
          <span className="text-rose-700 font-bold">TOTAL: +{score} PTS</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {factorContributions.map((fc) => (
            <div
              key={fc.label}
              className="p-1.5 px-2 bg-slate-50 border border-slate-200/80 rounded flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${fc.color}`} />
                <span className="text-slate-700 font-sans truncate text-[11px]">{fc.label}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                <span className="text-slate-400 text-[10px]">({fc.percent})</span>
                <span className="font-bold text-slate-900">{fc.pts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-[10px] text-slate-500">
        <div>
          Confidence: <strong className="text-slate-900">{confidence}%</strong> · Scope: <strong className="text-slate-900">{scope}</strong>
        </div>
        <div className="flex items-center gap-1 text-rose-700 font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>{trendDelta}</span>
        </div>
      </div>
    </div>
  );
};
