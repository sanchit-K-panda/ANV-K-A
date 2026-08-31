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
      color: '#10B981',
      deficit: 85 - detectionScore,
    },
    {
      name: 'Investigation',
      score: investigationScore,
      target: 85,
      unit: '%',
      status: investigationScore >= 85 ? 'NOMINAL' : 'DEFICIT',
      color: '#EF4444',
      deficit: 85 - investigationScore,
    },
    {
      name: 'Escalation',
      score: escalationScore,
      target: 80,
      unit: '%',
      status: escalationScore >= 80 ? 'NOMINAL' : 'DEFICIT',
      color: '#F59E0B',
      deficit: 80 - escalationScore,
    },
    {
      name: 'Response',
      score: responseScore,
      target: 75,
      unit: '%',
      status: responseScore >= 75 ? 'NOMINAL' : 'DEFICIT',
      color: '#3B82F6',
      deficit: 75 - responseScore,
    },
  ];

  return (
    <div className="soc-panel p-5 flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-mono text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            LIFECYCLE EFFECTIVENESS
          </span>
          <span className="text-slate-400 text-[10.5px]">SLA BENCHMARK</span>
        </div>

        {/* Horizontal Bars */}
        <div className="py-3 space-y-3.5">
          {metrics.map((m) => {
            const isDeficit = m.status === 'DEFICIT';

            return (
              <div key={m.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-sans">{m.name}</span>
                    {isDeficit && (
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        -{m.deficit}% SLA DEFICIT
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-700">
                    <strong className="text-slate-900 font-bold">{m.score}{m.unit}</strong>
                    <span className="text-slate-400 ml-1.5 font-normal">/ {m.target}{m.unit} target</span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${m.score}%`,
                      backgroundColor: m.color,
                    }}
                  />
                  {/* SLA Target Pin */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
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
      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="text-[11px] truncate">Detection nominal (92%), severe investigation drop (31%)</span>
        <Link href="/analytics" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 text-xs flex-shrink-0">
          <span>Lifecycle Analysis</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
