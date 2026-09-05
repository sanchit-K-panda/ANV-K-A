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
    },
    {
      name: 'Investigation Rate',
      score: investigationScore,
      target: 85,
      unit: '%',
      status: investigationScore >= 85 ? 'HEALTHY' : 'DEFICIT',
      description: 'Percentage of high/critical alerts receiving forensic memory/process inspection.',
    },
    {
      name: 'Escalation Integrity',
      score: escalationScore,
      target: 80,
      unit: '%',
      status: escalationScore >= 80 ? 'HEALTHY' : 'DEFICIT',
      description: 'Cases appropriately routed to Tier 2/3 and incident commander queues.',
    },
    {
      name: 'Response Dwell SLA',
      score: responseScore,
      target: 75,
      unit: '%',
      status: responseScore >= 75 ? 'HEALTHY' : 'DEFICIT',
      description: 'Mean containment and host isolation completed within compliance timeframes.',
    },
  ];

  return (
    <div className="soc-panel space-y-4 p-5 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
          <h3 className="panel-label">SOC Lifecycle Performance vs SLA</h3>
        </div>
        <Link href="/analytics" className="text-[11px] text-soc-accent transition-colors hover:text-soc-accentBright">
          MEDHĀ Analytics →
        </Link>
      </div>

      {/* SLA bars */}
      <div className="space-y-4 text-xs">
        {metrics.map((m, idx) => {
          const isDeficit = m.status === 'DEFICIT';

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-soc-text">{m.name}</span>
                  {isDeficit ? (
                    <span className="rounded-sm border border-soc-crit/30 bg-soc-critDim px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-soc-crit">
                      DEFICIT (-{m.target - m.score}%)
                    </span>
                  ) : (
                    <span className="rounded-sm border border-soc-ok/30 bg-soc-okDim px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-soc-ok">
                      NOMINAL
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  <strong className="font-bold tabular-nums text-soc-text">{m.score}{m.unit}</strong>
                  <span className="ml-1.5 font-normal tabular-nums text-soc-textMuted">SLA: {m.target}{m.unit}</span>
                </div>
              </div>

              {/* Progress bar with 1px SLA target pin */}
              <div className="relative h-2.5 w-full overflow-hidden border border-soc-border bg-soc-raised">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${m.score}%`,
                    backgroundColor: isDeficit ? 'rgb(var(--soc-crit))' : 'rgb(var(--soc-ok))',
                  }}
                />
                <div
                  className="absolute inset-y-0 z-10 w-px bg-soc-text"
                  style={{ left: `${m.target}%` }}
                  title={`Target SLA: ${m.target}%`}
                />
              </div>

              <div className="font-sans text-[11px] text-soc-textMuted">{m.description}</div>
            </div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="flex items-center gap-2 border-t border-soc-border pt-3 text-[11px] text-soc-textSecondary">
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-soc-med" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-soc-text">Insight:</strong> High detection (92%) masks downstream investigation bypass (31%).
        </span>
      </div>
    </div>
  );
}
