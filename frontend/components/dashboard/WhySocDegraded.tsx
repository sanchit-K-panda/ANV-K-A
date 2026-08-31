'use client';

import React from 'react';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const WhySocDegraded: React.FC = () => {
  const drivers = [
    {
      num: '01',
      title: 'Investigation Activity',
      metric: '↓ 74%',
      detail: 'from 85% baseline to 11% observed rate',
      sub: '83 ransomware alerts closed without memory dumps or process traces',
      trend: 'down',
    },
    {
      num: '02',
      title: 'Escalation Rate',
      metric: '↓ 63%',
      detail: 'from 30% baseline to 7% observed rate',
      sub: 'Tier 2/3 queues bypassed by Analyst A-01 on critical domain assets',
      trend: 'down',
    },
    {
      num: '03',
      title: 'Closure Time',
      metric: '↓ 84%',
      detail: 'from 44m baseline to 42s dwell time',
      sub: 'Rapid false-positive closures indicate SLA metric gaming',
      trend: 'down',
    },
    {
      num: '04',
      title: 'Threat Recurrence',
      metric: '↑ 3.2x',
      detail: 'repeat incident frequency',
      sub: 'Same ransomware IOCs re-appeared across DC-PROD-01 within 48h',
      trend: 'up',
    },
  ];

  return (
    <div className="soc-panel p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Why SOC-04 is Degraded
          </h3>
        </div>
        <span className="text-[10.5px] text-slate-400 font-mono">MATHEMATICAL ROOT CAUSE</span>
      </div>

      {/* 4-Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {drivers.map((d) => (
          <div
            key={d.num}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-400">{d.num}</span>
              <span className="font-bold text-rose-700 text-xs bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                {d.metric}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 font-sans">{d.title}</div>
            <div className="text-[10.5px] text-slate-500">{d.detail}</div>
            <p className="text-[11px] font-sans text-slate-600 pt-1 leading-snug border-t border-slate-200/60">
              {d.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
