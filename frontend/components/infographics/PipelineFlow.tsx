'use client';

import React, { useState } from 'react';
import {
  Database,
  Sliders,
  Cpu,
  FileCheck2,
  Lock,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  sanskrit: string;
  category: string;
  status: 'ACTIVE' | 'OPTIMAL' | 'DEGRADED';
  throughput: string;
  latency: string;
  description: string;
  metrics: { label: string; value: string }[];
  icon: React.ElementType;
}

const PIPELINE_STAGES: StageInfo[] = [
  {
    id: 'stage-1',
    name: 'Telemetry Ingestion',
    sanskrit: 'SAṄGRAHA',
    category: 'Ingestion Layer',
    status: 'OPTIMAL',
    throughput: '14,280 eps',
    latency: '1.2ms',
    description: 'Ingests operational telemetry from SIEM, EDR, IDS, Firewall, and Case Management systems.',
    metrics: [
      { label: 'Sources', value: '08 Connected' },
      { label: 'Drop Rate', value: '0.00%' },
    ],
    icon: Database,
  },
  {
    id: 'stage-2',
    name: 'Schema Normalization',
    sanskrit: 'ŚODHANA',
    category: 'Pre-Processing',
    status: 'OPTIMAL',
    throughput: '14,280 eps',
    latency: '0.8ms',
    description: 'Maps multi-vendor alerts to unified SOC Knowledge Model (OCSF / STIX taxonomy).',
    metrics: [
      { label: 'Mapping Quality', value: '99.94%' },
      { label: 'Schema', value: 'v2.4 OCSF' },
    ],
    icon: Sliders,
  },
  {
    id: 'stage-3',
    name: 'Supervisory AI & Gap Engines',
    sanskrit: 'VIVEKA · ABHĀVA · VIKĀRA',
    category: 'Core Intelligence',
    status: 'DEGRADED',
    throughput: '7 Scenarios',
    latency: '4.5ms',
    description: 'Deterministic rules + Isolation Forest ML detecting SOP omissions and metric manipulation.',
    metrics: [
      { label: 'Execution Gaps', value: '14 Detected' },
      { label: 'Negative Space', value: '06 Detected' },
    ],
    icon: Cpu,
  },
  {
    id: 'stage-4',
    name: '7-Point Explainability',
    sanskrit: 'MĀN & PRATYAYA',
    category: 'Forensic Audit',
    status: 'OPTIMAL',
    throughput: '100% Decomposed',
    latency: '2.1ms',
    description: 'Decomposes every risk score into factor weights. Answers WHAT, WHY, WHEN, WHERE, EVIDENCE, CONFIDENCE, RECOMMENDATION.',
    metrics: [
      { label: 'Black-Box Rules', value: '0%' },
      { label: 'Mean Confidence', value: '94%' },
    ],
    icon: FileCheck2,
  },
  {
    id: 'stage-5',
    name: 'Tamper-Evident Ledger',
    sanskrit: 'SAKṢĪ · AKṢARA',
    category: 'Cryptographic Chain',
    status: 'OPTIMAL',
    throughput: 'Block #9905',
    latency: '0.4ms',
    description: 'Append-only SHA-256 local hash-chain recording supervisor actions and decision provenance.',
    metrics: [
      { label: 'Chain Integrity', value: 'VERIFIED' },
      { label: 'Air-Gap State', value: 'LOCAL' },
    ],
    icon: Lock,
  },
];

export function PipelineFlow() {
  const [activeStage, setActiveStage] = useState<StageInfo>(PIPELINE_STAGES[2]);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 font-mono select-none shadow-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Supervisory Data Pipeline Architecture
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Gaps Active
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">100% AIR-GAPPED</span>
        </div>
      </div>

      {/* Pipeline Stage Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage.id === stage.id;
          const isDegraded = stage.status === 'DEGRADED';

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage)}
              className={`p-3.5 text-left rounded-xl border transition-all relative ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>0{idx + 1}</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDegraded ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{stage.name}</div>
              <div className={`text-[10px] font-mono truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {stage.sanskrit}
              </div>
              <div className={`text-[10px] mt-2 flex justify-between ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Rate:</span>
                <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{stage.throughput}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-700 font-bold rounded-md shadow-xs">
              {activeStage.category}
            </span>
            <span className="text-xs font-bold text-slate-900">{activeStage.name} ({activeStage.sanskrit})</span>
          </div>
          <p className="text-xs font-sans text-slate-600 leading-relaxed">
            {activeStage.description}
          </p>
        </div>

        <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-5 text-xs">
          {activeStage.metrics.map((m, i) => (
            <div key={i} className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">{m.label}</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">{m.value}</span>
            </div>
          ))}
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Latency</span>
            <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{activeStage.latency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
