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
  Search,
  ChevronRight,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  ShieldAlert,
  Zap,
  Filter,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { TotalRiskMeter } from '@/components/dashboard/TotalRiskMeter';
import { SocHealthScore } from '@/components/dashboard/SocHealthScore';
import { WhySocDegraded } from '@/components/dashboard/WhySocDegraded';
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
    // Smooth scroll down to Infographic Window if needed
    const elem = document.getElementById('infographic-window-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const topFinding = findings[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans text-xs pb-16">
      {/* 1. Header Toolbar */}
      <div className="soc-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                ANVĪKṢA Command Centre
              </h1>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                SOC-04
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Supervisory Operational Analytics &amp; Decision Integrity Enclave
            </p>
          </div>
        </div>

        {/* Benchmark Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px]">Scenario:</span>
            <select
              value={currentScenario}
              onChange={(e) => setCurrentScenario(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id} className="bg-white text-slate-900">
                  {scen.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRecalculate}
            disabled={evaluating}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'RE-EVALUATING...' : 'RE-EVALUATE'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-mono text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">SAKṢĪ #9905</span>
        </div>
      )}

      {/* 2. TOTAL RISK STAT METER & EXECUTIVE STATUS (AT THE TOP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        {/* Total Risk Stat Meter */}
        <div className="lg:col-span-4 flex flex-col">
          <TotalRiskMeter
            score={91}
            maxScore={100}
            confidence={94}
            scope="SOC-04"
            trendDelta="+18 pts (Shift Delta)"
          />
        </div>

        {/* SOC Health Assessment */}
        <div className="lg:col-span-4 flex flex-col">
          <SocHealthScore
            score={overview?.health_score ?? 78}
            grade={quadrants?.composite_grade ?? 'C-'}
            status={overview?.status ?? 'DEGRADED'}
            primaryDriver="Investigation effectiveness (-31 pts)"
          />
        </div>

        {/* Why SOC-04 is Degraded */}
        <div className="lg:col-span-4 flex flex-col">
          <WhySocDegraded />
        </div>
      </div>

      {/* 3. ALL SUPERVISORY INTELLIGENCE ENGINES */}
      <SupervisoryEnginesGrid
        onSelectEngine={handleSelectEngine}
      />

      {/* 4. DEDICATED INFOGRAPHIC INTELLIGENCE WINDOW (ALL DATA VISUALIZER) */}
      <div id="infographic-window-section">
        <InfographicIntelligenceWindow
          activeViewId={activeInfographicViewId}
          onViewChange={setActiveInfographicViewId}
        />
      </div>

      {/* 5. Top Priority Critical Finding Spotlight */}
      <TopFindingSpotlight
        finding={topFinding}
        onActionDispatch={handleActionDispatch}
      />

      {/* 6. Live Activity Stream & Tamper-Evident Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <HashChainLedger />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <LiveActivityStream />
        </div>
      </div>

      {/* 7. Prioritized Supervisory Findings Queue Table */}
      <div className="soc-panel overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Prioritized Supervisory Findings Queue
            </h3>
          </div>
          <Link href="/findings" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 font-sans">
            <span>View all 07 Findings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>SEVERITY</th>
                <th>FINDING &amp; IDENTIFIER</th>
                <th>ENGINE / TYPE</th>
                <th>CONFIDENCE</th>
                <th>SOC</th>
                <th>AFFECTED SCOPE</th>
                <th>DETECTED</th>
                <th className="text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/findings/${f.id}`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td>
                    <div className="font-sans font-bold text-slate-900 text-xs hover:text-blue-600">
                      {f.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{f.id}</div>
                  </td>
                  <td className="text-xs text-slate-600 whitespace-nowrap font-mono">{f.type}</td>
                  <td className="text-xs text-slate-900 font-bold whitespace-nowrap font-mono">
                    {Math.round(f.confidence * 100)}%
                  </td>
                  <td className="text-xs text-slate-600 whitespace-nowrap font-mono">{f.soc_scope}</td>
                  <td className="text-xs text-slate-600 whitespace-nowrap">{f.affected_scope}</td>
                  <td className="text-xs text-slate-400 whitespace-nowrap font-mono">{f.detected_time}</td>
                  <td className="text-right whitespace-nowrap">
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
