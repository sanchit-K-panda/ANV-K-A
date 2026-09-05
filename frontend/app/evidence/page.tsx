'use client';

import React from 'react';
import { MOCK_FINDINGS } from '@/lib/mockData';
import { Clock, MapPin, User } from 'lucide-react';

export default function EvidencePage() {
  const f = MOCK_FINDINGS[0];

  const points = [
    { num: '01', label: 'What happened?', content: <p className="text-xs text-soc-text leading-relaxed">{f.what}</p> },
    { num: '02', label: 'Why detected?', content: <p className="text-xs text-soc-textSecondary leading-relaxed">{f.why}</p> },
    {
      num: '03',
      label: 'When occurred?',
      content: (
        <div className="flex items-center gap-2 text-xs text-soc-text font-medium">
          <Clock className="w-3.5 h-3.5 text-soc-textMuted" />
          <span className="font-mono text-2xs tabular-nums">{f.when_detected}</span>
        </div>
      ),
    },
    {
      num: '04',
      label: 'Where (scope)?',
      content: (
        <div className="flex items-center gap-2 text-xs text-soc-text font-medium">
          <MapPin className="w-3.5 h-3.5 text-soc-textMuted" />
          <span className="font-mono text-2xs">{f.where_scope}</span>
        </div>
      ),
    },
    {
      num: '05',
      label: 'Who was involved?',
      content: (
        <div className="flex items-center gap-2 text-xs text-soc-text font-medium">
          <User className="w-3.5 h-3.5 text-soc-textMuted" />
          <span>Analyst A-01 · Tier 1 Triage</span>
        </div>
      ),
    },
    {
      num: '06',
      label: 'Confidence & risk?',
      content: (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-soc-text font-semibold tabular-nums">94% CONFIDENCE</span>
          <span className="text-soc-textDim">·</span>
          <span className="soc-badge badge-critical">91/100 RISK SCORE</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>EVIDENCE</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Evidence &amp; Explainability Explorer</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Cryptographic forensic provenance and mathematical reasoning behind supervisory findings.
          </p>
        </div>
      </div>

      {/* 7-Point Explainability Framework */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {points.map((pt) => (
          <div key={pt.num} className="soc-panel">
            <div className="soc-panel-header">
              <span className="panel-label">
                {pt.num} · {pt.label}
              </span>
            </div>
            <div className="p-4">{pt.content}</div>
          </div>
        ))}
      </div>

      {/* Raw Forensic Evidence Payload */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="soc-panel-header">
          <span className="panel-label">07 · Raw Forensic Evidence Payload (PRATYAYA JSON)</span>
          <span className="soc-badge badge-verified">
            <span className="dot-green" />
            HASH VERIFIED
          </span>
        </div>
        <pre className="p-4 bg-soc-overlay border-t border-soc-border text-soc-textSecondary text-2xs overflow-x-auto font-mono leading-relaxed">
          {JSON.stringify(f.evidence, null, 2)}
        </pre>
      </div>
    </div>
  );
}
