'use client';

import React from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PerformanceLifecycleChartProps {
  detectionScore?: number;
  investigationScore?: number;
  escalationScore?: number;
  responseScore?: number;
}

export function PerformanceLifecycleChart({
  detectionScore = 92,
  investigationScore = 31,
  escalationScore = 48,
  responseScore = 64,
}: PerformanceLifecycleChartProps) {
  const metrics = [
    {
      name: 'Detection Rate',
      score: detectionScore,
      target: 85,
      unit: '%',
      status: detectionScore >= 85 ? 'HEALTHY' : 'DEFICIT',
      description: 'Percentage of raw telemetry alerts properly triggered by SIEM/EDR rules.',
      color: '#10B981',
    },
    {
      name: 'Investigation Rate',
      score: investigationScore,
      target: 85,
      unit: '%',
      status: investigationScore >= 85 ? 'HEALTHY' : 'DEFICIT',
      description: 'Percentage of high/critical alerts receiving forensic memory/process inspection.',
      color: '#EF4444',
    },
    {
      name: 'Escalation Integrity',
      score: escalationScore,
      target: 80,
      unit: '%',
      status: escalationScore >= 80 ? 'HEALTHY' : 'DEFICIT',
      description: 'Cases appropriately routed to Tier 2/3 and incident commander queues.',
      color: '#F59E0B',
    },
    {
      name: 'Response Dwell SLA',
      score: responseScore,
      target: 75,
      unit: '%',
      status: responseScore >= 75 ? 'HEALTHY' : 'DEFICIT',
      description: 'Mean containment and host isolation completed within compliance timeframes.',
      color: '#3B82F6',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 font-mono select-none shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider">
            SOC Lifecycle Performance vs SLA
          </h3>
        </div>
        <Link href="/analytics" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          MEDHĀ Analytics →
        </Link>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 text-xs">
        {metrics.map((m, idx) => {
          const isDeficit = m.status === 'DEFICIT';

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{m.name}</span>
                  {isDeficit ? (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-full">
                      DEFICIT (-{m.target - m.score}%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      NOMINAL
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 font-bold">{m.score}{m.unit}</strong>
                  <span className="text-slate-400 ml-1.5 font-normal">SLA: {m.target}{m.unit}</span>
                </div>
              </div>

              {/* Progress Bar with SLA Pin and Soft Corners */}
              <div className="relative w-full h-3 bg-slate-100 border border-slate-200 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${m.score}%`,
                    backgroundColor: m.color,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-slate-900 z-10"
                  style={{ left: `${m.target}%` }}
                  title={`Target SLA: ${m.target}%`}
                />
              </div>

              <div className="text-[11px] font-sans text-slate-500">
                {m.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong className="text-slate-900 font-semibold">Insight:</strong> High detection (92%) masks downstream investigation bypass (31%).
        </span>
      </div>
    </div>
  );
}
