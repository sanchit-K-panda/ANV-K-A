'use client';

import React, { useState } from 'react';
import {
  Layers,
  Maximize2,
  Activity,
  Workflow,
  Search,
  Zap,
  ShieldAlert,
  Repeat,
  Share2,
  Lock,
  X,
} from 'lucide-react';
import { SocLifecycleFlow } from '@/components/infographics/SocLifecycleFlow';
import { IntelligenceFlow } from '@/components/infographics/IntelligenceFlow';
import { ExecutionGapMatrix } from '@/components/dashboard/ExecutionGapMatrix';
import { RiskContributionBreakdown } from '@/components/infographics/RiskContributionBreakdown';
import { ThreatRecurrenceTimeline } from '@/components/infographics/ThreatRecurrenceTimeline';
import { FindingCorrelationGraph } from '@/components/infographics/FindingCorrelationGraph';
import { SecureSessionEnclave } from '@/components/infographics/SecureSessionEnclave';
import { AirGapArchitecture } from '@/components/infographics/AirGapArchitecture';
import { HashChainLedger } from '@/components/infographics/HashChainLedger';

export interface InfographicViewOption {
  id: string;
  title: string;
  category: string;
  engine: string;
  icon: React.ElementType;
  description: string;
}

export const INFOGRAPHIC_VIEWS: InfographicViewOption[] = [
  {
    id: 'execution-gap',
    title: 'Execution Gap & SOP Bypasses',
    category: 'VIVEKA Engine',
    engine: 'VIVEKA',
    icon: Zap,
    description: 'Compares established standard operating procedures against actual observed telemetry.',
  },
  {
    id: 'negative-space',
    title: 'Negative Space & Omission Matrix',
    category: 'ABHĀVA Engine',
    engine: 'ABHĀVA',
    icon: Search,
    description: 'Visualizes missing actions (unperformed memory dumps, skipped host isolations).',
  },
  {
    id: 'pipeline',
    title: '8-Stage Intelligence Pipeline',
    category: 'Architecture',
    engine: 'MEDHĀ',
    icon: Workflow,
    description: 'End-to-end data ingestion, schema normalization, anomaly ML, and audit chaining.',
  },
  {
    id: 'lifecycle',
    title: 'SOC Operational Workflow Flow',
    category: 'SOP Audit',
    engine: 'PARĪKṢA',
    icon: Activity,
    description: 'Step-by-step audit from raw alert ingestion to resolution and case closure.',
  },
  {
    id: 'risk-decomposition',
    title: 'Risk Factor Decomposition (91/100)',
    category: 'MĀN Engine',
    engine: 'MĀN',
    icon: ShieldAlert,
    description: 'Additive linear factor weights explaining composite risk score calculation.',
  },
  {
    id: 'threat-recurrence',
    title: 'Threat Recurrence Chronology',
    category: 'PUNARĀVṚTTI',
    engine: 'PUNARĀVṚTTI',
    icon: Repeat,
    description: 'Timeline of unresolved repeat attack signatures hitting the same infrastructure.',
  },
  {
    id: 'correlation-graph',
    title: 'Evidence Correlation Provenance Graph',
    category: 'PRATYAYA Engine',
    engine: 'PRATYAYA',
    icon: Share2,
    description: 'Connects Raw Alert → Incident → Analyst → Omission → Threat → Supervisory Finding.',
  },
  {
    id: 'airgap-enclave',
    title: 'Sovereign Air-Gap Architecture',
    category: 'Infrastructure',
    engine: 'AKṢARA',
    icon: Lock,
    description: 'Hardware boundary proof with 0 B/s external network egress and local cryptographic storage.',
  },
  {
    id: 'secure-session',
    title: 'Zero-Trust Biometric & Session Protocol',
    category: 'KAVACA Enclave',
    engine: 'KAVACA',
    icon: Lock,
    description: 'DARŚANA optical verification, BANDHA TPM binding, and KṢAṆA 15-min rotating tokens.',
  },
];

interface InfographicIntelligenceWindowProps {
  activeViewId?: string;
  onViewChange?: (viewId: string) => void;
}

export const InfographicIntelligenceWindow: React.FC<InfographicIntelligenceWindowProps> = ({
  activeViewId = 'execution-gap',
  onViewChange,
}) => {
  const [currentViewId, setCurrentViewId] = useState<string>(activeViewId);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeView = INFOGRAPHIC_VIEWS.find((v) => v.id === currentViewId) || INFOGRAPHIC_VIEWS[0];

  const handleSelectView = (id: string) => {
    setCurrentViewId(id);
    onViewChange?.(id);
  };

  const renderActiveInfographic = () => {
    switch (currentViewId) {
      case 'execution-gap':
      case 'negative-space':
        return <ExecutionGapMatrix />;
      case 'pipeline':
        return <IntelligenceFlow />;
      case 'lifecycle':
        return <SocLifecycleFlow />;
      case 'risk-decomposition':
        return <RiskContributionBreakdown />;
      case 'threat-recurrence':
        return <ThreatRecurrenceTimeline />;
      case 'correlation-graph':
        return <FindingCorrelationGraph />;
      case 'airgap-enclave':
        return (
          <div className="space-y-4">
            <AirGapArchitecture />
            <HashChainLedger />
          </div>
        );
      case 'secure-session':
        return <SecureSessionEnclave />;
      default:
        return <ExecutionGapMatrix />;
    }
  };

  return (
    <>
      {/* Primary Embedded Intelligence Window */}
      <div className="soc-panel select-none">
        {/* Window Top Control Bar */}
        <div className="soc-panel-header">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-sm border border-soc-accent/60 bg-soc-accentInk flex items-center justify-center flex-shrink-0">
              <Layers className="w-3.5 h-3.5 text-soc-accent" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="panel-label">Intelligence Window — SOC Data Visualizer</h2>
                <span className="soc-badge badge-accent hidden md:inline">{INFOGRAPHIC_VIEWS.length} VISUAL MODELS</span>
              </div>
              <p className="text-2xs text-soc-textMuted mt-0.5 truncate hidden lg:block">
                Interactive analytical infographics mapping telemetry, execution omissions, risk, and forensic proof.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="btn-ghost flex-shrink-0"
            title="Expand into Fullscreen Intelligence Studio"
          >
            <Maximize2 className="w-3 h-3" />
            <span>FULLSCREEN</span>
          </button>
        </div>

        {/* Model Selector Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-soc-border text-xs">
          {INFOGRAPHIC_VIEWS.map((v) => {
            const Icon = v.icon;
            const isSelected = v.id === currentViewId;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectView(v.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-2xs whitespace-nowrap transition-colors border font-mono tracking-wide ${
                  isSelected
                    ? 'bg-soc-accentInk border-soc-accent/50 text-soc-accentBright'
                    : 'bg-soc-raised/40 border-soc-border text-soc-textSecondary hover:text-soc-text hover:border-soc-borderStrong'
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted'}`} />
                <span className="font-sans font-medium">{v.title}</span>
                <span className={`px-1 rounded-sm text-2xs ${isSelected ? 'bg-soc-accent/20 text-soc-accentBright' : 'bg-soc-raised text-soc-textMuted'}`}>
                  {v.engine}
                </span>
              </button>
            );
          })}
        </div>

        {/* Display Stage */}
        <div className="p-4 bg-soc-overlay/40">
          {renderActiveInfographic()}
        </div>
      </div>

      {/* Fullscreen Intelligence Studio */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex flex-col text-xs p-4 sm:p-6 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="ANVĪKṢA Intelligence Studio"
        >
          <div className="bg-soc-panel border border-soc-borderStrong flex-1 flex flex-col overflow-hidden shadow-drawer">
            {/* Studio Header */}
            <div className="soc-panel-header px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Layers className="w-4 h-4 text-soc-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-soc-text tracking-wide">
                      ANVĪKṢA Intelligence Studio · {activeView.title}
                    </h3>
                    <span className="soc-badge badge-accent">{activeView.engine}</span>
                  </div>
                  <p className="text-2xs text-soc-textMuted mt-0.5 truncate">
                    {activeView.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 text-soc-textMuted hover:text-soc-text hover:bg-soc-raised rounded-sm transition-colors"
                title="Close Fullscreen"
                aria-label="Close fullscreen studio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Studio Body: Sidebar Nav + Stage */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left View Switcher */}
              <div className="w-64 bg-soc-bg border-r border-soc-border p-3 space-y-2 overflow-y-auto flex-shrink-0 hidden md:block">
                <div className="panel-label px-1 pb-1">All Infographic Models</div>
                <div className="space-y-1">
                  {INFOGRAPHIC_VIEWS.map((v) => {
                    const Icon = v.icon;
                    const isSelected = v.id === currentViewId;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectView(v.id)}
                        aria-pressed={isSelected}
                        className={`w-full text-left px-2.5 py-2 rounded-sm text-xs transition-colors border ${
                          isSelected
                            ? 'bg-soc-accentInk border-soc-accent/50 text-soc-text'
                            : 'bg-transparent border-transparent text-soc-textSecondary hover:bg-soc-raised hover:text-soc-text'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-soc-accent' : 'text-soc-textMuted'}`} />
                          <span className="font-medium truncate">{v.title}</span>
                        </div>
                        <div className={`text-2xs mt-1 font-mono pl-6 ${isSelected ? 'text-soc-accentBright/70' : 'text-soc-textDim'}`}>
                          {v.category} · {v.engine}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center Viewport */}
              <div className="flex-1 p-5 overflow-y-auto bg-soc-overlay/40">
                <div className="max-w-5xl mx-auto space-y-4">
                  {renderActiveInfographic()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
