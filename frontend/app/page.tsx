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
import { HealthGauge } from '@/components/infographics/HealthGauge';
import { PipelineFlow } from '@/components/infographics/PipelineFlow';
import { WorkflowGapDiagram } from '@/components/infographics/WorkflowGapDiagram';
import { PerformanceLifecycleChart } from '@/components/infographics/PerformanceLifecycleChart';
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
    setActionNotice(`Dispatched action: ${action}. Cryptographic entry recorded on SAKṢĪ audit ledger.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const topFinding = findings[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-xs pb-16">
      {/* 1. Header Bar with Benchmark Scenario Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                ANVĪKṢA Command Centre
              </h1>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                SOC-04
              </span>
            </div>
            <p className="text-xs font-sans text-slate-500 mt-0.5">
              Supervisory Operational Analytics &amp; Decision Integrity Enclave
            </p>
          </div>
        </div>

        {/* Benchmark Selector & Re-evaluate */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Scenario:</span>
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
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'RE-EVALUATING...' : 'RE-EVALUATE'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono text-emerald-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">SAKṢĪ BLOCK #9905</span>
        </div>
      )}

      {/* 2. Top Metric Strip + Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Health Gauge Infographic (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <HealthGauge
            score={overview?.health_score ?? 78}
            grade={quadrants?.composite_grade ?? 'C-'}
            status={overview?.status ?? 'DEGRADED'}
          />
        </div>

        {/* Executive KPI Bento Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5 font-mono">
          <Link
            href="/findings?severity=CRITICAL"
            className="p-4 bg-white border border-slate-200 hover:border-rose-300 hover:shadow-card-hover transition-all rounded-2xl block space-y-1 group shadow-card"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Critical Findings</span>
              <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.critical_findings ? String(overview.critical_findings).padStart(2, '0') : '07'}
            </div>
            <div className="text-[10px] text-rose-700 font-bold flex items-center gap-0.5">
              <span>Urgent Action Required</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>

          <Link
            href="/analytics"
            className="p-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-card-hover transition-all rounded-2xl block space-y-1 group shadow-card"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Execution Gaps</span>
              <Zap className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.execution_gaps ?? 14}
            </div>
            <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
              <span>VIVEKA Engine</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>

          <Link
            href="/analytics"
            className="p-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-card-hover transition-all rounded-2xl block space-y-1 group shadow-card"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Negative Space</span>
              <Search className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.negative_space ? String(overview.negative_space).padStart(2, '0') : '06'}
            </div>
            <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
              <span>ABHĀVA Engine</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>

          <Link
            href="/threats"
            className="p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-card-hover transition-all rounded-2xl block space-y-1 group shadow-card"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Recurring Threats</span>
              <Activity className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.threat_recurrences ? String(overview.threat_recurrences).padStart(2, '0') : '08'}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <span>PUNARĀVṚTTI</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>

          <Link
            href="/workload"
            className="p-4 bg-white border border-slate-200 hover:border-amber-300 hover:shadow-card-hover transition-all rounded-2xl block space-y-1 group shadow-card"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Active Anomalies</span>
              <Activity className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.active_anomalies ?? 23}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
              <span>VIKĀRA ML</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>

          <Link
            href="/audit"
            className="p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-card-hover transition-all rounded-2xl block space-y-1 group shadow-card"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Audit Chain</span>
              <Shield className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              100%
            </div>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
              <span>SAKṢĪ Verified</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Infographic: 5-Stage Data Pipeline */}
      <PipelineFlow />

      {/* 4. Infographics: Execution Gap & Performance Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <WorkflowGapDiagram />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <PerformanceLifecycleChart
            detectionScore={quadrants?.detection_score ?? 92}
            investigationScore={quadrants?.investigation_score ?? 31}
            escalationScore={quadrants?.escalation_score ?? 48}
            responseScore={quadrants?.response_score ?? 64}
          />
        </div>
      </div>

      {/* 5. Top Critical Finding Spotlight */}
      {topFinding && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 font-mono shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                TOP CRITICAL FINDING
              </span>
              <span className="font-mono text-slate-900 font-bold text-xs">{topFinding.id}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-900 font-bold font-sans text-xs">{topFinding.title}</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500">RISK SCORE: </span>
                <strong className="text-rose-700 font-bold text-sm">{topFinding.risk_score}/100</strong>
              </div>
              <div>
                <span className="text-slate-500">CONFIDENCE: </span>
                <strong className="text-slate-900 font-bold">{Math.round(topFinding.confidence * 100)}%</strong>
              </div>
              <StatusBadge status={topFinding.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Why Detected */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[10.5px] text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Mathematical Deviation</span>
              </div>
              <div className="text-xs space-y-1 pt-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Baseline Rate:</span>
                  <span className="text-slate-900 font-bold">{topFinding.baseline_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Observed Rate:</span>
                  <span className="text-rose-700 font-bold">{topFinding.observed_value}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="text-slate-500">Net Deviation:</span>
                  <span className="text-rose-700 font-bold">{topFinding.deviation}</span>
                </div>
              </div>
              <p className="text-xs font-sans text-slate-600 pt-1 leading-normal">
                Mean dwell time was 42 seconds versus 44 minutes human baseline.
              </p>
            </div>

            {/* Evidence Provenance */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[10.5px] text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Forensic Scope &amp; Evidence</span>
              </div>
              <div className="text-xs space-y-1 pt-0.5 text-slate-700">
                <div>Target Asset: <strong className="text-slate-900">DC-PROD-01 (10.14.2.1)</strong></div>
                <div>Assigned Analyst: <strong className="text-slate-900">Analyst A-01</strong></div>
                <div>Affected Alerts: <strong className="text-rose-700">83 critical alerts</strong></div>
              </div>
              <Link
                href={`/findings/${topFinding.id}`}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium pt-1 inline-flex items-center gap-1"
              >
                <span>Inspect 7-Point Explainability Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recommended Action */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-[10.5px] text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Recommended Action (UPĀYA)</span>
                </div>
                <p className="text-xs font-sans text-slate-700 mt-1 leading-snug">
                  &ldquo;{topFinding.recommendation}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleActionDispatch('OPEN_SUPERVISORY_INVESTIGATION')}
                  className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  OPEN INVESTIGATION
                </button>
                <button
                  type="button"
                  onClick={() => handleActionDispatch('REOPEN_83_ALERTS')}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 font-medium text-xs rounded-xl hover:bg-slate-100 transition-colors"
                >
                  REOPEN ALERTS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tamper-Evident Hash Chain */}
      <HashChainLedger />

      {/* 7. Prioritized Findings Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden font-mono shadow-card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Prioritized Supervisory Findings Queue
            </h3>
          </div>
          <Link href="/findings" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
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
                  <td className="text-xs text-slate-600 whitespace-nowrap">{f.type}</td>
                  <td className="text-xs text-slate-900 font-bold whitespace-nowrap">
                    {Math.round(f.confidence * 100)}%
                  </td>
                  <td className="text-xs text-slate-600 whitespace-nowrap">{f.affected_scope}</td>
                  <td className="text-xs text-slate-400 whitespace-nowrap">{f.detected_time}</td>
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
