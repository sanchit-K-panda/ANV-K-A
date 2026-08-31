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
    if (s >= 85) return { stroke: '#10B981', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (s >= 70) return { stroke: '#F59E0B', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { stroke: '#EF4444', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const currentTheme = getColor(score);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between select-none shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider">
            Overall SOC Health Score
          </h3>
        </div>
        <span className="px-2.5 py-0.5 text-[10.5px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-800 rounded-full">
          GRADE: {grade}
        </span>
      </div>

      {/* Semi-Circular Radial Gauge */}
      <div className="relative flex flex-col items-center justify-center my-4">
        <svg className="w-48 h-26 overflow-visible" viewBox="0 0 160 85">
          <path
            d="M 12 80 A 68 68 0 0 1 148 80"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 12 80 A 68 68 0 0 1 148 80"
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute top-7 flex flex-col items-center text-center">
          <div className="text-4xl font-extrabold font-mono tracking-tight text-slate-900">
            {score}
            <span className="text-sm text-slate-400 font-normal ml-0.5">/100</span>
          </div>
          <span className={`text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 mt-1 rounded-full ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} border`}>
            {status}
          </span>
        </div>
      </div>

      {/* Driver Decomposition Footer */}
      <div className="pt-3 border-t border-slate-100 text-xs font-mono flex items-center justify-between text-slate-500">
        <span className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
          <span>Primary Drag: <strong className="text-slate-900 font-semibold">Execution Gap (-31 pts)</strong></span>
        </span>
        <Link href="/risk" className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5 text-xs font-medium">
          <span>MĀN Model</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
