'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface PerformanceBarsProps {
  detectionScore?: number;
  investigationScore?: number;
  escalationScore?: number;
  responseScore?: number;
}

export const PerformanceBars: React.FC<PerformanceBarsProps> = ({
  detectionScore = 92,
  investigationScore = 31,
  escalationScore = 48,
  responseScore = 64,
}) => {
  const metrics = [
    {
      name: 'Detection',
      score: detectionScore,
      target: 85,
      unit: '%',
      status: detectionScore >= 85 ? 'NOMINAL' : 'DEFICIT',
      bar: 'bg-soc-ok',
      deficit: 85 - detectionScore,
    },
    {
      name: 'Investigation',
      score: investigationScore,
      target: 85,
      unit: '%',
      status: investigationScore >= 85 ? 'NOMINAL' : 'DEFICIT',
      bar: 'bg-soc-crit',
      deficit: 85 - investigationScore,
    },
    {
      name: 'Escalation',
      score: escalationScore,
      target: 80,
      unit: '%',
      status: escalationScore >= 80 ? 'NOMINAL' : 'DEFICIT',
      bar: 'bg-soc-high',
      deficit: 80 - escalationScore,
    },
    {
      name: 'Response',
      score: responseScore,
      target: 75,
      unit: '%',
      status: responseScore >= 75 ? 'NOMINAL' : 'DEFICIT',
      bar: 'bg-soc-accent',
      deficit: 75 - responseScore,
    },
  ];

  return (
    <div className="soc-panel flex flex-col justify-between select-none h-full">
      <div>
        {/* Header */}
        <div className="soc-panel-header">
          <span className="panel-label">Lifecycle Effectiveness</span>
          <span className="text-2xs font-mono text-soc-textMuted">SLA BENCHMARK</span>
        </div>

        {/* Horizontal Bars */}
        <div className="px-4 py-3.5 space-y-3.5">
          {metrics.map((m) => {
            const isDeficit = m.status === 'DEFICIT';

            return (
              <div key={m.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-soc-text">{m.name}</span>
                    {isDeficit && (
                      <span className="soc-badge badge-critical">-{m.deficit}% SLA DEFICIT</span>
                    )}
                  </div>
                  <div className="font-mono text-2xs text-soc-textMuted tabular-nums">
                    <span className="text-soc-text font-semibold text-xs">{m.score}{m.unit}</span>
                    <span className="ml-1.5">/ {m.target}{m.unit} TARGET</span>
                  </div>
                </div>

                {/* Progress Track with SLA Target Pin */}
                <div className="relative w-full h-1.5 bg-soc-raised rounded-sm overflow-visible">
                  <div
                    className={`h-full rounded-sm transition-all duration-300 ${m.bar}`}
                    style={{ width: `${m.score}%` }}
                  />
                  <div
                    className="absolute top-[-3px] bottom-[-3px] w-px bg-soc-textDim z-10"
                    style={{ left: `${m.target}%` }}
                    title={`SLA Target: ${m.target}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Insight */}
      <div className="px-4 py-3 border-t border-soc-border flex items-center justify-between text-xs font-mono gap-3">
        <span className="text-2xs text-soc-textMuted truncate">Detection nominal (92%), severe investigation drop (31%)</span>
        <Link href="/analytics" className="text-soc-accent hover:text-soc-accentBright font-medium flex items-center gap-0.5 text-2xs flex-shrink-0 transition-colors">
          <span>LIFECYCLE</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
