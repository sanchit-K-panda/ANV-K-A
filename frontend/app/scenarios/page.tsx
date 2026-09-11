'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS } from '@/lib/scenarios';
import { evaluateScenario } from '@/lib/api';
import { Play, RefreshCw, Radio, Terminal, ShieldAlert, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface StreamLog {
  id: string;
  time: string;
  event: string;
  analyst: string;
  status: 'NORMAL' | 'ANOMALOUS' | 'OMISSION';
}

export default function ScenariosPage() {
  const router = useRouter();
  const [runningId, setRunningId] = useState<string | null>(null);

  // Live Stream Simulation State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamScenario, setStreamScenario] = useState<string>('investigation_gap');
  const [streamLogs, setStreamLogs] = useState<StreamLog[]>([]);
  const [anomalyScore, setAnomalyScore] = useState<number>(12);
  const [streamComplete, setStreamComplete] = useState<boolean>(false);

  const handleLaunchScenario = async (id: string) => {
    setRunningId(id);
    try {
      await evaluateScenario(id);
      router.push(`/?scenario=${id}`);
    } finally {
      setRunningId(null);
    }
  };

  const handleStartLiveStream = (scenarioId: string) => {
    setStreamScenario(scenarioId);
    setIsStreaming(true);
    setStreamComplete(false);
    setStreamLogs([]);
    setAnomalyScore(14);
  };

  useEffect(() => {
    if (!isStreaming) return;

    const sampleEvents = [
      { event: 'ALERT_INGEST: Lateral Movement detected on Core-DC-04', analyst: 'SYSTEM', status: 'NORMAL' as const },
      { event: 'ANALYST_CLAIM: Incident claimed by L1-Analyst', analyst: 'ANL-042', status: 'NORMAL' as const },
      { event: 'WORKFLOW_CHECK: Investigation notes required for Tier-1', analyst: 'SYSTEM', status: 'NORMAL' as const },
      { event: 'OMISSION_DETECTED: Alert marked RESOLVED with 0 queries executed', analyst: 'ANL-042', status: 'OMISSION' as const },
      { event: 'VIKĀRA_SCORE: Velocity z-score anomalous (4.2 sigma)', analyst: 'MEDHĀ', status: 'ANOMALOUS' as const },
      { event: 'VIVEKA_ENGINE: Rule R-04 triggered (Rapid False-Positive Closure)', analyst: 'VIVEKA', status: 'ANOMALOUS' as const },
      { event: 'PRATYAYA_GROUNDING: Grounded in 3 omitted forensic steps', analyst: 'PRATYAYA', status: 'ANOMALOUS' as const },
      { event: 'EXAMINER_INJECT: Case CASE-2026-09-402 queued for NTRO inspection', analyst: 'SAKṢĪ', status: 'ANOMALOUS' as const },
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < sampleEvents.length) {
        const item = sampleEvents[currentIdx];
        const newLog: StreamLog = {
          id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
          time: new Date().toLocaleTimeString(),
          event: item.event,
          analyst: item.analyst,
          status: item.status,
        };
        setStreamLogs(prev => [newLog, ...prev]);
        setAnomalyScore(prev => Math.min(94, prev + 11));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setStreamComplete(true);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="space-y-6 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>SIMULATION &amp; BENCHMARK</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-emerald-400 font-bold">SOVEREIGN AIR-GAP</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">
            Simulation &amp; Live Telemetry Hub
          </h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Evaluate ANVĪKṢA offline supervisory detection across 7 synthetic benchmark attack scenarios with live stream injection.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {SCENARIOS.length} benchmark scenarios
        </span>
      </div>

      {/* Live Stream Injection Console */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Radio className={`w-5 h-5 ${isStreaming ? 'animate-pulse text-red-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Live Telemetry &amp; Anomaly Injection Console</h3>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${isStreaming ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse' : 'bg-gray-800 text-gray-300'}`}>
                  {isStreaming ? 'STREAMING ACTIVE' : streamComplete ? 'INSPECTION READY' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Stream synthetic workflow exhaust to evaluate real-time VIKĀRA / VIVEKA reactions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={streamScenario}
              onChange={(e) => setStreamScenario(e.target.value)}
              disabled={isStreaming}
              className="bg-gray-900 border border-gray-700 text-xs text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {SCENARIOS.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
            <button
              onClick={() => handleStartLiveStream(streamScenario)}
              disabled={isStreaming}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition-all shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isStreaming ? 'Streaming Packets...' : 'Inject Live Stream'}</span>
            </button>
          </div>
        </div>

        {/* Live Gauges & Terminal Output */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Anomaly Reaction Gauge */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-mono text-gray-400 uppercase">VIKĀRA Anomaly Gauge</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-mono font-black ${anomalyScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {anomalyScore}%
                </span>
                <span className="text-xs text-gray-400">Risk Intensity</span>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-500 ${anomalyScore > 50 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${anomalyScore}%` }}
                />
              </div>
            </div>

            {streamComplete ? (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Supervisory Breach Captured</span>
                </div>
                <p className="text-gray-300 text-[11px]">
                  Omission pattern identified. 1 prioritized sample dispatched to Examiner Queue.
                </p>
                <button
                  onClick={() => router.push('/supervision')}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-red-900/80 hover:bg-red-800 text-white font-semibold text-[11px] transition-colors"
                >
                  <span>Open in Supervisory Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Deterministic air-gap rules engine ready.</span>
              </div>
            )}
          </div>

          {/* Terminal Output */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-black/80 border border-gray-800 font-mono text-xs flex flex-col justify-between h-52 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2 text-gray-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>SOVEREIGN EXHAUST STREAM // 127.0.0.1</span>
              </span>
              <span>{streamLogs.length} events received</span>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {streamLogs.length === 0 ? (
                <div className="text-gray-600 italic py-6 text-center">
                  Press &ldquo;Inject Live Stream&rdquo; above to initiate live telemetry flow...
                </div>
              ) : (
                streamLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed text-[11px]">
                    <span className="text-gray-500 shrink-0">[{log.time}]</span>
                    <span className={`px-1 rounded text-[10px] shrink-0 ${log.status === 'OMISSION' ? 'bg-amber-950 text-amber-300' : log.status === 'ANOMALOUS' ? 'bg-red-950 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                      {log.status}
                    </span>
                    <span className="text-gray-300 truncate">{log.event}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up">
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

            <div className="border-t border-soc-border p-3 flex gap-2">
              <button
                onClick={() => handleLaunchScenario(sc.id)}
                disabled={runningId === sc.id}
                className="btn-primary flex-1 disabled:opacity-50 text-xs"
              >
                {runningId === sc.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Evaluate in Command Centre</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleStartLiveStream(sc.id)}
                disabled={isStreaming}
                className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono transition-colors shrink-0"
                title="Stream this scenario live in the console above"
              >
                Stream ⚡
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
