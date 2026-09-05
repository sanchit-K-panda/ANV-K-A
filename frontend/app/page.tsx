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

  const topFinding = findings[0] || null;

  return (
    <div className="space-y-4 pb-10">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-0.5">
            <span className="font-semibold text-soc-text">ANVĪKṢA</span>
            <span>/</span>
            <span>COMMAND_CENTRE</span>
            <span>/</span>
            <span className="text-soc-accent font-medium">ENCLAVE_SOC-04</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-soc-text">
            Supervisory SOC Command Centre
          </h1>
          <p className="text-xs text-soc-textSecondary mt-0.5">
            Real-time supervisory telemetry, SOP omission verification & cryptographic decision audit
          </p>
        </div>

        {/* Benchmark Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <select
              value={currentScenario}
              onChange={(e) => setCurrentScenario(e.target.value)}
              className="appearance-none soc-input !w-auto !pr-8 !py-1.5 font-medium cursor-pointer text-xs"
              aria-label="Evaluation scenario"
            >
              {SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-soc-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleRecalculate}
            disabled={evaluating || loading}
            className="btn-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating...' : 'Re-evaluate'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="animate-fade-up px-4 py-3 bg-soc-okDim border border-soc-ok/30 rounded-xl text-xs font-medium text-soc-ok flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-2xs font-mono">SAKṢĪ #9905</span>
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

      {/* 3. Supervisory Intelligence Engines */}
      <div className="animate-fade-up" style={{ animationDelay: '230ms' }}>
        <SupervisoryEnginesGrid
          onSelectEngine={handleSelectEngine}
        />
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
          <div className="soc-panel overflow-hidden">
            <div className="soc-panel-header">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-soc-critDim flex items-center justify-center">
                  <ShieldAlert className="w-3.5 h-3.5 text-soc-crit" />
                </span>
                <div>
                  <span className="panel-label">Prioritized Findings Queue</span>
                  <p className="text-2xs text-soc-textMuted mt-0.5">Ranked by composite risk score</p>
                </div>
              </div>
              <Link href="/findings" className="text-xs text-soc-accent hover:text-soc-accentBright font-medium flex items-center gap-1 transition-colors">
                <span>All findings</span>
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
                    <th>Affected scope</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => router.push(`/findings/${f.id}`)}
                      className="cursor-pointer"
                    >
                      <td className="whitespace-nowrap">
                        <SeverityBadge severity={f.severity} />
                      </td>
                      <td className="max-w-[300px]">
                        <div className="font-semibold text-soc-text text-xs leading-snug line-clamp-2">
                          {f.title}
                        </div>
                        <div className="col-mono mt-0.5">{f.id}</div>
                      </td>
                      <td className="text-xs font-semibold text-soc-text tabular-nums whitespace-nowrap">
                        {Math.round(f.confidence * 100)}%
                      </td>
                      <td className="text-xs text-soc-textSecondary whitespace-nowrap">{f.affected_scope}</td>
                      <td className="text-right whitespace-nowrap">
                        <StatusBadge status={f.status} />
                      </td>
                    </tr>
                  ))}
                  {findings.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-sm text-soc-textMuted">
                        No findings in the current scenario
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
