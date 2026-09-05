'use client';

import React, { useState } from 'react';
import {
  Database,
  Sliders,
  Cpu,
  FileCheck2,
  Lock,
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
    <div className="soc-panel space-y-4 p-5 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
          <h3 className="panel-label">Supervisory Data Pipeline Architecture</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.1em] text-soc-textMuted">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-soc-ok" aria-hidden="true" /> Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-soc-med" aria-hidden="true" /> Gaps Active
          </span>
          <span className="rounded-sm border border-soc-border bg-soc-raised px-2 py-0.5 text-[9.5px] font-bold tracking-[0.08em] text-soc-textSecondary">
            100% AIR-GAPPED
          </span>
        </div>
      </div>

      {/* Pipeline Stage Nodes */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage.id === stage.id;
          const isDegraded = stage.status === 'DEGRADED';

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage)}
              aria-pressed={isSelected}
              className={`relative rounded-sm border p-3.5 text-left transition-colors ${
                isSelected
                  ? 'border-soc-accent/60 bg-soc-accentInk'
                  : 'border-soc-border bg-soc-panel hover:border-soc-borderStrong hover:bg-soc-overlay'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted'}`} aria-hidden="true" />
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-soc-accentBright' : 'text-soc-textDim'}`}>0{idx + 1}</span>
                </div>
                <span className={`h-1.5 w-1.5 rounded-full ${isDegraded ? 'bg-soc-med' : 'bg-soc-ok'}`} aria-hidden="true" />
              </div>

              <div className={`truncate text-xs font-bold ${isSelected ? 'text-soc-text' : 'text-soc-textSecondary'}`}>{stage.name}</div>
              <div className={`mt-0.5 truncate text-[10px] ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted'}`}>{stage.sanskrit}</div>
              <div className={`mt-2 flex justify-between text-[10px] uppercase tracking-[0.08em] ${isSelected ? 'text-soc-textSecondary' : 'text-soc-textMuted'}`}>
                <span>Rate</span>
                <span className="font-bold tabular-nums text-soc-text">{stage.throughput}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="flex flex-col justify-between gap-4 rounded-sm border border-soc-border bg-soc-overlay p-4 md:flex-row md:items-center">
        <div className="max-w-xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-sm border border-soc-border bg-soc-raised px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-soc-textSecondary">
              {activeStage.category}
            </span>
            <span className="text-xs font-bold text-soc-text">{activeStage.name} ({activeStage.sanskrit})</span>
          </div>
          <p className="font-sans text-xs leading-relaxed text-soc-textSecondary">
            {activeStage.description}
          </p>
        </div>

        <div className="flex items-center gap-5 border-t border-soc-border pt-2 text-xs md:border-l md:border-t-0 md:pl-5 md:pt-0">
          {activeStage.metrics.map((m, i) => (
            <div key={i} className="text-left">
              <span className="block text-[9px] font-medium uppercase tracking-[0.1em] text-soc-textDim">{m.label}</span>
              <span className="mt-0.5 block text-xs font-bold tabular-nums text-soc-text">{m.value}</span>
            </div>
          ))}
          <div className="text-left">
            <span className="block text-[9px] font-medium uppercase tracking-[0.1em] text-soc-textDim">Latency</span>
            <span className="mt-0.5 block text-xs font-bold tabular-nums text-soc-text">{activeStage.latency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
