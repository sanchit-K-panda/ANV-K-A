'use client';

import React, { useState, useEffect } from 'react';
import { Finding } from '@/types';
import {
  explainFindingWithLLM,
  FindingExplanationResponse,
} from '@/lib/api';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Cpu,
  CheckCircle2,
  FileText,
  Activity,
  Lock,
} from 'lucide-react';

interface SupervisoryExplanationSectionProps {
  finding: Finding;
  className?: string;
}

export const SupervisoryExplanationSection: React.FC<SupervisoryExplanationSectionProps> = ({
  finding,
  className = '',
}) => {
  const [explanation, setExplanation] = useState<FindingExplanationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await explainFindingWithLLM(finding);
      setExplanation(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate supervisory explanation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [finding.id]);

  return (
    <div className={`soc-panel p-5 space-y-4 border-l-2 border-l-soc-accent ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soc-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-soc-accent/10 text-soc-accent">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-soc-text">
                PRATYAYA · Supervisory Reasoning &amp; Operational Explanation
              </span>
            </div>
            <p className="text-2xs text-soc-textMuted mt-0.5">
              Deterministic findings synthesized into executive language for SOC command.
            </p>
          </div>
        </div>

        {/* Status / Model Badge */}
        <div className="flex items-center gap-2">
          {explanation && (
            <div className="flex items-center gap-2 font-mono text-2xs">
              {explanation.is_fallback ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-soc-raised border border-soc-border text-soc-textSecondary">
                  <ShieldCheck className="w-3 h-3 text-soc-accent" />
                  <span>LOCAL ENGINE · Deterministic Rule Fallback</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-soc-accent/10 border border-soc-accent/30 text-soc-accentBright">
                  <span className="w-1.5 h-1.5 rounded-full bg-soc-ok animate-pulse" />
                  <Cpu className="w-3 h-3 text-soc-accentBright" />
                  <span>LOCAL AI · DeepSeek-R1 8B (Air-Gapped)</span>
                </span>
              )}

              {typeof explanation.latency_ms === 'number' && explanation.latency_ms > 0 && (
                <span className="text-soc-textMuted hidden sm:inline tabular-nums">
                  {(explanation.latency_ms / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          )}

          <button
            onClick={fetchExplanation}
            disabled={loading}
            className="p-1.5 text-soc-textMuted hover:text-soc-text hover:bg-soc-raised rounded-md transition-colors disabled:opacity-50"
            title="Re-run supervisory explanation"
            aria-label="Re-run supervisory explanation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-soc-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !explanation && (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-3 w-1/4 bg-soc-raised rounded" />
          <div className="h-16 bg-soc-raised/60 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="h-20 bg-soc-raised/40 rounded-md" />
            <div className="h-20 bg-soc-raised/40 rounded-md" />
          </div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted pt-1">
            <Activity className="w-3 h-3 animate-spin text-soc-accent" />
            <span>Consulting local DeepSeek-R1 8B reasoning layer on 127.0.0.1:11434...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !explanation && (
        <div className="p-3.5 bg-soc-crit/10 border border-soc-crit/30 rounded-md text-xs text-soc-crit flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Explanation Content */}
      {explanation && (
        <div className="space-y-4">
          {/* Executive Briefing Box */}
          <div className="p-3.5 bg-soc-overlay rounded-lg border border-soc-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xs font-semibold uppercase tracking-wider text-soc-accentBright flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Operational Executive Briefing
              </span>
              <span className="font-mono text-2xs text-soc-textMuted flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-soc-ok" />
                Preserved Risk {explanation.risk_score} / Confidence {Math.round(explanation.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-soc-text leading-relaxed font-sans font-normal">
              {explanation.summary}
            </p>
          </div>

          {/* 4-Quadrant Operational Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. What Happened */}
            <div className="p-3 bg-soc-raised/40 rounded-md border border-soc-border space-y-1.5">
              <div className="font-mono text-2xs text-soc-textMuted uppercase tracking-wider">
                1. What Happened (Observation)
              </div>
              <p className="text-xs text-soc-textSecondary leading-relaxed">
                {explanation.what_happened}
              </p>
            </div>

            {/* 2. Why It Matters */}
            <div className="p-3 bg-soc-raised/40 rounded-md border border-soc-border space-y-1.5">
              <div className="font-mono text-2xs text-soc-med uppercase tracking-wider">
                2. Why It Matters (SOP &amp; Impact)
              </div>
              <p className="text-xs text-soc-textSecondary leading-relaxed">
                {explanation.why_it_matters}
              </p>
            </div>

            {/* 3. Evidence Summary */}
            <div className="p-3 bg-soc-raised/40 rounded-md border border-soc-border space-y-1.5">
              <div className="font-mono text-2xs text-soc-accent uppercase tracking-wider">
                3. Corroborated Evidence
              </div>
              <p className="text-xs text-soc-textSecondary leading-relaxed">
                {explanation.evidence_summary}
              </p>
            </div>

            {/* 4. Confidence & Certainty */}
            <div className="p-3 bg-soc-raised/40 rounded-md border border-soc-border space-y-1.5">
              <div className="font-mono text-2xs text-soc-ok uppercase tracking-wider">
                4. Statistical &amp; Model Certainty
              </div>
              <p className="text-xs text-soc-textSecondary leading-relaxed">
                {explanation.confidence_statement}
              </p>
            </div>
          </div>

          {/* Recommended Action Box */}
          <div className="p-3.5 bg-soc-crit/5 border border-soc-crit/20 rounded-md flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-soc-crit flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-mono text-2xs font-semibold uppercase tracking-wider text-soc-crit">
                Recommended Remediation Action
              </div>
              <p className="text-soc-text leading-relaxed">
                {explanation.recommended_action}
              </p>
            </div>
          </div>

          {/* Limitations / Disclaimers if any */}
          {explanation.limitations && explanation.limitations.length > 0 && (
            <div className="text-2xs font-mono text-soc-textMuted flex items-center gap-1.5 pt-1">
              <span>BOUNDARIES:</span>
              <span className="truncate">{explanation.limitations.join('; ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
