'use client';

import React from 'react';
import { MOCK_FINDINGS } from '@/lib/mockData';
import { Clock, MapPin, User } from 'lucide-react';

export default function EvidencePage() {
  const f = MOCK_FINDINGS[0];
  const [copied, setCopied] = React.useState(false);

  const points = [
    { num: '01', label: 'What Happened?', category: 'OBSERVATION', content: <p className="text-xs text-soc-text leading-relaxed font-medium">{f.what}</p> },
    { num: '02', label: 'Why Detected?', category: 'VIVEKA_GAP', content: <p className="text-xs text-soc-textSecondary leading-relaxed">{f.why}</p> },
    {
      num: '03',
      label: 'When Occurred?',
      category: 'TIMESTAMP_CHAIN',
      content: (
        <div className="flex items-center gap-2 text-xs text-soc-text font-bold font-mono">
          <Clock className="w-3.5 h-3.5 text-soc-accent" />
          <span className="text-soc-accent tabular-nums">{f.when_detected}</span>
        </div>
      ),
    },
    {
      num: '04',
      label: 'Where (Scope)?',
      category: 'TARGET_ENCLAVE',
      content: (
        <div className="flex items-center gap-2 text-xs text-soc-text font-bold font-mono">
          <MapPin className="w-3.5 h-3.5 text-soc-accent" />
          <span className="text-soc-text">{f.where_scope}</span>
        </div>
      ),
    },
    {
      num: '05',
      label: 'Who Was Involved?',
      category: 'OPERATOR_TRACE',
      content: (
        <div className="flex items-center gap-2 text-xs text-soc-text font-medium font-mono">
          <User className="w-3.5 h-3.5 text-soc-accent" />
          <span>Analyst A-01 · Tier 1 Triage</span>
        </div>
      ),
    },
    {
      num: '06',
      label: 'Confidence & Risk?',
      category: 'BAYES_SCORE',
      content: (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-soc-accent font-bold tabular-nums">94% CONFIDENCE</span>
          <span className="text-soc-textDim">·</span>
          <span className="soc-badge badge-critical font-bold">91/100 RISK</span>
        </div>
      ),
    },
  ];

  const handleCopyEvidence = () => {
    navigator.clipboard.writeText(JSON.stringify(f.evidence, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <span>Cryptographic Forensic Evidence Vault</span>
            <span className="h-2 w-2 rounded-full bg-soc-ok" />
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Cryptographic forensic provenance and mathematical reasoning behind supervisory findings
          </p>
        </div>

        <div className="flex items-center gap-2 text-3xs font-mono">
          <span className="px-2.5 py-1 rounded-md border border-soc-ok/30 bg-soc-ok/10 text-soc-ok font-bold">
            TPM SEAL: VERIFIED
          </span>
        </div>
      </div>

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
            <div className="p-4 flex-1 flex flex-col justify-center bg-soc-panel">{pt.content}</div>
          </div>
        ))}
      </div>

      {/* Raw Forensic Evidence Payload */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="soc-panel-header">
          <div className="flex items-center gap-2">
            <span className="panel-label">07 · Raw Forensic Evidence Payload (PRATYAYA JSON)</span>
            <span className="soc-badge badge-verified">
              <span className="dot-green" />
              HASH VERIFIED
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyEvidence}
            className="btn-ghost !text-3xs !py-1 !px-2.5 font-mono"
          >
            {copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON PAYLOAD'}
          </button>
        </div>
        <pre className="p-4 bg-soc-overlay text-soc-accentBright text-2xs overflow-x-auto font-mono leading-relaxed shadow-inner">
          {JSON.stringify(f.evidence, null, 2)}
        </pre>
      </div>
    </div>
  );
}
