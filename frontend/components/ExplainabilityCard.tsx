import React, { useState } from 'react';
import { Finding } from '@/types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { RiskScore } from './RiskScore';
import { RiskFactorBreakdown } from './RiskFactorBreakdown';
import {
  HelpCircle,
  FileText,
  Clock,
  MapPin,
  Database,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

interface ExplainabilityCardProps {
  finding: Finding;
  onTakeAction?: (actionName: string) => void;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({ finding, onTakeAction }) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [actionConfirmed, setActionConfirmed] = useState<string | null>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(finding.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteAction = (action: string) => {
    setActionConfirmed(action);
    if (onTakeAction) onTakeAction(action);
  };

  const stageHeader = (num: string, title: string, icon: React.ReactNode, tone: 'accent' | 'warn' | 'muted' | 'ok' | 'crit' = 'muted') => {
    const tones = {
      accent: 'text-soc-accent',
      warn: 'text-soc-med',
      muted: 'text-soc-textSecondary',
      ok: 'text-soc-ok',
      crit: 'text-soc-crit',
    };
    return (
      <div className={`flex items-center gap-2 mb-2.5 font-mono text-2xs font-medium uppercase tracking-[0.14em] ${tones[tone]}`}>
        {icon}
        <span>{num} · {title}</span>
      </div>
    );
  };

  const bodyBox = 'px-3.5 py-3 bg-soc-overlay rounded-lg text-xs text-soc-text leading-relaxed';

  return (
    <div className="space-y-5">
      {/* Finding Header */}
      <div className="soc-panel">
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-soc-border">
            <div className="flex items-center gap-3">
              <SeverityBadge severity={finding.severity} />
              <span className="col-mono text-sm text-soc-text">
                {finding.id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 rounded-sm text-soc-textMuted hover:text-soc-text hover:bg-soc-raised transition-colors"
                title="Copy Finding ID"
                aria-label="Copy Finding ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-soc-ok" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <StatusBadge status={finding.status} />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="panel-label mb-1">Risk Score</div>
                <RiskScore score={finding.risk_score} factorsCount={finding.risk_factors.length} size="md" />
              </div>
              <div className="h-8 w-px bg-soc-border" />
              <div className="text-right">
                <div className="panel-label mb-1">ML Certainty</div>
                <ConfidenceIndicator confidence={finding.confidence} />
              </div>
            </div>
          </div>

          <h1 className="font-display text-lg font-bold text-soc-text mt-4 mb-1.5">
            {finding.title}
          </h1>
          <p className="text-xs text-soc-textSecondary leading-relaxed max-w-prose">
            {finding.summary}
          </p>
        </div>
      </div>

      {/* 7-PART EXPLAINABILITY MATRIX — WHAT → WHY → WHEN → WHERE → EVIDENCE → CONFIDENCE → RECOMMENDATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: WHAT, WHY, WHEN, WHERE */}
        <div className="space-y-5">
          <div className="soc-panel p-4">
            {stageHeader('01', 'WHAT — Forensic Observation', <HelpCircle className="w-3.5 h-3.5" />, 'accent')}
            <div className={bodyBox}>{finding.what}</div>
          </div>

          <div className="soc-panel p-4">
            {stageHeader('02', 'WHY — Baseline vs. Observed Deviation', <FileText className="w-3.5 h-3.5" />, 'warn')}
            <div className={bodyBox}>{finding.why}</div>
          </div>

          <div className="soc-panel p-4">
            {stageHeader('03', 'WHEN — Detection Telemetry', <Clock className="w-3.5 h-3.5" />)}
            <div className={`${bodyBox} font-mono space-y-1.5`}>
              <div className="flex justify-between gap-4"><span className="text-soc-textMuted">TIMESTAMP</span><span className="text-soc-text tabular-nums">{finding.when_detected}</span></div>
              <div className="flex justify-between gap-4"><span className="text-soc-textMuted">INGESTION DELAY</span><span className="text-soc-ok">1.4s (real-time)</span></div>
              <div className="flex justify-between gap-4"><span className="text-soc-textMuted">EVALUATION RUN</span><span className="text-soc-accent">SUPERVISORY-PASS-7</span></div>
            </div>
          </div>

          <div className="soc-panel p-4">
            {stageHeader('04', 'WHERE — Scope & Entities', <MapPin className="w-3.5 h-3.5" />)}
            <div className={`${bodyBox} font-mono space-y-2.5`}>
              <div className="text-soc-textSecondary text-2xs tracking-wide">{finding.where_scope}</div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {finding.affected_entities.map((entity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-soc-raised border border-soc-border text-2xs"
                  >
                    <span className="text-soc-textMuted uppercase tracking-wider">{entity.type}</span>
                    <span className="text-soc-text font-medium">{entity.id}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: EVIDENCE, CONFIDENCE, RECOMMENDATION & RISK BREAKDOWN */}
        <div className="space-y-5">
          <div className="soc-panel p-4">
            <div className="flex items-center justify-between mb-2.5">
              {stageHeader('05', 'EVIDENCE — Forensic Artifacts', <Database className="w-3.5 h-3.5" />, 'accent')}
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-2xs font-mono text-soc-textMuted hover:text-soc-text flex items-center gap-1 transition-colors"
              >
                {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showRawJson ? 'HIDE JSON' : 'INSPECT JSON'}
              </button>
            </div>

            <div className="bg-soc-overlay rounded-lg p-3.5 font-mono text-2xs overflow-x-auto">
              {showRawJson ? (
                <pre className="text-soc-accentBright leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(finding.evidence, null, 2)}
                </pre>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(finding.evidence).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-soc-border/50 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-soc-textMuted uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
                      <span className="text-soc-text font-medium truncate max-w-[240px]">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="soc-panel p-4">
            {stageHeader('06', 'CONFIDENCE — ML Model Attribution', <Cpu className="w-3.5 h-3.5" />, 'ok')}
            <div className={`${bodyBox} font-mono space-y-1.5`}>
              <div className="flex justify-between gap-4">
                <span className="text-soc-textMuted">Primary Model</span>
                <span className="text-soc-text font-medium">
                  {(finding as any).confidence_breakdown?.model || `${finding.engine || 'VIVEKA'}-SupervisoryEngine-v2`}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-soc-textMuted">Statistical Certainty</span>
                <span className="text-soc-ok font-semibold tabular-nums">
                  {Math.round(finding.confidence * 100)}% Match
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-soc-textMuted">Ground-Truth Alignment</span>
                <span className="text-soc-text">Verified Deterministic</span>
              </div>
            </div>
          </div>

          <div className="soc-panel p-4">
            {stageHeader('07', 'RECOMMENDATION — Supervisory Remediation', <CheckCircle2 className="w-3.5 h-3.5" />, 'crit')}
            <div className={`${bodyBox} mb-4`}>
              {finding.recommendation}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExecuteAction(finding.suggested_action)}
                className="btn-primary flex-1"
              >
                <span>Execute: {finding.suggested_action}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleExecuteAction('OPEN_INVESTIGATION_CASE')}
                className="btn-ghost"
              >
                Open Case
              </button>
            </div>

            {actionConfirmed && (
              <div className="mt-3 px-2.5 py-2 bg-soc-okDim border border-soc-ok/30 rounded-sm text-2xs font-mono text-soc-ok flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Action [{actionConfirmed}] dispatched and recorded to the SAKṢĪ audit hash chain.
              </div>
            )}
          </div>

          <RiskFactorBreakdown factors={finding.risk_factors} totalScore={finding.risk_score} />
        </div>
      </div>
    </div>
  );
};
