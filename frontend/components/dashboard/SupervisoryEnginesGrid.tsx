'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import {
  SocZap,
  SocSearch,
  SocActivity,
  SocShieldAlert,
  SocFile,
  SocRefresh,
  SocLock,
  SocShieldCheck,
} from '@/components/icons';

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
    badge: '14 gaps detected',
    summary: 'Identifies procedural omissions between incident SOPs and actual forensic actions.',
    metricLabel: 'Omission Rate',
    metricValue: '74% Bypass',
    icon: SocZap,
    color: 'badge-critical',
    targetInfographicId: 'execution-gap',
  },
  {
    id: 'abhava',
    name: 'Negative Space',
    sanskrit: 'ABHĀVA',
    role: 'Omission Intelligence',
    status: 'ALERT',
    badge: '6 omissions',
    summary: 'Analyzes what should have happened but did not occur in telemetry.',
    metricLabel: 'Missing Dumps',
    metricValue: '63 Cases',
    icon: SocSearch,
    color: 'badge-critical',
    targetInfographicId: 'negative-space',
  },
  {
    id: 'vikara',
    name: 'Behavioural ML',
    sanskrit: 'VIKĀRA',
    role: 'SLA & MTTR Anomaly Model',
    status: 'ALERT',
    badge: '12 anomalies',
    summary: 'Detects rapid alert closures, metric manipulation, and analyst burnout.',
    metricLabel: 'Mean Dwell Time',
    metricValue: '42s (vs 44m)',
    icon: SocActivity,
    color: 'badge-medium',
    targetInfographicId: 'behaviour-ml',
  },
  {
    id: 'man',
    name: 'Risk Quantification',
    sanskrit: 'MĀN',
    role: 'Bayesian Weight Decomposition',
    status: 'ALERT',
    badge: 'Risk 91/100',
    summary: 'Decomposes composite SOC risk into additive mathematical factor weights.',
    metricLabel: 'Composite Score',
    metricValue: '91/100 (Critical)',
    icon: SocShieldAlert,
    color: 'badge-critical',
    targetInfographicId: 'risk-decomposition',
  },
  {
    id: 'punaravrtti',
    name: 'Threat Recurrence',
    sanskrit: 'PUNARĀVṚTTI',
    role: 'Unresolved Attack Tracking',
    status: 'ALERT',
    badge: '8 recurrences',
    summary: 'Flags persistent attack signatures recurring on the same domain assets.',
    metricLabel: 'Repeat Frequency',
    metricValue: '3.2x Frequency',
    icon: SocRefresh,
    color: 'badge-medium',
    targetInfographicId: 'threat-recurrence',
  },
  {
    id: 'pratyaya',
    name: 'Explainability',
    sanskrit: 'PRATYAYA',
    role: '7-Point Mathematical Proof',
    status: 'NOMINAL',
    badge: '100% auditable',
    summary: 'Answers WHAT, WHY, WHEN, WHERE, WHO, EVIDENCE, and RECOMMENDATION.',
    metricLabel: 'Confidence Mean',
    metricValue: '94% Confidence',
    icon: SocFile,
    color: 'badge-ok',
    targetInfographicId: 'correlation-graph',
  },
  {
    id: 'saksi',
    name: 'Cryptographic Audit',
    sanskrit: 'SAKṢĪ',
    role: 'Immutable Local Hash-Chain',
    status: 'NOMINAL',
    badge: 'Block #9905',
    summary: 'Append-only SHA-256 local ledger guaranteeing tamper-evident decision logs.',
    metricLabel: 'Chain Integrity',
    metricValue: '100% Verified',
    icon: SocLock,
    color: 'badge-ok',
    targetInfographicId: 'airgap-enclave',
  },
  {
    id: 'kavaca',
    name: 'Zero-Trust Enclave',
    sanskrit: 'KAVACA',
    role: 'Biometrics + TPM Hardware Binding',
    status: 'NOMINAL',
    badge: 'DEV-21 bound',
    summary: 'DARŚANA optical verification + KṢAṆA 15-min rotating session credentials.',
    metricLabel: 'Session Token',
    metricValue: '15m Rotating',
    icon: SocShieldCheck,
    color: 'badge-ok',
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
  const alertCount = SUPERVISORY_ENGINES.filter((e) => e.status === 'ALERT').length;

  return (
    <div className="soc-panel select-none">
      {/* Header */}
      <div className="soc-panel-header">
        <div>
          <span className="panel-label">Supervisory Intelligence Engines</span>
          <p className="text-2xs text-soc-textMuted mt-0.5">
            Eight analytical engines continuously interrogate the same telemetry
          </p>
        </div>
        <div className="flex items-center gap-3 text-2xs text-soc-textMuted">
          <span className="flex items-center gap-1.5"><span className="dot-green" /> {SUPERVISORY_ENGINES.length - alertCount} nominal</span>
          <span className="flex items-center gap-1.5"><span className="dot-red" /> {alertCount} alert</span>
        </div>
      </div>

      {/* 8-Engine Grid — crisp enterprise telemetry matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3">
        {SUPERVISORY_ENGINES.map((eng) => {
          const Icon = eng.icon;
          const isSelected = selectedEngineId === eng.id;
          const isAlert = eng.status === 'ALERT';

          return (
            <button
              key={eng.id}
              type="button"
              onClick={() => onSelectEngine(eng)}
              aria-pressed={isSelected}
              className={`p-3 text-left transition-all duration-150 flex flex-col justify-between space-y-2.5 group rounded-md border ${
                isSelected
                  ? 'bg-soc-accent/10 border-soc-accent text-soc-text font-medium'
                  : 'bg-soc-panel border-soc-border hover:border-soc-borderStrong hover:bg-soc-raised/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isAlert ? 'bg-soc-crit' : 'bg-soc-ok'}`} />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-soc-text truncate uppercase">
                      {eng.sanskrit}
                    </span>
                  </div>
                  <span className={`soc-badge ${isSelected ? 'badge-accent' : eng.color}`}>
                    {eng.badge}
                  </span>
                </div>

                <div className="text-xs font-semibold text-soc-text leading-tight flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted'}`} />
                  <span className="truncate">{eng.name}</span>
                </div>
                <div className="text-[11px] font-mono text-soc-textMuted mt-1 line-clamp-1">
                  {eng.role}
                </div>
              </div>

              {/* Metric & Trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-soc-border/60 text-[11px] font-mono">
                <span className="text-soc-textSecondary font-semibold tabular-nums truncate max-w-[140px]">
                  {eng.metricValue}
                </span>
                <span className={`flex items-center gap-0.5 text-[10px] font-semibold uppercase transition-colors ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted group-hover:text-soc-accent'}`}>
                  INSPECT
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
