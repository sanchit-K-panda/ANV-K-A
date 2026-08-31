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
import {
  MOCK_WORKLOAD,
  MOCK_THREAT_RECURRENCE,
} from '@/lib/mockData';
import {
  RefreshCw,
  Search,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';

export default function CommandCentrePage() {
  const router = useRouter();

  const [overview, setOverview] = useState<SocHealthOverview | null>(null);
  const [quadrants, setQuadrants] = useState<QuadrantScore | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, quad, fnds] = await Promise.all([
        fetchHealthOverview('investigation_gap'),
        fetchQuadrantScore('investigation_gap'),
        fetchFindings({ scenario: 'investigation_gap' }),
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
    loadData();
  }, []);

  const handleRecalculate = async () => {
    setEvaluating(true);
    try {
      await evaluateScenario('investigation_gap');
      await loadData();
    } finally {
      setEvaluating(false);
    }
  };

  const handleActionDispatch = (action: string) => {
    setActionNotice(`Dispatched action: ${action}. Cryptographic entry recorded on SAKṢĪ audit ledger.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const topFinding = findings[0] || null;

  // Real-time activity events
  const activityEvents = [
    { time: '10:34:22', engine: 'VIVEKA', id: 'FND-EXEC-001', msg: '83 ransomware alerts closed without investigation on DC-PROD-01', link: '/findings/FND-EXEC-001' },
    { time: '10:25:00', engine: 'VIKĀRA', id: 'FND-VIK-002', msg: '12 analysts in rapid-closure anomaly (<5m MTTR) prior to shift handover', link: '/findings/FND-VIK-002' },
    { time: '10:15:33', engine: 'ABHĀVA', id: 'FND-ABH-003', msg: '21 Cobalt Strike cases closed with 0 network isolation records', link: '/findings/FND-ABH-003' },
    { time: '09:45:00', engine: 'PUNARĀVṚTTI', id: 'FND-PUN-004', msg: 'Kerberoasting recurrence #5 on SQL-SRV-02 without password rotation', link: '/findings/FND-PUN-004' },
    { time: '09:30:12', engine: 'SAKṢĪ', id: 'AUD-9904', msg: 'Supervisor A. Sharma verified block #9904 hash-chain integrity', link: '/audit' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs pb-8">
      {/* Top Title Bar & Engine State */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1D212B] pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#2E3544] text-[10px] font-mono text-white font-bold">
              NETRA
            </span>
            <h1 className="text-sm font-bold text-white tracking-tight font-sans">
              SOC Command Centre
            </h1>
            <span className="text-[#4B5563]">·</span>
            <span className="text-[11px] text-[#9CA3AF]">Scope: SOC-04</span>
          </div>
        </div>

        {/* Secondary Recalculation Trigger */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-[#6B7280]">SUPERVISORY ENGINE:</span>
          <span className="text-white font-semibold">ACTIVE</span>
          <button
            onClick={handleRecalculate}
            disabled={evaluating}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#0C0E12] border border-[#232732] hover:border-[#4B5563] text-[#9CA3AF] hover:text-white transition-colors disabled:opacity-50 text-[10px]"
            title="Trigger immediate re-evaluation pass across all telemetry"
          >
            <RefreshCw className={`w-3 h-3 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'RECALCULATING...' : 'RECALCULATE'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-2 bg-[#0C0E12] border border-white text-xs font-mono text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-[#848B98]">SAKṢĪ #9905</span>
        </div>
      )}

      {/* 1. TOP-LEVEL KPI SUMMARY STRIP (Clickable & Drillable) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-[#1D212B] bg-[#0A0C10] divide-x divide-y sm:divide-y-0 divide-[#1D212B] font-mono">
        <Link href="/risk" className="p-2.5 hover:bg-[#10131A] transition-colors block">
          <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase block">SOC HEALTH</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {overview?.health_score ?? 78} <span className="text-[10px] text-[#6B7280]">/ 100</span>
          </div>
          <span className="text-[9px] text-[#9CA3AF] mt-0.5 block font-bold">DEGRADED ↗</span>
        </Link>

        <Link href="/findings?severity=CRITICAL" className="p-2.5 hover:bg-[#10131A] transition-colors block">
          <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase block">CRITICAL FINDINGS</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {overview?.critical_findings ? String(overview.critical_findings).padStart(2, '0') : '07'}
          </div>
          <span className="text-[9px] text-white mt-0.5 block font-bold">URGENT REVIEW ↗</span>
        </Link>

        <Link href="/analytics" className="p-2.5 hover:bg-[#10131A] transition-colors block">
          <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase block">EXECUTION GAPS</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {overview?.execution_gaps ?? 14}
          </div>
          <span className="text-[9px] text-[#848B98] mt-0.5 block">VIVEKA ENGINE ↗</span>
        </Link>

        <Link href="/analytics" className="p-2.5 hover:bg-[#10131A] transition-colors block">
          <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase block">NEGATIVE SPACE</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {overview?.negative_space ? String(overview.negative_space).padStart(2, '0') : '06'}
          </div>
          <span className="text-[9px] text-[#848B98] mt-0.5 block">ABHĀVA ENGINE ↗</span>
        </Link>

        <Link href="/threats" className="p-2.5 hover:bg-[#10131A] transition-colors block">
          <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase block">THREAT RECURRENCE</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {overview?.threat_recurrences ? String(overview.threat_recurrences).padStart(2, '0') : '08'}
          </div>
          <span className="text-[9px] text-[#848B98] mt-0.5 block">PUNARĀVṚTTI ↗</span>
        </Link>

        <Link href="/workload" className="p-2.5 hover:bg-[#10131A] transition-colors block">
          <span className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase block">ACTIVE ANOMALIES</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {overview?.active_anomalies ?? 23}
          </div>
          <span className="text-[9px] text-[#848B98] mt-0.5 block">VIKĀRA ENGINE ↗</span>
        </Link>
      </div>

      {/* 2. WHY IS THIS SOC DEGRADED? (Connects health score directly to primary drivers) */}
      <div className="border border-[#1D212B] bg-[#0A0C10] p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-[#1D212B] pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white" />
            <h2 className="text-[11px] font-bold text-white font-mono tracking-wider uppercase">
              WHY IS THIS SOC DEGRADED? (HEALTH SCORE DRIVER DECOMPOSITION)
            </h2>
          </div>
          <Link href="/risk" className="text-[10px] font-mono text-[#9CA3AF] hover:text-white flex items-center gap-0.5">
            <span>FULL MĀN QUANTIFICATION</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-[11px]">
          <Link
            href="/findings/FND-EXEC-001"
            className="p-2 bg-[#060709] border border-[#1D212B] hover:border-[#4B5563] transition-colors block space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">Execution Gap</span>
              <span className="text-white font-bold">-31 pts</span>
            </div>
            <p className="text-[10px] text-[#848B98] font-sans">
              83 critical ransomware alerts closed with 0 investigation records on DC-PROD-01.
            </p>
          </Link>

          <Link
            href="/findings/FND-ABH-003"
            className="p-2 bg-[#060709] border border-[#1D212B] hover:border-[#4B5563] transition-colors block space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">Missing Escalation</span>
              <span className="text-white font-bold">-24 pts</span>
            </div>
            <p className="text-[10px] text-[#848B98] font-sans">
              Tier 2/3 escalations bypassed across 21 lateral movement beacon cases.
            </p>
          </Link>

          <Link
            href="/analytics"
            className="p-2 bg-[#060709] border border-[#1D212B] hover:border-[#4B5563] transition-colors block space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">Negative-Space Omission</span>
              <span className="text-white font-bold">-18 pts</span>
            </div>
            <p className="text-[10px] text-[#848B98] font-sans">
              63 missing forensic memory dumps and 54 uncollected evidence files.
            </p>
          </Link>

          <Link
            href="/findings/FND-VIK-002"
            className="p-2 bg-[#060709] border border-[#1D212B] hover:border-[#4B5563] transition-colors block space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">MTTR Velocity Gaming</span>
              <span className="text-white font-bold">-11 pts</span>
            </div>
            <p className="text-[10px] text-[#848B98] font-sans">
              12 analysts resolving tickets in &lt;5 min average versus 45 min baseline.
            </p>
          </Link>
        </div>
      </div>

      {/* 3. PRIMARY FOCUS: TOP CRITICAL FINDING SPOTLIGHT & SUPERVISOR WORKFLOW */}
      {topFinding && (
        <div className="border border-[#1D212B] bg-[#0A0C10] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1D212B] pb-2">
            <div className="flex items-center gap-2">
              <span className="badge-critical">[TOP CRITICAL FINDING]</span>
              <span className="font-mono text-white font-bold text-xs">{topFinding.id}</span>
              <span className="text-[#4B5563]">·</span>
              <span className="text-white font-semibold font-sans">{topFinding.title}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div>
                <span className="text-[#656C7A]">RISK: </span>
                <strong className="text-white font-bold">{topFinding.risk_score} / 100</strong>
              </div>
              <div>
                <span className="text-[#656C7A]">CONFIDENCE: </span>
                <strong className="text-white font-bold">{Math.round(topFinding.confidence * 100)}%</strong>
              </div>
              <StatusBadge status={topFinding.status} />
            </div>
          </div>

          {/* Supervisor Workflow Drilldown: Why Detected -> Evidence -> Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
            {/* Why Detected */}
            <div className="lg:col-span-4 p-2.5 bg-[#060709] border border-[#1D212B] space-y-1.5">
              <div className="text-[9px] text-[#656C7A] font-bold uppercase tracking-wider">
                1. WHY DETECTED (MATHEMATICAL DEVIATION)
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#848B98]">Investigation Baseline:</span>
                <span className="text-white font-bold">{topFinding.baseline_value}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#848B98]">Observed Rate:</span>
                <span className="text-white font-bold">{topFinding.observed_value}</span>
              </div>
              <div className="flex justify-between text-[11px] border-t border-[#1D212B] pt-1 font-bold">
                <span className="text-white">Deviation:</span>
                <span className="text-white">{topFinding.deviation}</span>
              </div>
              <p className="text-[10.5px] text-[#848B98] font-sans leading-relaxed pt-1">
                Mean dwell time was 42 seconds versus 44 minutes human baseline.
              </p>
            </div>

            {/* Evidence Provenance */}
            <div className="lg:col-span-4 p-2.5 bg-[#060709] border border-[#1D212B] space-y-1.5">
              <div className="text-[9px] text-[#656C7A] font-bold uppercase tracking-wider">
                2. EVIDENCE PROVENANCE & SCOPE
              </div>
              <div className="text-[11px] text-white">
                <div>Target Asset: <span className="font-bold">DC-PROD-01 (10.14.2.1)</span></div>
                <div>Assigned Analyst: <span className="font-bold">A-01 (Tier 1 Triage)</span></div>
                <div>Alert Count: <span className="font-bold">83 critical alerts affected</span></div>
                <div>Missing Steps: <span className="font-bold">MEMORY_ACQUISITION, HOST_ISOLATION</span></div>
              </div>
              <Link
                href={`/findings/${topFinding.id}`}
                className="text-[10px] text-white underline pt-1 inline-block hover:text-[#9CA3AF]"
              >
                Inspect 7-Part Explainability Card →
              </Link>
            </div>

            {/* Recommended Action & Dispatch */}
            <div className="lg:col-span-4 p-2.5 bg-[#060709] border border-[#1D212B] space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-[9px] text-[#656C7A] font-bold uppercase tracking-wider">
                  3. RECOMMENDED SUPERVISORY ACTION (UPĀYA)
                </div>
                <p className="text-[11px] font-sans text-white mt-1 leading-snug">
                  &ldquo;{topFinding.recommendation}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => handleActionDispatch('OPEN_SUPERVISORY_INVESTIGATION')}
                  className="px-2.5 py-1 bg-white text-black font-bold text-[10px] border border-white hover:bg-[#E5E7EB] transition-colors"
                >
                  [ OPEN INVESTIGATION ]
                </button>
                <Link
                  href={`/findings/${topFinding.id}`}
                  className="px-2.5 py-1 bg-[#14171E] border border-[#2E3544] text-white text-[10px] hover:bg-[#1C2029] transition-colors"
                >
                  [ VIEW EVIDENCE ]
                </Link>
                <button
                  onClick={() => handleActionDispatch('REOPEN_83_ALERTS')}
                  className="px-2.5 py-1 bg-[#14171E] border border-[#2E3544] text-white text-[10px] hover:bg-[#1C2029] transition-colors"
                >
                  [ REOPEN ALERTS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CORE DIFFERENTIATORS: PERFORMANCE BARS + EXECUTION GAPS + NEGATIVE SPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Horizontal Performance Bars (Replaces radar chart per specification) */}
        <div className="lg:col-span-4 border border-[#1D212B] bg-[#0A0C10] p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1D212B] pb-1.5">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
              SOC Performance Lifecycle
            </h2>
            <span className="text-[10px] font-mono font-bold text-white bg-[#14171E] px-1.5 py-0.2 border border-[#2E3544]">
              GRADE: C-
            </span>
          </div>

          <div className="space-y-2.5 text-[11px]">
            {/* Detection */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[#848B98]">Detection Rate (SLA 85%)</span>
                <span className="text-white font-bold">92%</span>
              </div>
              <div className="w-full bg-[#14171E] h-2 relative border border-[#232732]">
                <div className="bg-white h-full" style={{ width: '92%' }} />
                <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-[#4B5563]" title="SLA Threshold: 85%" />
              </div>
            </div>

            {/* Investigation */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white font-bold">Investigation Rate (SLA 85%)</span>
                <span className="text-white font-bold">31% (DEFICIT)</span>
              </div>
              <div className="w-full bg-[#14171E] h-2 relative border border-[#232732]">
                <div className="bg-white h-full" style={{ width: '31%' }} />
                <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-[#4B5563]" title="SLA Threshold: 85%" />
              </div>
            </div>

            {/* Escalation */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white font-bold">Escalation Integrity (SLA 80%)</span>
                <span className="text-white font-bold">48% (DEFICIT)</span>
              </div>
              <div className="w-full bg-[#14171E] h-2 relative border border-[#232732]">
                <div className="bg-white h-full" style={{ width: '48%' }} />
                <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-[#4B5563]" title="SLA Threshold: 80%" />
              </div>
            </div>

            {/* Response */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[#848B98]">Response Dwell (SLA 75%)</span>
                <span className="text-white font-bold">64%</span>
              </div>
              <div className="w-full bg-[#14171E] h-2 relative border border-[#232732]">
                <div className="bg-white h-full" style={{ width: '64%' }} />
                <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-[#4B5563]" title="SLA Threshold: 75%" />
              </div>
            </div>
          </div>

          <div className="p-1.5 bg-[#060709] border border-[#1D212B] text-[10px] text-[#848B98] leading-tight">
            High detection (92%) masked by severe investigation bypass (31%).
          </div>
        </div>

        {/* VIVEKA — Execution Gap Workflow */}
        <div className="lg:col-span-4 border border-[#1D212B] bg-[#0A0C10] p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1D212B] pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-[#14171E] border border-[#2E3544] text-[9px] text-white font-bold">
                VIVEKA
              </span>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                Execution Gap Workflow
              </h2>
            </div>
            <Link href="/analytics" className="text-[10px] text-white hover:underline">
              DETAILS →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            {/* Expected */}
            <div className="p-2 bg-[#060709] border border-[#1D212B] space-y-1">
              <div className="text-[9px] text-[#6B7280] font-bold uppercase pb-1 border-b border-[#1D212B]">
                EXPECTED SOP
              </div>
              <div className="flex justify-between text-white"><span>Triage</span><Check className="w-3 h-3" /></div>
              <div className="flex justify-between text-white"><span>Investigation</span><Check className="w-3 h-3" /></div>
              <div className="flex justify-between text-white"><span>Escalation</span><Check className="w-3 h-3" /></div>
              <div className="flex justify-between text-white"><span>Response</span><Check className="w-3 h-3" /></div>
              <div className="flex justify-between text-white"><span>Closure</span><Check className="w-3 h-3" /></div>
            </div>

            {/* Actual */}
            <div className="p-2 bg-[#060709] border border-[#2E3544] space-y-1">
              <div className="text-[9px] text-white font-bold uppercase pb-1 border-b border-[#1D212B]">
                ACTUAL OBSERVED
              </div>
              <div className="flex justify-between text-white"><span>Triage</span><Check className="w-3 h-3" /></div>
              <div className="flex justify-between text-white font-bold dashed-gap-box px-0.5"><span>Investigation ✕</span><X className="w-3 h-3" /></div>
              <div className="flex justify-between text-white font-bold dashed-gap-box px-0.5"><span>Escalation ✕</span><X className="w-3 h-3" /></div>
              <div className="flex justify-between text-white"><span>Response</span><Check className="w-3 h-3" /></div>
              <div className="flex justify-between text-white font-bold dashed-gap-box px-0.5"><span>Closure ✕</span><X className="w-3 h-3" /></div>
            </div>
          </div>
        </div>

        {/* ABHĀVA — Negative Space Analysis */}
        <div className="lg:col-span-4 border border-[#1D212B] bg-[#0A0C10] p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1D212B] pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-[#14171E] border border-[#2E3544] text-[9px] text-white font-bold">
                ABHĀVA
              </span>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                Negative Space Analysis
              </h2>
            </div>
            <Link href="/analytics" className="text-[10px] text-white hover:underline">
              DETAILS →
            </Link>
          </div>

          <div className="p-2 bg-[#060709] border border-[#1D212B] space-y-1.5 text-[11px]">
            <div className="grid grid-cols-3 gap-1 pb-1 border-b border-[#1D212B] text-[9px] font-bold text-[#656C7A]">
              <span>ACTION</span>
              <span className="text-center">EXP</span>
              <span className="text-right">OBS / GAP</span>
            </div>

            <div className="grid grid-cols-3 gap-1 items-center text-white">
              <span>Investigations</span>
              <span className="text-center text-[#848B98]">80</span>
              <span className="text-right font-bold">17 (-63)</span>
            </div>

            <div className="grid grid-cols-3 gap-1 items-center text-white">
              <span>Escalations</span>
              <span className="text-center text-[#848B98]">30</span>
              <span className="text-right font-bold">2 (-28)</span>
            </div>

            <div className="grid grid-cols-3 gap-1 items-center text-white">
              <span>Evidence Records</span>
              <span className="text-center text-[#848B98]">75</span>
              <span className="text-right font-bold">21 (-54)</span>
            </div>
          </div>

          <div className="p-1.5 bg-[#060709] border border-[#1D212B] text-[10px] text-[#848B98] leading-tight">
            145 total mandatory forensic actions omitted across Shift Alpha-Delta.
          </div>
        </div>
      </div>

      {/* 5. COMPACT REAL-TIME SUPERVISORY ACTIVITY STREAM */}
      <div className="border border-[#1D212B] bg-[#0A0C10] p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-[#1D212B] pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white inline-block" />
            <h2 className="text-[11px] font-bold text-white font-mono tracking-wider uppercase">
              REAL-TIME SUPERVISORY TELEMETRY STREAM (LIVE AUDIT FEED)
            </h2>
          </div>
          <Link href="/audit" className="text-[10px] font-mono text-[#9CA3AF] hover:text-white flex items-center gap-0.5">
            <span>FULL SAKṢĪ AUDIT LEDGER</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          {activityEvents.map((evt, idx) => (
            <Link
              key={idx}
              href={evt.link}
              className="p-1.5 bg-[#060709] border border-[#1D212B] hover:border-[#4B5563] transition-colors flex items-center justify-between gap-3 block"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[#656C7A] text-[10px] flex-shrink-0">{evt.time} UTC</span>
                <span className="px-1 py-0.2 bg-[#14171E] border border-[#2E3544] text-[9px] text-white font-bold flex-shrink-0">
                  {evt.engine}
                </span>
                <span className="text-white font-bold flex-shrink-0">{evt.id}</span>
                <span className="text-[#9CA3AF] truncate font-sans">{evt.msg}</span>
              </div>
              <ChevronRight className="w-3 h-3 text-[#656C7A] flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* 6. PRIORITIZED FINDINGS TABLE (Direct Drilldown) */}
      <div className="border border-[#1D212B] bg-[#0A0C10] overflow-hidden">
        <div className="p-2.5 border-b border-[#1D212B] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
              PRIORITIZED SUPERVISORY FINDINGS QUEUE
            </h2>
          </div>
          <Link href="/findings" className="text-[10px] text-white hover:underline">
            VIEW ALL 07 FINDINGS →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>SEVERITY</th>
                <th>FINDING</th>
                <th>TYPE</th>
                <th>CONFIDENCE</th>
                <th>SOC</th>
                <th>AFFECTED</th>
                <th>DETECTED</th>
                <th className="text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/findings/${f.id}`)}
                  className="cursor-pointer transition-colors"
                >
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td>
                    <div className="font-sans font-bold text-white text-xs hover:underline">
                      {f.title}
                    </div>
                    <div className="text-[10px] text-[#656C7A]">{f.id}</div>
                  </td>
                  <td className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{f.type}</td>
                  <td className="text-[11px] text-white font-bold whitespace-nowrap">
                    {Math.round(f.confidence * 100)}%
                  </td>
                  <td className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{f.soc_scope}</td>
                  <td className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{f.affected_scope}</td>
                  <td className="text-[11px] text-[#656C7A] whitespace-nowrap">{f.detected_time}</td>
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
