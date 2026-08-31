'use client';

import React from 'react';
import {
  Zap,
  Search,
  Activity,
  ShieldAlert,
  FileCheck2,
  Repeat,
  Lock,
  ShieldCheck,
  ChevronRight,
  Cpu,
} from 'lucide-react';

export interface EngineItem {
  id: string;
  name: string;
  sanskrit: string;
  role: string;
  status: 'ALERT' | 'NOMINAL' | 'ACTIVE';
  badge: string;
  summary: string;
  metricLabel: string;
  metricValue: string;
  icon: React.ElementType;
  color: string;
  targetInfographicId: string;
}

export const SUPERVISORY_ENGINES: EngineItem[] = [
  {
    id: 'viveka',
    name: 'Execution Gap',
    sanskrit: 'VIVEKA',
    role: 'SOP Bypass & Omission Detection',
    status: 'ALERT',
    badge: '14 GAPS DETECTED',
    summary: 'Identifies procedural omissions between incident SOPs and actual forensic actions.',
    metricLabel: 'Omission Rate',
    metricValue: '74% Bypass',
    icon: Zap,
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    targetInfographicId: 'execution-gap',
  },
  {
    id: 'abhava',
    name: 'Negative Space',
    sanskrit: 'ABHĀVA',
    role: 'Omission Intelligence',
    status: 'ALERT',
    badge: '6 OMISSIONS',
    summary: 'Analyzes what should have happened but did not occur in telemetry.',
    metricLabel: 'Missing Dumps',
    metricValue: '63 Cases',
    icon: Search,
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    targetInfographicId: 'negative-space',
  },
  {
    id: 'vikara',
    name: 'Behavioural ML',
    sanskrit: 'VIKĀRA',
    role: 'SLA & MTTR Anomaly Model',
    status: 'ALERT',
    badge: '12 ANOMALIES',
    summary: 'Detects rapid alert closures, metric manipulation, and analyst burnout.',
    metricLabel: 'Mean Dwell Time',
    metricValue: '42s (vs 44m)',
    icon: Activity,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    targetInfographicId: 'behaviour-ml',
  },
  {
    id: 'man',
    name: 'Risk Quantification',
    sanskrit: 'MĀN',
    role: 'Bayesian Weight Decomposition',
    status: 'ALERT',
    badge: 'RISK 91 / 100',
    summary: 'Decomposes composite SOC risk into additive mathematical factor weights.',
    metricLabel: 'Composite Score',
    metricValue: '91/100 (Critical)',
    icon: ShieldAlert,
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    targetInfographicId: 'risk-decomposition',
  },
  {
    id: 'punaravrtti',
    name: 'Threat Recurrence',
    sanskrit: 'PUNARĀVṚTTI',
    role: 'Unresolved Attack Tracking',
    status: 'ALERT',
    badge: '8 RECURRENCES',
    summary: 'Flags persistent attack signatures recurring on the same domain assets.',
    metricLabel: 'Repeat Frequency',
    metricValue: '3.2x Frequency',
    icon: Repeat,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    targetInfographicId: 'threat-recurrence',
  },
  {
    id: 'pratyaya',
    name: 'Explainability',
    sanskrit: 'PRATYAYA',
    role: '7-Point Mathematical Proof',
    status: 'NOMINAL',
    badge: '100% AUDITABLE',
    summary: 'Answers WHAT, WHY, WHEN, WHERE, WHO, EVIDENCE, and RECOMMENDATION.',
    metricLabel: 'Confidence Mean',
    metricValue: '94% Confidence',
    icon: FileCheck2,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    targetInfographicId: 'correlation-graph',
  },
  {
    id: 'saksi',
    name: 'Cryptographic Audit',
    sanskrit: 'SAKṢĪ + AKṢARA',
    role: 'Immutable Local Hash-Chain',
    status: 'NOMINAL',
    badge: 'BLOCK #9905',
    summary: 'Append-only SHA-256 local ledger guaranteeing tamper-evident decision logs.',
    metricLabel: 'Chain Integrity',
    metricValue: '100% Verified',
    icon: Lock,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    targetInfographicId: 'airgap-enclave',
  },
  {
    id: 'kavaca',
    name: 'Zero-Trust Enclave',
    sanskrit: 'KAVACA',
    role: 'Biometrics + TPM Hardware Binding',
    status: 'NOMINAL',
    badge: 'DEV-21 BOUND',
    summary: 'DARŚANA optical verification + KṢAṆA 15-min rotating session credentials.',
    metricLabel: 'Session Token',
    metricValue: '15m Rotating',
    icon: ShieldCheck,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    targetInfographicId: 'secure-session',
  },
];

interface SupervisoryEnginesGridProps {
  selectedEngineId?: string;
  onSelectEngine: (engine: EngineItem) => void;
}

export const SupervisoryEnginesGrid: React.FC<SupervisoryEnginesGridProps> = ({
  selectedEngineId,
  onSelectEngine,
}) => {
  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-800" />
          <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs font-sans">
            ANVĪKṢA Core Supervisory Intelligence Engines
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
          <span className="flex items-center gap-1"><span className="dot-green" /> 3 Nominal</span>
          <span className="flex items-center gap-1"><span className="dot-red" /> 5 Alert Findings</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold">Click engine to launch Infographic</span>
        </div>
      </div>

      {/* 8-Engine Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SUPERVISORY_ENGINES.map((eng) => {
          const Icon = eng.icon;
          const isSelected = selectedEngineId === eng.id;

          return (
            <button
              key={eng.id}
              type="button"
              onClick={() => onSelectEngine(eng)}
              className={`p-3.5 text-left rounded-lg border transition-all relative flex flex-col justify-between space-y-2 group ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-700'}`} />
                    <span className={`text-[10px] font-bold font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {eng.sanskrit}
                    </span>
                  </div>
                  <span
                    className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      isSelected
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : eng.color
                    }`}
                  >
                    {eng.badge}
                  </span>
                </div>

                <div className={`text-xs font-bold font-sans ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {eng.name}
                </div>
                <div className={`text-[10.5px] font-sans mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {eng.role}
                </div>
              </div>

              {/* Metric & Interactive Trigger */}
              <div className={`pt-2 border-t flex items-center justify-between text-[10.5px] ${
                isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-200/80 text-slate-600'
              }`}>
                <span>{eng.metricLabel}: <strong className={isSelected ? 'text-white' : 'text-slate-900'}>{eng.metricValue}</strong></span>
                <span className="flex items-center gap-0.5 text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span className={isSelected ? 'text-slate-300' : 'text-blue-600'}>View</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
