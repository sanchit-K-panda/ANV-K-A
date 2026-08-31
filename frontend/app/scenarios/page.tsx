'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS } from '@/lib/mockData';
import { evaluateScenario } from '@/lib/api';
import { Play, RefreshCw, Layers } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Simulation &amp; Benchmark Hub
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              MĀYĀ + PARĪKṢA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Evaluate ANVĪKṢA offline supervisory detection across 7 synthetic benchmark attack scenarios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className="soc-panel p-5 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 font-sans">{sc.name}</span>
                <span className="text-[10.5px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  10,000 EVT
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 font-sans leading-relaxed">{sc.desc}</p>
            </div>

            <button
              onClick={() => handleLaunchScenario(sc.id)}
              disabled={runningId === sc.id}
              className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              {runningId === sc.id ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>EVALUATING MĀYĀ ENGINE...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>EXECUTE SCENARIO IN COMMAND CENTRE</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
