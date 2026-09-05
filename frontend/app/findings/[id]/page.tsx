'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchFindingById } from '@/lib/api';
import { Finding } from '@/types';
import { ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';

export default function FindingDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'FND-EXEC-001';

  const [finding, setFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'INCIDENTS' | 'INVESTIGATIONS' | 'ASSETS' | 'ANALYSTS' | 'EVIDENCE' | 'AUDIT'>('ALERTS');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchFindingById(id);
      setFinding(data);
    };
    load();
  }, [id]);

  if (!finding) {
    return (
      <div className="space-y-3 p-1">
        <div className="h-5 w-64 bg-soc-raised rounded-sm animate-pulse" />
        <div className="soc-panel p-5 space-y-3">
          <div className="h-4 w-1/3 bg-soc-raised rounded-sm animate-pulse" />
          <div className="h-4 w-2/3 bg-soc-raised rounded-sm animate-pulse" />
        </div>
        <div className="font-mono text-2xs text-soc-textMuted">LOADING FORENSIC FINDING {id}...</div>
      </div>
    );
  }

  const handleAction = (action: string) => {
    setActionNotice(`Action executed: ${action}. Cryptographic entry recorded on SAKṢĪ audit chain.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText('5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const AUDIT_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';

  return (
    <div className="space-y-4 pb-16">
      {/* Back Link */}
      <Link
        href="/findings"
        className="inline-flex items-center gap-1.5 text-2xs text-soc-textMuted hover:text-soc-text font-mono tracking-wider transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        <span>BACK TO FINDINGS CENTRE</span>
      </Link>

      {/* Action Notice */}
      {actionNotice && (
        <div className="px-3.5 py-2.5 bg-soc-okDim border border-soc-ok/30 rounded-sm text-xs font-mono text-soc-ok flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Forensic Header */}
      <div className="soc-panel border-l-2 border-l-soc-crit">
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soc-border pb-3">
            <div className="flex items-center gap-2.5">
              <SeverityBadge severity={finding.severity} />
              <span className="soc-badge badge-neutral">{finding.type.toUpperCase()}</span>
              <span className="soc-badge badge-accent">{finding.soc_scope}</span>
              <StatusBadge status={finding.status} />
            </div>

            <div className="flex items-center gap-4 text-2xs font-mono">
              <div>
                <span className="text-soc-textMuted">RISK </span>
                <span className="text-soc-crit font-semibold text-sm tabular-nums">{finding.risk_score} / 100</span>
              </div>
              <div>
                <span className="text-soc-textMuted">CONFIDENCE </span>
                <span className="text-soc-text font-semibold text-sm tabular-nums">{Math.round(finding.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="text-sm font-medium text-soc-text leading-snug max-w-prose">
            {finding.summary}
          </div>
        </div>
      </div>

      {/* WHY DETECTED + RISK FACTORS + TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* WHY DETECTED (PRATYAYA) */}
        <div className="soc-panel card-hover space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="panel-label">Why Detected — PRATYAYA</h2>
            <span className="soc-badge badge-critical">ANOMALY</span>
          </div>

          <div className="space-y-1.5 bg-soc-raised/50 p-3 rounded-sm border border-soc-border font-mono text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-soc-textMuted">{finding.baseline_metric_name}</span>
              <span className="text-soc-text font-medium tabular-nums">{finding.baseline_value}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-soc-textMuted">Observed Execution</span>
              <span className="text-soc-crit font-semibold tabular-nums">{finding.observed_value}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-soc-border pt-1.5">
              <span className="text-soc-textMuted">Net Deviation</span>
              <span className="text-soc-crit font-semibold text-sm tabular-nums">{finding.deviation}</span>
            </div>
          </div>

          <div className="text-xs text-soc-textSecondary leading-relaxed">
            {finding.why}
          </div>
        </div>

        {/* RISK FACTORS (MĀN) */}
        <div className="soc-panel card-hover space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="panel-label">Risk Factors — MĀN</h2>
            <span className="font-mono text-xs text-soc-text tabular-nums">TOTAL <span className="text-soc-crit font-semibold">+{finding.risk_score}</span></span>
          </div>

          <div className="space-y-1.5">
            {finding.risk_factors.map((rf) => (
              <div
                key={rf.name}
                className="p-2.5 bg-soc-overlay rounded-lg flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-soc-text text-xs">{rf.name}</div>
                  {rf.description && (
                    <div className="text-2xs text-soc-textMuted line-clamp-1">{rf.description}</div>
                  )}
                </div>
                <span className="font-mono font-semibold text-soc-crit text-xs tabular-nums flex-shrink-0">+{rf.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EVIDENCE TIMELINE */}
        <div className="soc-panel card-hover space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="panel-label">Evidence Timeline</h2>
            <span className="text-2xs font-mono text-soc-textMuted">RECONSTRUCTION</span>
          </div>

          <div className="space-y-1.5">
            {finding.evidence_timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-sm border ${
                  step.isAnomaly
                    ? 'bg-soc-critDim border-soc-crit/30'
                    : 'bg-soc-raised/40 border-soc-border'
                }`}
              >
                <div className="col-mono tabular-nums">{step.time}</div>
                <div className={`text-xs mt-0.5 ${step.isAnomaly ? 'text-soc-crit font-medium' : 'text-soc-textSecondary'}`}>
                  {step.event}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED DATA TABS */}
      <div className="soc-panel">
        <div className="flex flex-wrap gap-1 px-3 pt-3 border-b border-soc-border pb-2.5">
          {(['ALERTS', 'INCIDENTS', 'INVESTIGATIONS', 'ASSETS', 'ANALYSTS', 'EVIDENCE', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`px-3 py-1.5 text-2xs font-mono tracking-wider rounded-sm transition-colors border ${
                activeTab === tab
                  ? 'bg-soc-accentInk border-soc-accent/50 text-soc-accentBright'
                  : 'bg-transparent border-transparent text-soc-textMuted hover:text-soc-text hover:bg-soc-raised'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-2">
          {activeTab === 'ALERTS' && (
            <div>
              <div className="panel-label mb-2.5">Affected Alerts ({finding.related_alerts.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {finding.related_alerts.map((alt) => (
                  <div key={alt} className="p-2.5 bg-soc-overlay rounded-lg">
                    <span className="col-mono text-soc-text">{alt}</span>
                    <div className="text-2xs text-soc-textMuted mt-0.5">vssadmin shadowcopy delete · CRITICAL</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'INCIDENTS' && (
            <div>
              <div className="panel-label mb-2.5">Linked Incident Records ({finding.related_incidents.length})</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {finding.related_incidents.map((inc) => (
                  <div key={inc} className="p-2.5 bg-soc-overlay rounded-lg">
                    <span className="col-mono text-soc-text">{inc}</span>
                    <div className="text-2xs text-soc-textMuted mt-0.5">Status: CLOSED_WITHOUT_EVIDENCE</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ASSETS' && (
            <div>
              <div className="panel-label mb-2.5">Scope Assets &amp; Target Machines</div>
              <div className="p-2.5 bg-soc-overlay rounded-lg max-w-md">
                <div className="text-soc-text font-medium text-xs">DC-PROD-01 (10.14.2.1)</div>
                <div className="text-2xs text-soc-textMuted mt-0.5">Role: Primary Windows Active Directory Domain Controller</div>
              </div>
            </div>
          )}

          {activeTab === 'ANALYSTS' && (
            <div>
              <div className="panel-label mb-2.5">Involved Personnel &amp; Shift Queue</div>
              <div className="p-2.5 bg-soc-overlay rounded-lg max-w-md">
                <div className="text-soc-text font-medium text-xs">Analyst A-01 (Tier 1 Triage)</div>
                <div className="text-2xs text-soc-crit mt-0.5 font-mono">MEAN DWELL TIME: 42s · INVESTIGATION BYPASSED</div>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE' && (
            <div>
              <div className="panel-label mb-2.5">PRATYAYA Raw Evidence JSON</div>
              <pre className="p-3 bg-soc-bg border border-soc-border rounded-sm text-2xs text-soc-accentBright overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(finding.evidence, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div>
              <div className="panel-label mb-2.5">SAKṢĪ Cryptographic State</div>
              <div className="text-2xs text-soc-textSecondary space-y-1.5 font-mono">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-soc-textMuted">AUDIT HASH</span>
                  <span className="text-soc-text break-all">{AUDIT_HASH}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 text-soc-textMuted hover:text-soc-text rounded-sm hover:bg-soc-raised transition-colors"
                    aria-label="Copy audit hash"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-soc-ok" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div>
                  <span className="text-soc-textMuted">INTEGRITY PROOF </span>
                  <span className="text-soc-ok font-semibold">VERIFIED (SAKṢĪ CHAIN HEIGHT: 9904)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'INVESTIGATIONS' && (
            <div>
              <div className="panel-label mb-2.5">Missing Investigation Logs</div>
              <div className="text-xs text-soc-textSecondary">
                0 investigation notes created during the alert dwell window. This absence is itself the
                supervisory signal — negative-space evidence recorded under ABHĀVA.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDED ACTION */}
      <div className="soc-panel p-5 space-y-3">
        <div>
          <div className="panel-label">UPĀYA — Recommended Action</div>
          <p className="text-xs font-medium text-soc-text mt-1.5 max-w-prose">
            {finding.recommendation}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleAction('OPEN_INVESTIGATION')}
            className="btn-primary"
          >
            OPEN INVESTIGATION
          </button>
          <button
            onClick={() => handleAction('REOPEN_ALERTS')}
            className="btn-ghost"
          >
            REOPEN 83 ALERTS
          </button>
          <button
            onClick={() => handleAction('ASSIGN')}
            className="btn-ghost"
          >
            ASSIGN TO TIER 2
          </button>
          <button
            onClick={() => handleAction('MARK_REVIEWED')}
            className="btn-ghost !border-transparent !bg-transparent hover:!bg-soc-raised"
          >
            MARK REVIEWED
          </button>
        </div>
      </div>
    </div>
  );
}
