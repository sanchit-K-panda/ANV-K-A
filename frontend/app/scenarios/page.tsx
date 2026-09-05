'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS } from '@/lib/mockData';
import { evaluateScenario } from '@/lib/api';
import { Play, RefreshCw } from 'lucide-react';

export default function ScenariosPage() {
  const router = useRouter();
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleLaunchScenario = async (id: string) => {
    setRunningId(id);
    try {
      await evaluateScenario(id);
      router.push(`/?scenario=${id}`);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>SIMULATION</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Simulation &amp; Benchmark Hub</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Evaluate ANVĪKṢA offline supervisory detection across 7 synthetic benchmark attack scenarios.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {SCENARIOS.length} benchmark scenarios
        </span>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className="soc-panel card-hover overflow-hidden flex flex-col justify-between"
          >
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs font-medium text-soc-text">{sc.name}</span>
                <span className="soc-badge badge-neutral whitespace-nowrap">10,000 EVT</span>
              </div>
              <p className="text-xs text-soc-textSecondary leading-relaxed">{sc.desc}</p>
            </div>

            <div className="border-t border-soc-border p-3">
              <button
                onClick={() => handleLaunchScenario(sc.id)}
                disabled={runningId === sc.id}
                className="btn-primary w-full disabled:opacity-50"
              >
                {runningId === sc.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Māyā engine...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Execute scenario in command centre</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
