'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

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
    <div className="soc-panel">
      {/* Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-soc-critDim flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 text-soc-crit" />
          </span>
          <h3 className="panel-label">Why SOC-04 is Degraded</h3>
        </div>
        <span className="text-2xs text-soc-textMuted">Mathematical root cause</span>
      </div>

      {/* 4-Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
        {drivers.map((d) => (
          <div
            key={d.num}
            className="p-4 rounded-lg bg-soc-overlay space-y-2 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="col-mono">{d.num}</span>
              <span className={`soc-badge ${d.trend === 'up' ? 'badge-medium' : 'badge-critical'}`}>
                {d.metric}
              </span>
            </div>

            <div className="text-[13px] font-semibold text-soc-text">{d.title}</div>
            <div className="text-2xs text-soc-textMuted">{d.detail}</div>
            <p className="text-2xs text-soc-textSecondary pt-2 leading-relaxed border-t border-soc-border/70">
              {d.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
