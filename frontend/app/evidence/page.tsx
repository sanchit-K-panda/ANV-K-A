'use client';

import React from 'react';
import { MOCK_FINDINGS } from '@/lib/mockData';
import { Search, Clock, MapPin, User, ShieldCheck } from 'lucide-react';

export default function EvidencePage() {
  const f = MOCK_FINDINGS[0];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Evidence &amp; Explainability Explorer
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              PRATYAYA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Cryptographic forensic provenance and mathematical reasoning behind supervisory findings.
          </p>
        </div>
      </div>

      {/* 7-Point Explainability Framework */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
        <div className="soc-panel p-4 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">1. WHAT HAPPENED?</div>
          <p className="text-slate-900 font-sans text-xs font-semibold">{f.what}</p>
        </div>

        <div className="soc-panel p-4 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">2. WHY DETECTED?</div>
          <p className="text-slate-600 font-sans text-xs">{f.why}</p>
        </div>

        <div className="soc-panel p-4 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">3. WHEN OCCURRED?</div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{f.when_detected}</span>
          </div>
        </div>

        <div className="soc-panel p-4 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">4. WHERE (SCOPE)?</div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{f.where_scope}</span>
          </div>
        </div>

        <div className="soc-panel p-4 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">5. WHO WAS INVOLVED?</div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Analyst A-01 · Tier 1 Triage</span>
          </div>
        </div>

        <div className="soc-panel p-4 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">6. CONFIDENCE &amp; RISK?</div>
          <div className="text-slate-900 font-bold">
            94% Confidence · <span className="text-rose-700">91/100 Risk Score</span>
          </div>
        </div>
      </div>

      {/* Raw Forensic Evidence Payload */}
      <div className="soc-panel p-5 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            7. Raw Forensic Evidence Payload (PRATYAYA JSON)
          </h2>
          <span className="text-emerald-700 font-bold text-[10.5px]">HASH VERIFIED ✓</span>
        </div>
        <pre className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 text-[10.5px] overflow-x-auto font-mono">
          {JSON.stringify(f.evidence, null, 2)}
        </pre>
      </div>
    </div>
  );
}
