'use client';

import React, { useState } from 'react';
import {
  Layers,
  Maximize2,
  Minimize2,
  Activity,
  Workflow,
  Search,
  Zap,
  ShieldAlert,
  Repeat,
  Share2,
  Users,
  Lock,
  ChevronRight,
  Info,
  Download,
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
    description: 'Connects Raw Alert ➔ Incident ➔ Analyst ➔ Omission ➔ Threat ➔ Supervisory Finding.',
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
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      {/* Primary Embedded Infographic Window */}
      <div className="soc-panel p-5 space-y-4 font-mono select-none border-2 border-slate-300 shadow-card">
        {/* Window Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                  Infographic Intelligence Window (All SOC Data Visualizer)
                </h2>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.2 rounded border border-blue-200">
                  09 VISUAL MODELS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Interactive analytical infographics mapping telemetry, execution omissions, risk, and forensic proof.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs transition-colors border border-slate-200"
              title="Expand into Fullscreen Infographic Studio"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Studio</span>
            </button>
          </div>
        </div>

        {/* Infographic Model Selector Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {INFOGRAPHIC_VIEWS.map((v) => {
            const Icon = v.icon;
            const isSelected = v.id === currentViewId;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{v.title}</span>
                <span className={`text-[9.5px] px-1 py-0.1 rounded font-mono ${
                  isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  {v.engine}
                </span>
              </button>
            );
          })}
        </div>

        {/* Infographic Display Stage */}
        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-200">
          {renderActiveInfographic()}
        </div>
      </div>

      {/* Fullscreen Infographic Studio Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col font-mono text-xs animate-in fade-in duration-150 p-4 sm:p-6 overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                      ANVĪKṢA Infographic Studio · {activeView.title}
                    </h3>
                    <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.2 rounded">
                      {activeView.engine}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    {activeView.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                  title="Close Fullscreen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Sidebar Nav + Stage */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left View Switcher */}
              <div className="w-72 bg-slate-50 border-r border-slate-200 p-3 space-y-2 overflow-y-auto flex-shrink-0">
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  All Infographic Models
                </div>
                <div className="space-y-1">
                  {INFOGRAPHIC_VIEWS.map((v) => {
                    const Icon = v.icon;
                    const isSelected = v.id === currentViewId;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectView(v.id)}
                        className={`w-full text-left p-2.5 rounded text-xs transition-all border ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                            <span className="font-sans font-semibold text-xs">{v.title}</span>
                          </div>
                        </div>
                        <div className={`text-[10px] mt-1 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {v.category} · {v.engine}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center Viewport */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50">
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
