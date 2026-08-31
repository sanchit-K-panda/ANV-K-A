'use client';

import React, { useState } from 'react';
import { Database, Sliders, Cpu, Search, FileCheck2, ShieldAlert, FileText, UserCheck, ChevronRight } from 'lucide-react';

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
    <div className="soc-panel p-5 space-y-4 font-mono select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            ANVĪKṢA Intelligence Architecture Flow
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
          <span className="flex items-center gap-1"><span className="dot-green" /> Nominal</span>
          <span className="flex items-center gap-1"><span className="dot-amber" /> Findings Active</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-700 font-semibold">100% AIR-GAPPED</span>
        </div>
      </div>

      {/* Horizontal Flow Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {FLOW_STAGES.map((s, idx) => {
          const isSelected = selected.id === s.id;
          const isDegraded = s.status === 'DEGRADED';

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              className={`p-2.5 text-left rounded border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className={`font-mono font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  0{idx + 1}
                </span>
                <span className={isDegraded ? 'dot-amber' : 'dot-green'} />
              </div>
              <div className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {s.name}
              </div>
              <div className={`text-[9.5px] truncate font-mono mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                {s.sanskrit}
              </div>
              <div className={`text-[10px] mt-1.5 font-bold ${isSelected ? 'text-slate-200' : 'text-slate-800'}`}>
                {s.metric}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{selected.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">({selected.sanskrit})</span>
          </div>
          <p className="text-slate-600 font-sans text-xs">{selected.desc}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4 flex-shrink-0">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Engine State</span>
            <span className={`font-bold ${selected.status === 'DEGRADED' ? 'text-amber-700' : 'text-emerald-700'}`}>
              {selected.status}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Throughput</span>
            <span className="text-slate-900 font-bold">{selected.metric}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
