'use client';

import React from 'react';
import { MOCK_FINDINGS } from '@/lib/mockData';
import { Search, Clock, MapPin, User } from 'lucide-react';

export default function EvidencePage() {
  const f = MOCK_FINDINGS[0];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              PRATYAYA
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Evidence & Explainability Explorer
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Cryptographic forensic provenance and mathematical reasoning behind supervisory findings.
          </p>
        </div>
      </div>

      {/* 7-Part Question Framework */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-1.5">
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">1. WHAT HAPPENED?</div>
          <p className="text-white font-sans text-xs font-semibold">{f.what}</p>
        </div>

        <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-1.5">
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">2. WHY DETECTED?</div>
          <p className="text-[#9CA3AF] font-sans text-xs">{f.why}</p>
        </div>

        <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-1.5">
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">3. WHEN OCCURRED?</div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>{f.when_detected}</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-1.5">
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">4. WHERE (SCOPE)?</div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span>{f.where_scope}</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-1.5">
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">5. WHO WAS INVOLVED?</div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <User className="w-3.5 h-3.5 text-white" />
            <span>Analyst A-01 · Tier 1 Triage</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-1.5">
          <div className="text-[9px] text-[#848B98] font-bold uppercase tracking-wider">6. CONFIDENCE & RISK?</div>
          <div className="text-white font-bold">
            94% Confidence · 91/100 Composite Risk
          </div>
        </div>
      </div>

      {/* Raw Evidence Inspector */}
      <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-2 font-mono text-xs">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
          7. RAW FORENSIC EVIDENCE PAYLOAD
        </h2>
        <pre className="p-3 bg-[#060709] border border-[#232732] text-white text-[10px] overflow-x-auto">
          {JSON.stringify(f.evidence, null, 2)}
        </pre>
      </div>
    </div>
  );
}
