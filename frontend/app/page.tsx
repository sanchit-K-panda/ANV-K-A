'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchHealthOverview,
  fetchQuadrantScore,
  fetchFindings,
  evaluateScenario,
} from '@/lib/api';
import { Finding, SocHealthOverview, QuadrantScore } from '@/types';
import { SCENARIOS } from '@/lib/mockData';
import {
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { TotalRiskMeter } from '@/components/dashboard/TotalRiskMeter';
import { SocHealthScore } from '@/components/dashboard/SocHealthScore';
import { PerformanceBars } from '@/components/dashboard/PerformanceBars';
import { SupervisoryEnginesGrid, EngineItem } from '@/components/dashboard/SupervisoryEnginesGrid';
import { SupervisoryConstellation, SupervisoryNode } from '@/components/dashboard/SupervisoryConstellation';
import { InfographicIntelligenceWindow } from '@/components/dashboard/InfographicIntelligenceWindow';
import { TopFindingSpotlight } from '@/components/dashboard/TopFindingSpotlight';
import { LiveActivityStream } from '@/components/dashboard/LiveActivityStream';
import { HashChainLedger } from '@/components/infographics/HashChainLedger';

export default function CommandCentrePage() {
  const router = useRouter();

  const [currentScenario, setCurrentScenario] = useState<string>('investigation_gap');
  const [overview, setOverview] = useState<SocHealthOverview | null>(null);
  const [quadrants, setQuadrants] = useState<QuadrantScore | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeInfographicViewId, setActiveInfographicViewId] = useState<string>('execution-gap');
  const [activeEngineViewMode, setActiveEngineViewMode] = useState<'RADAR' | 'GRID'>('GRID');

  const loadData = async (scen = currentScenario) => {
    setLoading(true);
    try {
      const [ov, quad, fnds] = await Promise.all([
        fetchHealthOverview(scen),
        fetchQuadrantScore(scen),
        fetchFindings({ scenario: scen }),
      ]);
      setOverview(ov);
      setQuadrants(quad);
      setFindings(fnds);
    } catch (err) {
      console.error('Data load failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentScenario);
  }, [currentScenario]);

  const handleRecalculate = async () => {
    setEvaluating(true);
    try {
      await evaluateScenario(currentScenario);
      await loadData(currentScenario);
    } finally {
      setEvaluating(false);
    }
  };

  const handleActionDispatch = (action: string) => {
    setActionNotice(`Action executed: ${action}. Cryptographic entry recorded on SAKṢĪ audit ledger.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSelectEngine = (engine: EngineItem) => {
    setActiveInfographicViewId(engine.targetInfographicId);
    const elem = document.getElementById('infographic-window-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectConstellationNode = (node: SupervisoryNode) => {
    setActiveInfographicViewId(node.targetInfographicId);
  };

  const topFinding = findings[0] || null;

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Page Header with Sovereign Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-3xs font-mono text-soc-textMuted mb-1">
            <span className="font-semibold text-soc-text">ANVĪKṢA</span>
            <span>/</span>
            <span>SUPERVISORY_INTEL</span>
            <span>/</span>
            <span className="text-soc-accent font-semibold">ENCLAVE_SOC-04</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-soc-text font-display flex items-center gap-2.5">
            <span>Supervisory SOC Command Centre</span>
            <span className="h-2 w-2 rounded-full bg-soc-accent" />
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Real-time supervisory telemetry · SOP omission verification · Cryptographic SAKṢĪ hash-chain audit
          </p>
        </div>

        {/* Benchmark Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative">
            <select
              value={currentScenario}
              onChange={(e) => setCurrentScenario(e.target.value)}
              className="appearance-none soc-input !w-auto !pr-8 !py-1.5 font-mono font-semibold cursor-pointer text-xs bg-soc-panel border-soc-border focus:border-soc-accent shadow-sm"
              aria-label="Evaluation scenario"
            >
              {SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-soc-accent absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleRecalculate}
            disabled={evaluating || loading}
            className="btn-primary font-mono text-xs !px-3.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'EVALUATING...' : 'RE-EVALUATE'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="animate-fade-up px-4 py-3 bg-soc-ok/10 border border-soc-ok/40 rounded-lg text-xs font-mono font-semibold text-soc-ok flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-soc-ok" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-3xs font-bold text-soc-ok/80">SAKṢĪ #9905</span>
        </div>
      )}

      {/* 2. Verdict Strip — health, composite risk, lifecycle in one band */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <SocHealthScore
            score={overview?.health_score ?? 78}
            grade={quadrants?.composite_grade ?? 'C-'}
            status={overview?.status ?? 'DEGRADED'}
            primaryDriver="Investigation effectiveness (-31 pts)"
          />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '110ms' }}>
          <TotalRiskMeter
            score={91}
            maxScore={100}
            confidence={94}
            scope="SOC-04"
            trendDelta="+18 pts (Shift Delta)"
          />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '170ms' }}>
          <PerformanceBars
            detectionScore={quadrants?.detection_score ?? 92}
            investigationScore={quadrants?.investigation_score ?? 31}
            escalationScore={quadrants?.escalation_score ?? 48}
            responseScore={quadrants?.response_score ?? 64}
          />
        </div>
      </div>

      {/* 3. Supervisory Intelligence Engines (Tactical Grid or Topology Map) */}
      <div className="space-y-2 animate-fade-up" style={{ animationDelay: '230ms' }}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="panel-label text-soc-text">COGNITIVE ENGINE TELEMETRY</span>
            <span className="text-3xs font-mono text-soc-accent font-semibold px-1.5 py-0.5 rounded bg-soc-accentDim border border-soc-accent/30">
              8 ACTIVE ENGINES
            </span>
          </div>

          {/* View Mode Toggle: GRID vs TOPOLOGY */}
          <div className="flex items-center rounded-md border border-soc-border p-0.5 bg-soc-panel text-3xs font-mono">
            <button
              type="button"
              onClick={() => setActiveEngineViewMode('GRID')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeEngineViewMode === 'GRID'
                  ? 'bg-soc-accent text-white font-bold'
                  : 'text-soc-textMuted hover:text-soc-text'
              }`}
            >
              GRID
            </button>
            <button
              type="button"
              onClick={() => setActiveEngineViewMode('RADAR')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeEngineViewMode === 'RADAR'
                  ? 'bg-soc-accent text-white font-bold'
                  : 'text-soc-textMuted hover:text-soc-text'
              }`}
            >
              TOPOLOGY
            </button>
          </div>
        </div>

        {activeEngineViewMode === 'RADAR' ? (
          <SupervisoryConstellation
            onSelectNode={handleSelectConstellationNode}
          />
        ) : (
          <SupervisoryEnginesGrid
            onSelectEngine={handleSelectEngine}
          />
        )}
      </div>

      {/* 4. Intelligence Window (all data visualizer) */}
      <div id="infographic-window-section" className="animate-fade-up" style={{ animationDelay: '290ms' }}>
        <InfographicIntelligenceWindow
          activeViewId={activeInfographicViewId}
          onViewChange={setActiveInfographicViewId}
        />
      </div>

      {/* 5. Top Finding + Live Stream — asymmetric 8/4 split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 animate-fade-up flex flex-col" style={{ animationDelay: '350ms' }}>
          <TopFindingSpotlight
            finding={topFinding}
            onActionDispatch={handleActionDispatch}
          />
        </div>
        <div className="lg:col-span-4 animate-fade-up flex flex-col" style={{ animationDelay: '410ms' }}>
          <LiveActivityStream />
        </div>
      </div>

      {/* 6. Findings Queue + Ledger — asymmetric 8/4 split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 animate-fade-up" style={{ animationDelay: '470ms' }}>
          <div className="soc-panel overflow-hidden bg-soc-panel">
            <div className="soc-panel-header">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-md bg-soc-crit/10 border border-soc-crit/30 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-soc-crit" />
                </span>
                <div>
                  <span className="panel-label">PRIORITIZED FINDINGS QUEUE</span>
                  <p className="text-2xs font-mono text-soc-textMuted mt-0.5">Ranked by Bayesian composite risk score</p>
                </div>
              </div>
              <Link href="/findings" className="text-xs font-mono text-soc-accent hover:text-soc-accentBright font-bold flex items-center gap-1 transition-colors">
                <span>ALL FINDINGS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Finding</th>
                    <th>Confidence</th>
                    <th>Affected Scope</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => router.push(`/findings/${f.id}`)}
                      className="cursor-pointer group"
                    >
                      <td className="whitespace-nowrap">
                        <SeverityBadge severity={f.severity} />
                      </td>
                      <td className="max-w-[300px]">
                        <div className="font-semibold text-soc-text text-xs leading-snug line-clamp-2 group-hover:text-soc-accent transition-colors font-display">
                          {f.title}
                        </div>
                        <div className="col-mono text-soc-accent font-bold mt-0.5">{f.id}</div>
                      </td>
                      <td className="text-xs font-bold font-mono text-soc-text tabular-nums whitespace-nowrap">
                        {Math.round(f.confidence * 100)}%
                      </td>
                      <td className="text-xs font-mono text-soc-textSecondary whitespace-nowrap">{f.affected_scope}</td>
                      <td className="text-right whitespace-nowrap">
                        <StatusBadge status={f.status} />
                      </td>
                    </tr>
                  ))}
                  {findings.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs font-mono text-soc-textMuted">
                        NO FINDINGS DETECTED IN THE CURRENT SCENARIO
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 animate-fade-up" style={{ animationDelay: '530ms' }}>
          <HashChainLedger />
        </div>
      </div>
    </div>
  );
}
