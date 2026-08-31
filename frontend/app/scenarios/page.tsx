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
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              MĀYĀ + PARĪKṢA
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              7-Scenario Simulation Hub
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Test and demonstrate ANVĪKṢA offline supervisory detection across 7 synthetic benchmark attack scenarios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className="p-4 bg-[#0C0E12] border border-[#232732] flex flex-col justify-between space-y-3 hover:border-white transition-colors"
          >
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white font-sans">{sc.name}</span>
                <span className="text-[10px] text-white font-bold">10,000 EVT</span>
              </div>
              <p className="text-[11px] text-[#848B98] mt-1.5 font-sans">{sc.desc}</p>
            </div>

            <button
              onClick={() => handleLaunchScenario(sc.id)}
              disabled={runningId === sc.id}
              className="w-full py-2 bg-white text-black hover:bg-[#E5E7EB] font-bold text-xs border border-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
