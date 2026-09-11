'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS } from '@/lib/scenarios';
import { evaluateScenario } from '@/lib/api';
import { Play, RefreshCw, X, Radio, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SimulateModal({ isOpen, onClose, onSuccess }: SimulateModalProps) {
  const router = useRouter();
  const [runningId, setRunningId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [completedScenario, setCompletedScenario] = useState<{ id: string; name: string } | null>(null);

  if (!isOpen) return null;

  const handleRun = async (id: string, name: string) => {
    setRunningId(id);
    setStatusMsg(`Simulating ${name}: generating workflow exhaust & running VIKĀRA ML evaluation...`);
    try {
      await evaluateScenario(id);
      setCompletedScenario({ id, name });
      setStatusMsg(`Evaluation complete! ML anomaly models recalculated.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatusMsg(`Simulation error: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b101b] border border-cyan-500/30 rounded-2xl w-full max-w-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#070b12]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">Run Scenario Simulation (MĀYĀ Engine)</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  7 Scenarios
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Inject synthetic workflow exhaust to evaluate supervisory anomaly detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completion Banner */}
        {completedScenario && (
          <div className="p-4 bg-emerald-950/60 border-b border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-emerald-900/80 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300">
                  Successfully Evaluated: {completedScenario.name}
                </h4>
                <p className="text-[11px] text-gray-300">
                  Workflow exhaust ingested • VIKĀRA anomaly scores updated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  router.push(`/?scenario=${completedScenario.id}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                <span>Command Centre Findings</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 border border-gray-700 transition-all"
              >
                View Radar Here
              </button>
            </div>
          </div>
        )}

        {/* Status banner if running */}
        {statusMsg && !completedScenario && (
          <div className="px-6 py-2.5 bg-cyan-950/60 border-b border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Scenario list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {SCENARIOS.map((sc) => {
            const isRunning = runningId === sc.id;
            return (
              <div
                key={sc.id}
                className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">{sc.name}</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                      10,000 EVT
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xl">{sc.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRun(sc.id, sc.name)}
                    disabled={isRunning || runningId !== null}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-cyan-950 transition-all"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#070b12] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic air-gapped simulation engine (zero external dependencies).</span>
          </div>
          <button
            onClick={() => {
              onClose();
              router.push('/scenarios');
            }}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-xs underline-offset-4 hover:underline"
          >
            <span>Open Full Live Stream Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
