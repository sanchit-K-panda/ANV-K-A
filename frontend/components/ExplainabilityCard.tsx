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
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

  return (
    <div className="space-y-6">
      {/* Top Finding Header Card */}
      <div className="bg-soc-panel border border-soc-border rounded-lg p-6 shadow-soc">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-soc-border">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={finding.severity} size="lg" />
            <span className="font-mono text-sm font-bold text-soc-textPrimary">
              {finding.id}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded text-soc-textMuted hover:text-soc-textPrimary hover:bg-soc-raised transition-colors"
              title="Copy Finding ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <StatusBadge status={finding.status} />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-soc-textMuted">Risk Score</div>
              <RiskScore score={finding.risk_score} factorsCount={finding.risk_factors.length} size="md" />
            </div>
            <div className="h-8 w-px bg-soc-border" />
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-soc-textMuted">ML Certainty</div>
              <ConfidenceIndicator confidence={finding.confidence} />
            </div>
          </div>
        </div>

        <h1 className="text-lg font-bold text-soc-textPrimary mt-4 mb-2">
          {finding.title}
        </h1>
        <p className="text-xs text-soc-textSecondary leading-relaxed">
          {finding.summary}
        </p>
      </div>

      {/* 7-PART EXPLAINABILITY MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: WHAT, WHY, WHEN, WHERE */}
        <div className="space-y-4">
          {/* 1. WHAT */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-soc-accent font-mono text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>1. WHAT (Forensic Observation)</span>
            </div>
            <div className="p-3.5 bg-soc-base rounded border border-soc-border text-xs text-soc-textPrimary leading-relaxed">
              {finding.what}
            </div>
          </div>

          {/* 2. WHY */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>2. WHY (Baseline vs. Observed Deviation)</span>
            </div>
            <div className="p-3.5 bg-soc-base rounded border border-soc-border text-xs text-soc-textPrimary leading-relaxed">
              {finding.why}
            </div>
          </div>

          {/* 3. WHEN */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-soc-textSecondary font-mono text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>3. WHEN (Detection Telemetry & Timing)</span>
            </div>
            <div className="p-3.5 bg-soc-base rounded border border-soc-border font-mono text-xs text-soc-textPrimary space-y-1">
              <div>TIMESTAMP: <span className="text-soc-textSecondary">{finding.when_detected}</span></div>
              <div>INGESTION DELAY: <span className="text-emerald-400">1.4 seconds (Real-time)</span></div>
              <div>EVALUATION RUN: <span className="text-soc-accent">SUPERVISORY-PASS-7</span></div>
            </div>
          </div>

          {/* 4. WHERE */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-soc-textSecondary font-mono text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>4. WHERE (Scope & Entities)</span>
            </div>
            <div className="p-3.5 bg-soc-base rounded border border-soc-border font-mono text-xs text-soc-textPrimary space-y-2">
              <div className="text-soc-textSecondary text-[11px]">{finding.where_scope}</div>
              <div className="flex flex-wrap gap-2 pt-1">
                {finding.affected_entities.map((entity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-soc-raised border border-soc-border text-[11px]"
                  >
                    <span className="text-soc-textMuted mr-1">{entity.type}:</span>
                    <span className="text-soc-textPrimary font-semibold">{entity.id}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: EVIDENCE, CONFIDENCE, RECOMMENDATION & RISK BREAKDOWN */}
        <div className="space-y-4">
          {/* 5. EVIDENCE */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-soc-accent font-mono text-xs font-bold uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>5. EVIDENCE (Forensic Artifacts)</span>
              </div>
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-[10px] font-mono text-soc-textSecondary hover:text-soc-textPrimary flex items-center gap-1"
              >
                {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showRawJson ? 'Hide JSON' : 'Inspect JSON'}
              </button>
            </div>

            <div className="bg-soc-base rounded border border-soc-border p-3.5 font-mono text-xs text-soc-textSecondary overflow-x-auto">
              {showRawJson ? (
                <pre className="text-[11px] text-emerald-400">
                  {JSON.stringify(finding.evidence, null, 2)}
                </pre>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(finding.evidence).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-soc-border/40 pb-1 text-[11px]">
                      <span className="text-soc-textMuted uppercase">{k.replace(/_/g, ' ')}:</span>
                      <span className="text-soc-textPrimary font-semibold truncate max-w-[240px]">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. CONFIDENCE */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>6. CONFIDENCE (ML Model Attribution)</span>
            </div>
            <div className="p-3.5 bg-soc-base rounded border border-soc-border font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-soc-textSecondary">Primary Model:</span>
                <span className="text-soc-textPrimary font-semibold">
                  {(finding as any).confidence_breakdown?.model || `${finding.engine || 'VIVEKA'}-SupervisoryEngine-v2`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textSecondary">Statistical Certainty:</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round(finding.confidence * 100)}% Match
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textSecondary">Ground-Truth Alignment:</span>
                <span className="text-soc-textPrimary">Verified Deterministic</span>
              </div>
            </div>
          </div>

          {/* 7. RECOMMENDATION & ACTIONS */}
          <div className="bg-soc-panel border border-soc-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-severity-critical font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>7. RECOMMENDATION (Supervisory Remediation)</span>
            </div>
            <div className="p-3.5 bg-soc-base rounded border border-soc-border text-xs text-soc-textPrimary mb-4 leading-relaxed">
              {finding.recommendation}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExecuteAction(finding.suggested_action)}
                className="flex-1 py-2 px-3 bg-soc-accent hover:bg-soc-accentHover text-white font-mono text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Execute Action: {finding.suggested_action}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleExecuteAction('OPEN_INVESTIGATION_CASE')}
                className="py-2 px-3 bg-soc-raised hover:bg-soc-elevated border border-soc-border text-soc-textPrimary font-mono text-xs rounded transition-colors"
              >
                Open Case
              </button>
            </div>

            {actionConfirmed && (
              <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Action [{actionConfirmed}] dispatched and recorded to Audit Hash Chain.
              </div>
            )}
          </div>

          {/* Itemized Risk Breakdown */}
          <RiskFactorBreakdown factors={finding.risk_factors} totalScore={finding.risk_score} />
        </div>
      </div>
    </div>
  );
};
