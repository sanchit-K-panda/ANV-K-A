'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchFindings } from '@/lib/api';
import { Clock, MapPin, User, ShieldCheck } from 'lucide-react';
import type { Finding } from '@/types';

export default function EvidencePage() {
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    let alive = true;
    fetchFindings()
      .then((data) => {
        if (!alive) return;
        setFindings(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Backend unreachable');
        setFindings(null);
      });
    return () => { alive = false; };
  }, []);

  const f = findings?.find((x) => x.id === selectedId) ?? findings?.[0] ?? null;
  const loading = findings === null && !error;

  const handleCopyEvidence = () => {
    if (!f?.evidence) return;
    navigator.clipboard.writeText(JSON.stringify(f.evidence, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const points = f
    ? [
        {
          num: '01',
          label: 'What Happened?',
          category: 'OBSERVATION',
          content: f.what ? (
            <p className="text-xs text-soc-text leading-relaxed font-medium">{f.what}</p>
          ) : null,
        },
        {
          num: '02',
          label: 'Why Detected?',
          category: 'VIVEKA_GAP',
          content: f.why ? (
            <p className="text-xs text-soc-textSecondary leading-relaxed">{f.why}</p>
          ) : null,
        },
        {
          num: '03',
          label: 'When Occurred?',
          category: 'TIMESTAMP_CHAIN',
          content: f.when_detected ? (
            <div className="flex items-center gap-2 text-xs text-soc-text font-bold font-mono">
              <Clock className="w-3.5 h-3.5 text-soc-accent" />
              <span className="text-soc-accent tabular-nums">{f.when_detected}</span>
            </div>
          ) : null,
        },
        {
          num: '04',
          label: 'Where (Scope)?',
          category: 'TARGET_ENCLAVE',
          content: f.where_scope ? (
            <div className="flex items-center gap-2 text-xs text-soc-text font-bold font-mono">
              <MapPin className="w-3.5 h-3.5 text-soc-accent" />
              <span className="text-soc-text">{f.where_scope}</span>
            </div>
          ) : null,
        },
        {
          num: '05',
          label: 'Who Was Involved?',
          category: 'OPERATOR_TRACE',
          content: (
            <div className="flex items-center gap-2 text-xs text-soc-text font-medium font-mono">
              <User className="w-3.5 h-3.5 text-soc-accent" />
              <span>{f.affected_entities.length > 0 ? f.affected_entities.map((e) => e.id).join(', ') : 'Not recorded in payload'}</span>
            </div>
          ),
        },
        {
          num: '06',
          label: 'Confidence & Risk?',
          category: 'BAYES_SCORE',
          content: f.confidence > 0 || f.risk_score > 0 ? (
            <div className="flex items-center gap-2 text-xs">
              {f.confidence > 0 && (
                <span className="font-mono text-soc-accent font-bold tabular-nums">
                  {Math.round(f.confidence * 100)}% CONFIDENCE
                </span>
              )}
              {f.confidence > 0 && f.risk_score > 0 && <span className="text-soc-textDim">·</span>}
              {f.risk_score > 0 && (
                <span className="soc-badge badge-critical font-bold">{f.risk_score}/100 RISK</span>
              )}
            </div>
          ) : null,
        },
      ]
    : [];

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-3xs font-mono text-soc-textMuted mb-1">
            <span className="font-bold text-soc-text">ANVĪKṢA</span>
            <span>/</span>
            <span>EVIDENCE_VAULT</span>
            <span>/</span>
            <span className="text-soc-accent font-bold">PRATYAYA</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-soc-text flex items-center gap-2.5">
            <span>Forensic Evidence Vault</span>
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Evidence-first: every card renders strictly what the detection backend recorded — empty when absent
          </p>
        </div>

        <div className="flex items-center gap-2 text-3xs font-mono">
          <span className="px-2.5 py-1 rounded-md border border-soc-ok/30 bg-soc-ok/10 text-soc-ok font-bold">
            <ShieldCheck className="w-3 h-3 inline mr-1" />
            BACKEND-SOURCED ONLY
          </span>
        </div>
      </div>

      {/* Finding selector */}
      {findings && findings.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-up">
          {findings.slice(0, 12).map((x) => (
            <button
              key={x.id}
              onClick={() => setSelectedId(x.id)}
              className={`font-mono text-2xs px-2.5 py-1.5 rounded border transition-colors ${
                f?.id === x.id
                  ? 'border-soc-accent/60 bg-soc-accent/10 text-soc-accent'
                  : 'border-soc-border text-soc-textSecondary hover:text-soc-text'
              }`}
            >
              {x.id} · {x.severity}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="soc-panel p-8 text-center text-xs font-mono text-soc-textMuted animate-pulse">
          LOADING FINDINGS FROM DETECTION PIPELINE…
        </div>
      )}

      {error && (
        <div className="soc-panel p-8 text-center">
          <p className="text-xs font-mono text-red-500 mb-2">DETECTION PIPELINE UNREACHABLE — {error}</p>
          <p className="text-2xs text-soc-textMuted">
            Run an evaluation (POST /api/analytics/evaluate-scenario/…) so findings exist, then reload. This vault never displays fabricated evidence.
          </p>
        </div>
      )}

      {findings && findings.length === 0 && (
        <div className="soc-panel p-8 text-center">
          <p className="text-xs font-mono text-soc-textMuted mb-2">NO FINDINGS AVAILABLE YET</p>
          <p className="text-2xs text-soc-textMuted">
            Trigger a scenario evaluation from the <Link href="/scenarios" className="text-soc-accent underline">Simulation Hub</Link> to populate the evidence vault.
          </p>
        </div>
      )}

      {f && (
        <>
          {/* 7-Point Explainability Framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
            {points.map((pt) => (
              <div key={pt.num} className="soc-panel card-hover flex flex-col justify-between">
                <div className="soc-panel-header">
                  <span className="panel-label">
                    {pt.num} · {pt.label}
                  </span>
                  <span className="text-3xs font-mono text-soc-accent font-semibold px-1.5 py-0.5 rounded bg-soc-accentDim">
                    {pt.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center bg-soc-panel">
                  {pt.content ?? (
                    <p className="text-2xs font-mono text-soc-textDim">Not present in detection payload — no value fabricated.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Raw Forensic Evidence Payload */}
          <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="soc-panel-header">
              <div className="flex items-center gap-2">
                <span className="panel-label">07 · Raw Evidence Payload ({f.id})</span>
                <span className="soc-badge badge-verified">
                  <span className="dot-green" />
                  BACKEND JSON
                </span>
              </div>

              <button type="button" onClick={handleCopyEvidence} className="btn-ghost !text-3xs !py-1 !px-2.5 font-mono" disabled={!f.evidence}>
                {copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON PAYLOAD'}
              </button>
            </div>
            <pre className="p-4 bg-soc-overlay text-soc-accentBright text-2xs overflow-x-auto font-mono leading-relaxed shadow-inner">
              {f.evidence ? JSON.stringify(f.evidence, null, 2) : '// No evidence payload attached to this finding.'}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
