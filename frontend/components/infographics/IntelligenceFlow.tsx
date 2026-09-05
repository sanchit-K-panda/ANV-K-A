'use client';

import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  sanskrit: string;
  desc: string;
  metric: string;
  status: 'OPTIMAL' | 'DEGRADED';
}

const FLOW_STAGES: Stage[] = [
  { id: '1', name: 'SOC Data Ingestion', sanskrit: 'SAṄGRAHA', desc: 'Raw alerts from SIEM, EDR, Firewall, and EDR agents.', metric: '14,280 eps', status: 'OPTIMAL' },
  { id: '2', name: 'Schema Normalization', sanskrit: 'ŚODHANA', desc: 'Unified OCSF / STIX taxonomic schema mapping.', metric: '99.94% mapped', status: 'OPTIMAL' },
  { id: '3', name: 'Behaviour Modeling', sanskrit: 'VIKĀRA', desc: 'Anomaly detection on dwell time & closure distribution.', metric: '12 anomalies', status: 'DEGRADED' },
  { id: '4', name: 'Execution Analysis', sanskrit: 'VIVEKA', desc: 'SOP step verification and workflow bypass detection.', metric: '14 gaps', status: 'DEGRADED' },
  { id: '5', name: 'Negative Space', sanskrit: 'ABHĀVA', desc: 'Omission analysis (what should have happened but didn’t).', metric: '6 omissions', status: 'DEGRADED' },
  { id: '6', name: 'Correlation & Risk', sanskrit: 'MĀN', desc: 'Factor-weighted Bayesian risk scoring engine.', metric: 'Score 91/100', status: 'DEGRADED' },
  { id: '7', name: 'Forensic Evidence', sanskrit: 'PRATYAYA', desc: '7-point explainability card with mathematical proof.', metric: '100% auditable', status: 'OPTIMAL' },
  { id: '8', name: 'Supervisor Action', sanskrit: 'UPĀYA', desc: 'Tamper-evident action dispatch on SAKṢĪ ledger.', metric: 'Block #9905', status: 'OPTIMAL' },
];

export const IntelligenceFlow: React.FC = () => {
  const [selected, setSelected] = useState<Stage>(FLOW_STAGES[3]);

  return (
    <div className="soc-panel space-y-4 p-5 font-mono select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
          <h3 className="panel-label">ANVĪKṢA Intelligence Architecture Flow</h3>
        </div>
        <div className="flex items-center gap-2 text-2xs uppercase tracking-[0.1em] text-soc-textMuted">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-soc-ok" aria-hidden="true" /> Nominal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-soc-med" aria-hidden="true" /> Findings Active
          </span>
          <span className="text-soc-textDim" aria-hidden="true">·</span>
          <span className="rounded-md border border-soc-border bg-soc-raised px-2 py-0.5 text-[9.5px] font-bold tracking-[0.08em] text-soc-textSecondary">
            100% AIR-GAPPED
          </span>
        </div>
      </div>

      {/* Horizontal Flow Blocks */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {FLOW_STAGES.map((s, idx) => {
          const isSelected = selected.id === s.id;
          const isDegraded = s.status === 'DEGRADED';

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              aria-pressed={isSelected}
              className={`rounded-md border p-2.5 text-left transition-colors ${
                isSelected
                  ? 'border-soc-accent/60 bg-soc-accentInk'
                  : 'border-soc-border bg-soc-panel hover:border-soc-borderStrong hover:bg-soc-overlay'
              }`}
            >
              <div className="mb-1 flex items-center justify-between text-2xs">
                <span className={`font-bold ${isSelected ? 'text-soc-accentBright' : 'text-soc-textDim'}`}>0{idx + 1}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${isDegraded ? 'bg-soc-med' : 'bg-soc-ok'}`} aria-hidden="true" />
              </div>
              <div className={`truncate text-2xs font-bold ${isSelected ? 'text-soc-text' : 'text-soc-textSecondary'}`}>{s.name}</div>
              <div className={`mt-0.5 truncate text-[9.5px] ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted'}`}>{s.sanskrit}</div>
              <div className="mt-1.5 text-2xs font-bold tabular-nums text-soc-text">{s.metric}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="flex flex-col justify-between gap-3 rounded-md border border-soc-border bg-soc-overlay p-3.5 text-xs md:flex-row md:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-soc-text">{selected.name}</span>
            <span className="text-2xs text-soc-textMuted">({selected.sanskrit})</span>
          </div>
          <p className="font-sans text-xs text-soc-textSecondary">{selected.desc}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-4 border-t border-soc-border pt-2 text-xs md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <div>
            <span className="block text-2xs uppercase tracking-[0.1em] text-soc-textDim">Engine State</span>
            <span className={`text-xs font-bold ${selected.status === 'DEGRADED' ? 'text-soc-med' : 'text-soc-ok'}`}>{selected.status}</span>
          </div>
          <div>
            <span className="block text-2xs uppercase tracking-[0.1em] text-soc-textDim">Throughput</span>
            <span className="text-xs font-bold tabular-nums text-soc-text">{selected.metric}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
