'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchFindingById } from '@/lib/api';
import { Finding } from '@/types';
import { ArrowLeft, Check, Clock } from 'lucide-react';
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
      <div className="p-8 font-mono text-xs text-[#848B98]">
        Loading supervisory finding {id}...
      </div>
    );
  }

  const handleAction = (action: string) => {
    setActionNotice(`Action executed: ${action}. Cryptographic entry recorded on SAKṢĪ audit chain.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Back Link */}
      <Link
        href="/findings"
        className="inline-flex items-center gap-1.5 text-xs text-[#848B98] hover:text-white font-mono transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        <span>BACK TO FINDINGS CENTRE</span>
      </Link>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-2.5 bg-[#0C0E12] border border-white text-xs font-mono text-white flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Screen 4 Header Enclave */}
      <div className="p-4 bg-[#0C0E12] border border-[#232732] font-mono space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232732] pb-3">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} size="lg" />
            <span className="px-2 py-0.5 bg-[#14171E] border border-[#3A4050] text-white font-bold text-xs">
              {finding.type.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 bg-[#14171E] border border-[#3A4050] text-white text-xs">
              {finding.soc_scope}
            </span>
            <StatusBadge status={finding.status} />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#656C7A]">RISK: </span>
              <strong className="text-white font-bold text-sm">
                {finding.risk_score} / 100
              </strong>
            </div>
            <div>
              <span className="text-[#656C7A]">CONFIDENCE: </span>
              <strong className="text-white font-bold text-sm">
                {Math.round(finding.confidence * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Main Statement */}
        <div className="text-sm font-bold text-white font-sans">
          &ldquo;{finding.summary}&rdquo;
        </div>
      </div>

      {/* Core Explainability Grid: WHY DETECTED + RISK FACTORS + TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left: WHY DETECTED (Baseline vs Observed) */}
        <div className="lg:col-span-4 bg-[#0C0E12] border border-[#232732] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#232732] pb-2">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
              WHY DETECTED (PRATYAYA)
            </h2>
            <span className="text-[9px] text-white font-bold border border-white px-1">ANOMALY</span>
          </div>

          <div className="space-y-2 bg-[#060709] p-3 border border-[#232732]">
            <div className="flex justify-between">
              <span className="text-[#848B98]">{finding.baseline_metric_name}:</span>
              <span className="text-white font-bold">{finding.baseline_value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#848B98]">Observed In Telemetry:</span>
              <span className="text-white font-bold">{finding.observed_value}</span>
            </div>
            <div className="flex justify-between border-t border-[#1C2029] pt-2">
              <span className="text-[#656C7A]">Mathematical Deviation:</span>
              <span className="text-white font-bold text-sm">{finding.deviation}</span>
            </div>
          </div>

          <div className="text-[11px] text-[#9CA3AF] font-sans leading-relaxed">
            {finding.why}
          </div>
        </div>

        {/* Middle: RISK FACTORS BREAKDOWN */}
        <div className="lg:col-span-4 bg-[#0C0E12] border border-[#232732] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#232732] pb-2">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
              RISK FACTORS (MĀN)
            </h2>
            <span className="text-xs text-white font-bold">TOTAL: +{finding.risk_score}</span>
          </div>

          <div className="space-y-1.5">
            {finding.risk_factors.map((rf) => (
              <div
                key={rf.name}
                className="p-2 bg-[#060709] border border-[#232732] flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{rf.name}</div>
                  {rf.description && (
                    <div className="text-[9px] text-[#656C7A]">{rf.description}</div>
                  )}
                </div>
                <span className="font-bold text-white text-sm">+{rf.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: EVIDENCE TIMELINE */}
        <div className="lg:col-span-4 bg-[#0C0E12] border border-[#232732] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#232732] pb-2">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
              EVIDENCE TIMELINE
            </h2>
            <span className="text-[9px] text-[#848B98]">RECONSTRUCTION</span>
          </div>

          <div className="space-y-1.5">
            {finding.evidence_timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 border ${
                  step.isAnomaly
                    ? 'bg-[#1C2029] border-white text-white font-bold'
                    : 'bg-[#060709] border-[#232732] text-[#9CA3AF]'
                }`}
              >
                <div className="text-[9px] text-[#656C7A]">{step.time}</div>
                <div className="text-[11px]">{step.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED DATA TABS */}
      <div className="bg-[#0C0E12] border border-[#232732] p-3.5 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap gap-1 border-b border-[#232732] pb-2">
          {(['ALERTS', 'INCIDENTS', 'INVESTIGATIONS', 'ASSETS', 'ANALYSTS', 'EVIDENCE', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-[#060709] text-[#848B98] hover:text-white border border-[#232732]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="p-3 bg-[#060709] border border-[#232732] space-y-2">
          {activeTab === 'ALERTS' && (
            <div>
              <div className="font-bold text-white mb-2">Affected Alerts ({finding.related_alerts.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {finding.related_alerts.map((alt) => (
                  <div key={alt} className="p-2 bg-[#0C0E12] border border-[#232732]">
                    <span className="text-white font-bold">{alt}</span>
                    <div className="text-[10px] text-[#656C7A]">vssadmin shadowcopy delete · CRITICAL</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'INCIDENTS' && (
            <div>
              <div className="font-bold text-white mb-2">Linked Incident Records ({finding.related_incidents.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {finding.related_incidents.map((inc) => (
                  <div key={inc} className="p-2 bg-[#0C0E12] border border-[#232732]">
                    <span className="text-white font-bold">{inc}</span>
                    <div className="text-[10px] text-[#656C7A]">Status: CLOSED_WITHOUT_EVIDENCE</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ASSETS' && (
            <div>
              <div className="font-bold text-white mb-2">Scope Assets & Target Machines</div>
              <div className="p-2 bg-[#0C0E12] border border-[#232732]">
                <div className="text-white font-bold">DC-PROD-01 (10.14.2.1)</div>
                <div className="text-[10px] text-[#656C7A]">Role: Primary Windows Active Directory Domain Controller</div>
              </div>
            </div>
          )}

          {activeTab === 'ANALYSTS' && (
            <div>
              <div className="font-bold text-white mb-2">Involved Personnel & Shift Queue</div>
              <div className="p-2 bg-[#0C0E12] border border-[#232732]">
                <div className="text-white font-bold">Analyst A-01 (Tier 1 Triage)</div>
                <div className="text-[10px] text-white">Mean Dwell Time: 42 seconds · Investigation Bypassed</div>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE' && (
            <div>
              <div className="font-bold text-white mb-2">PRATYAYA Raw Evidence JSON</div>
              <pre className="p-3 bg-black border border-[#232732] text-[10px] text-white overflow-x-auto">
                {JSON.stringify(finding.evidence, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div>
              <div className="font-bold text-white mb-2">SAKṢĪ Cryptographic State</div>
              <div className="text-[11px] text-[#848B98] space-y-1 font-mono">
                <div>Audit Hash: <span className="text-white">5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8</span></div>
                <div>Integrity Proof: <span className="text-white font-bold">VERIFIED (AKṢARA Chain Height: 9904)</span></div>
              </div>
            </div>
          )}

          {activeTab === 'INVESTIGATIONS' && (
            <div>
              <div className="font-bold text-white mb-2">Missing Investigation Logs</div>
              <div className="text-[11px] text-[#9CA3AF]">
                0 investigation notes created during the alert dwell window.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDED ACTION & BUTTONS (Screen 4 Footer) */}
      <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3 font-mono">
        <div>
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">
            UPĀYA — RECOMMENDED ACTION
          </div>
          <p className="text-xs font-semibold text-white font-sans mt-0.5">
            &ldquo;{finding.recommendation}&rdquo;
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleAction('OPEN_INVESTIGATION')}
            className="px-3.5 py-1.5 bg-white text-black font-bold text-xs border border-white hover:bg-[#E5E7EB] transition-colors"
          >
            [ OPEN INVESTIGATION ]
          </button>
          <button
            onClick={() => handleAction('ASSIGN')}
            className="px-3.5 py-1.5 bg-[#14171E] border border-[#3A4050] text-white font-bold text-xs hover:bg-[#1C2029] transition-colors"
          >
            [ ASSIGN ]
          </button>
          <button
            onClick={() => handleAction('VIEW_EVIDENCE')}
            className="px-3.5 py-1.5 bg-[#14171E] border border-[#3A4050] text-white font-bold text-xs hover:bg-[#1C2029] transition-colors"
          >
            [ VIEW EVIDENCE ]
          </button>
          <button
            onClick={() => handleAction('MARK_REVIEWED')}
            className="px-3.5 py-1.5 bg-[#14171E] border border-[#3A4050] text-[#848B98] hover:text-white text-xs hover:bg-[#1C2029] transition-colors"
          >
            [ MARK REVIEWED ]
          </button>
        </div>
      </div>
    </div>
  );
}
