'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchFindingById } from '@/lib/api';
import { Finding } from '@/types';
import { ArrowLeft, Check, Clock, ShieldAlert, Activity, Search, Zap, FileText, CheckCircle2 } from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'FND-EXEC-001';

  const [finding, setFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'INCIDENTS' | 'INVESTIGATIONS' | 'ASSETS' | 'ANALYSTS' | 'EVIDENCE' | 'AUDIT'>('ALERTS');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchFindingById(id);
      setFinding(data);
    };
    load();
  }, [id]);

  if (!finding) {
    return (
      <div className="p-8 font-mono text-xs text-slate-500">
        Loading forensic finding {id}...
      </div>
    );
  }

  const handleAction = (action: string) => {
    setActionNotice(`Action executed: ${action}. Cryptographic entry recorded on SAKṢĪ audit chain.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      {/* Back Link */}
      <Link
        href="/findings"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-mono transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO FINDINGS CENTRE</span>
      </Link>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-mono text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Forensic Header Enclave */}
      <div className="soc-panel p-5 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <SeverityBadge severity={finding.severity} size="lg" />
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded">
              {finding.type.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded">
              {finding.soc_scope}
            </span>
            <StatusBadge status={finding.status} />
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">RISK: </span>
              <strong className="text-rose-700 font-bold text-base">
                {finding.risk_score} / 100
              </strong>
            </div>
            <div>
              <span className="text-slate-500">CONFIDENCE: </span>
              <strong className="text-slate-900 font-bold text-base">
                {Math.round(finding.confidence * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Main Forensic Statement */}
        <div className="text-sm font-bold text-slate-900 font-sans leading-snug">
          &ldquo;{finding.summary}&rdquo;
        </div>
      </div>

      {/* Core Explainability Grid: WHY DETECTED + RISK FACTORS + TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left: WHY DETECTED (PRATYAYA) */}
        <div className="lg:col-span-4 soc-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              WHY DETECTED (PRATYAYA)
            </h2>
            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
              ANOMALY
            </span>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">{finding.baseline_metric_name}:</span>
              <span className="text-slate-900 font-bold">{finding.baseline_value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Observed Execution:</span>
              <span className="text-rose-700 font-bold">{finding.observed_value}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5">
              <span className="text-slate-500">Net Deviation:</span>
              <span className="text-rose-700 font-bold text-sm">{finding.deviation}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-sans leading-relaxed">
            {finding.why}
          </div>
        </div>

        {/* Middle: RISK FACTORS BREAKDOWN (MĀN) */}
        <div className="lg:col-span-4 soc-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              RISK FACTORS (MĀN)
            </h2>
            <span className="text-xs text-slate-900 font-bold">TOTAL: +{finding.risk_score}</span>
          </div>

          <div className="space-y-1.5">
            {finding.risk_factors.map((rf) => (
              <div
                key={rf.name}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 font-sans text-xs">{rf.name}</div>
                  {rf.description && (
                    <div className="text-[10px] text-slate-500">{rf.description}</div>
                  )}
                </div>
                <span className="font-bold text-rose-700 text-xs">+{rf.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: EVIDENCE TIMELINE */}
        <div className="lg:col-span-4 soc-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              EVIDENCE TIMELINE
            </h2>
            <span className="text-[10px] text-slate-400">RECONSTRUCTION</span>
          </div>

          <div className="space-y-1.5">
            {finding.evidence_timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded border ${
                  step.isAnomaly
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-[10px] text-slate-400">{step.time}</div>
                <div className="text-xs font-sans mt-0.5">{step.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED DATA TABS */}
      <div className="soc-panel p-4 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
          {(['ALERTS', 'INCIDENTS', 'INVESTIGATIONS', 'ASSETS', 'ANALYSTS', 'EVIDENCE', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
          {activeTab === 'ALERTS' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">Affected Alerts ({finding.related_alerts.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {finding.related_alerts.map((alt) => (
                  <div key={alt} className="p-2.5 bg-white border border-slate-200 rounded">
                    <span className="text-slate-900 font-bold">{alt}</span>
                    <div className="text-[10.5px] text-slate-500 font-sans">vssadmin shadowcopy delete · CRITICAL</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'INCIDENTS' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">Linked Incident Records ({finding.related_incidents.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {finding.related_incidents.map((inc) => (
                  <div key={inc} className="p-2.5 bg-white border border-slate-200 rounded">
                    <span className="text-slate-900 font-bold">{inc}</span>
                    <div className="text-[10.5px] text-slate-500 font-sans">Status: CLOSED_WITHOUT_EVIDENCE</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ASSETS' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">Scope Assets & Target Machines</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <div className="text-slate-900 font-bold">DC-PROD-01 (10.14.2.1)</div>
                <div className="text-[10.5px] text-slate-500 font-sans">Role: Primary Windows Active Directory Domain Controller</div>
              </div>
            </div>
          )}

          {activeTab === 'ANALYSTS' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">Involved Personnel & Shift Queue</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <div className="text-slate-900 font-bold">Analyst A-01 (Tier 1 Triage)</div>
                <div className="text-[10.5px] text-rose-700 font-sans">Mean Dwell Time: 42 seconds · Investigation Bypassed</div>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">PRATYAYA Raw Evidence JSON</div>
              <pre className="p-3 bg-white border border-slate-200 rounded text-[10.5px] text-slate-800 overflow-x-auto font-mono">
                {JSON.stringify(finding.evidence, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">SAKṢĪ Cryptographic State</div>
              <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                <div>Audit Hash: <span className="text-slate-900 font-semibold">5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8</span></div>
                <div>Integrity Proof: <span className="text-emerald-700 font-bold">VERIFIED (AKṢARA Chain Height: 9904)</span></div>
              </div>
            </div>
          )}

          {activeTab === 'INVESTIGATIONS' && (
            <div>
              <div className="font-bold text-slate-900 mb-2">Missing Investigation Logs</div>
              <div className="text-xs text-slate-600 font-sans">
                0 investigation notes created during the alert dwell window.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDED ACTION & BUTTONS */}
      <div className="soc-panel p-5 space-y-3 font-mono">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            UPĀYA — RECOMMENDED ACTION
          </div>
          <p className="text-xs font-semibold text-slate-900 font-sans mt-1">
            &ldquo;{finding.recommendation}&rdquo;
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleAction('OPEN_INVESTIGATION')}
            className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition-colors shadow-xs"
          >
            OPEN INVESTIGATION
          </button>
          <button
            onClick={() => handleAction('REOPEN_ALERTS')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded hover:bg-slate-100 transition-colors"
          >
            REOPEN 83 ALERTS
          </button>
          <button
            onClick={() => handleAction('ASSIGN')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded hover:bg-slate-100 transition-colors"
          >
            ASSIGN TO TIER 2
          </button>
          <button
            onClick={() => handleAction('MARK_REVIEWED')}
            className="px-3.5 py-1.5 bg-slate-100 text-slate-600 hover:text-slate-900 text-xs rounded transition-colors"
          >
            MARK REVIEWED
          </button>
        </div>
      </div>
    </div>
  );
}
