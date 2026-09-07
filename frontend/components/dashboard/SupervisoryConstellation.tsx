'use client';

import React, { useState } from 'react';
import {
  Zap,
  Search,
  Cpu,
  ShieldAlert,
  Repeat,
  Share2,
  Lock,
  FileCheck,
  Radio,
  ChevronRight,
} from 'lucide-react';

export interface SupervisoryNode {
  id: string;
  name: string;
  sanskrit: string;
  role: string;
  category: string;
  status: 'OPTIMAL' | 'EVALUATING' | 'OMISSION_ALERT' | 'LOCKED';
  latency: string;
  omissionsDetected: number;
  confidence: number;
  hash: string;
  x: number; // percentage in radar space
  y: number;
  targetInfographicId: string;
  icon: React.ElementType;
}

export const SUPERVISORY_NODES: SupervisoryNode[] = [
  {
    id: 'viveka',
    name: 'VIVEKA',
    sanskrit: 'विवेक',
    role: 'SOP Execution Gap Analysis',
    category: 'PROCESS_AUDIT',
    status: 'OMISSION_ALERT',
    latency: '1.2ms',
    omissionsDetected: 4,
    confidence: 96,
    hash: '0x7F4A...12E9',
    x: 22,
    y: 28,
    targetInfographicId: 'execution-gap',
    icon: Zap,
  },
  {
    id: 'abhava',
    name: 'ABHĀVA',
    sanskrit: 'अभाव',
    role: 'Negative Space & Missing Actions',
    category: 'FORENSIC_VOID',
    status: 'OMISSION_ALERT',
    latency: '0.8ms',
    omissionsDetected: 3,
    confidence: 94,
    hash: '0x3C81...5B2A',
    x: 78,
    y: 26,
    targetInfographicId: 'negative-space',
    icon: Search,
  },
  {
    id: 'vikara',
    name: 'VIKĀRA',
    sanskrit: 'विकार',
    role: 'Analyst Behavioural Anomaly ML',
    category: 'BEHAVIOURAL_ML',
    status: 'OPTIMAL',
    latency: '2.4ms',
    omissionsDetected: 0,
    confidence: 91,
    hash: '0x99D2...80AA',
    x: 88,
    y: 58,
    targetInfographicId: 'pipeline',
    icon: Cpu,
  },
  {
    id: 'man',
    name: 'MĀN',
    sanskrit: 'मान',
    role: 'Bayesian Risk Decomposition',
    category: 'RISK_QUANT',
    status: 'OPTIMAL',
    latency: '0.4ms',
    omissionsDetected: 0,
    confidence: 98,
    hash: '0x55B0...C41F',
    x: 68,
    y: 84,
    targetInfographicId: 'risk-decomposition',
    icon: ShieldAlert,
  },
  {
    id: 'punaravrtti',
    name: 'PUNARĀVṚTTI',
    sanskrit: 'पुनरावृत्ति',
    role: 'Threat Recurrence Engine',
    category: 'PERSISTENCE',
    status: 'OMISSION_ALERT',
    latency: '1.9ms',
    omissionsDetected: 2,
    confidence: 89,
    hash: '0x14E7...3F88',
    x: 32,
    y: 84,
    targetInfographicId: 'threat-recurrence',
    icon: Repeat,
  },
  {
    id: 'pratyaya',
    name: 'PRATYAYA',
    sanskrit: 'प्रत्यय',
    role: 'Forensic Correlation Graph',
    category: 'GRAPH_SYNAPSE',
    status: 'OPTIMAL',
    latency: '3.1ms',
    omissionsDetected: 0,
    confidence: 95,
    hash: '0x8802...94DD',
    x: 12,
    y: 58,
    targetInfographicId: 'correlation-graph',
    icon: Share2,
  },
  {
    id: 'saksi',
    name: 'SAKṢĪ',
    sanskrit: 'साक्षी',
    role: 'Cryptographic Merkle Audit',
    category: 'IMMUTABLE_CHAIN',
    status: 'OPTIMAL',
    latency: '0.1ms',
    omissionsDetected: 0,
    confidence: 100,
    hash: '0x5E88...42D8',
    x: 50,
    y: 18,
    targetInfographicId: 'airgap-enclave',
    icon: FileCheck,
  },
  {
    id: 'kavaca',
    name: 'KAVACA',
    sanskrit: 'कवच',
    role: 'Air-Gap Enclave Isolation',
    category: 'ZERO_EGRESS',
    status: 'LOCKED',
    latency: '0.0ms',
    omissionsDetected: 0,
    confidence: 100,
    hash: '0xAA77...0011',
    x: 50,
    y: 50,
    targetInfographicId: 'secure-session',
    icon: Lock,
  },
];

interface SupervisoryConstellationProps {
  onSelectNode?: (node: SupervisoryNode) => void;
  activeNodeId?: string;
}

export const SupervisoryConstellation: React.FC<SupervisoryConstellationProps> = ({
  onSelectNode,
  activeNodeId = 'viveka',
}) => {
  const [selectedNode, setSelectedNode] = useState<SupervisoryNode>(
    SUPERVISORY_NODES.find((n) => n.id === activeNodeId) || SUPERVISORY_NODES[0]
  );

  const handleNodeClick = (node: SupervisoryNode) => {
    setSelectedNode(node);
    onSelectNode?.(node);
  };

  return (
    <div className="soc-panel overflow-hidden">
      {/* Panel Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-soc-accent" />
          <div>
            <span className="panel-label">SUPERVISORY TOPOLOGY GRAPH</span>
            <span className="text-2xs font-mono text-soc-textMuted ml-2 hidden sm:inline">
              8 SANSKRIT COGNITIVE ENGINES
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs font-mono">
          <span className="flex items-center gap-1 text-soc-ok font-medium">
            <Radio className="w-3 h-3 text-soc-ok" />
            LIVE TELEMETRY
          </span>
          <span className="text-soc-textDim">|</span>
          <span className="text-soc-textMuted">SAMPLING 10kHz</span>
        </div>
      </div>

      {/* Main Grid: Radar Screen (Left) + Engine Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] bg-soc-panel">
        {/* Radar Viewport (7 cols) */}
        <div className="lg:col-span-7 relative p-6 flex items-center justify-center bg-soc-overlay/40 min-h-[340px] overflow-hidden border-b lg:border-b-0 lg:border-r border-soc-border">
          {/* Concentric System Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Ring */}
            <div className="w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-full border border-soc-border/60" />
            {/* Mid Ring */}
            <div className="w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] rounded-full border border-soc-border/80" />
            {/* Inner Ring */}
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full border border-soc-accent/20" />
            {/* Center Crosshairs */}
            <div className="absolute w-full h-[1px] bg-soc-border/40" />
            <div className="absolute h-full w-[1px] bg-soc-border/40" />
          </div>

          {/* Interactive Engine Nodes */}
          <div className="relative w-full max-w-[380px] h-[320px]">
            {SUPERVISORY_NODES.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode.id === node.id;
              const isAlert = node.status === 'OMISSION_ALERT';
              const isCenter = node.id === 'kavaca';

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleNodeClick(node)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-20 group flex flex-col items-center focus:outline-none transition-transform"
                  aria-label={`${node.name} (${node.role})`}
                >
                  {/* Node Beacon */}
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected
                        ? isAlert
                          ? 'bg-soc-crit/20 border-soc-crit text-soc-crit'
                          : 'bg-soc-accent/20 border-soc-accent text-soc-accent'
                        : isAlert
                        ? 'bg-soc-critDim border-soc-crit/40 text-soc-crit'
                        : isCenter
                        ? 'bg-soc-ok/10 border-soc-ok/40 text-soc-ok'
                        : 'bg-soc-panel border-soc-border text-soc-textSecondary group-hover:border-soc-borderStrong group-hover:text-soc-text'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Node Label Pill */}
                  <div className="mt-1 flex flex-col items-center pointer-events-none">
                    <span
                      className={`text-[10px] font-mono font-semibold tracking-wide px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? isAlert
                            ? 'bg-soc-crit text-white border-soc-crit'
                            : 'bg-soc-accent text-white border-soc-accent font-bold'
                          : 'bg-soc-panel border-soc-border text-soc-textSecondary group-hover:text-soc-text'
                      }`}
                    >
                      {node.name}
                    </span>
                    <span className="text-[9px] font-mono text-soc-textDim">
                      {node.sanskrit}
                    </span>
                  </div>

                  {/* Alert Indicator */}
                  {isAlert && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-soc-crit border border-white dark:border-black" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Engine Telemetry Inspector (5 cols) */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-soc-raised/20">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-soc-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-display text-soc-text tracking-wide">
                    {selectedNode.name}
                  </span>
                  <span className="text-xs font-mono text-soc-accent font-semibold px-2 py-0.5 rounded bg-soc-accentDim border border-soc-accent/30">
                    {selectedNode.sanskrit}
                  </span>
                </div>
                <div className="text-2xs font-mono text-soc-textSecondary mt-0.5 font-medium">
                  {selectedNode.role}
                </div>
              </div>

              <span
                className={`soc-badge ${
                  selectedNode.status === 'OMISSION_ALERT'
                    ? 'badge-critical'
                    : selectedNode.status === 'LOCKED'
                    ? 'badge-verified'
                    : 'badge-accent'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-soc-border bg-soc-panel">
                <div className="text-3xs font-mono text-soc-textMuted uppercase">Inference Latency</div>
                <div className="text-sm font-bold font-mono text-soc-text mt-1 tabular-nums">
                  {selectedNode.latency}
                </div>
                <div className="text-3xs font-mono text-soc-ok mt-0.5">0.00% jitter</div>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-panel">
                <div className="text-3xs font-mono text-soc-textMuted uppercase">Bayesian Confidence</div>
                <div className="text-sm font-bold font-mono text-soc-accent mt-1 tabular-nums">
                  {selectedNode.confidence}%
                </div>
                <div className="text-3xs font-mono text-soc-textSecondary mt-0.5">p &lt; 0.001</div>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-panel">
                <div className="text-3xs font-mono text-soc-textMuted uppercase">Omissions Detected</div>
                <div
                  className={`text-sm font-bold font-mono mt-1 tabular-nums ${
                    selectedNode.omissionsDetected > 0 ? 'text-soc-crit' : 'text-soc-ok'
                  }`}
                >
                  {selectedNode.omissionsDetected} FLAGS
                </div>
                <div className="text-3xs font-mono text-soc-textSecondary mt-0.5">
                  {selectedNode.omissionsDetected > 0 ? 'SOP Delta Exceeded' : 'Zero Deviation'}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-panel">
                <div className="text-3xs font-mono text-soc-textMuted uppercase">Audit Digest</div>
                <div className="text-2xs font-bold font-mono text-soc-text mt-1 truncate">
                  {selectedNode.hash}
                </div>
                <div className="text-3xs font-mono text-soc-ok mt-0.5">SAKṢĪ #9904 Verified</div>
              </div>
            </div>

            {/* Architectural Engine Summary */}
            <div className="p-3 rounded-lg border border-soc-border bg-soc-panel/80 text-2xs font-mono text-soc-textSecondary leading-relaxed">
              <span className="text-soc-text font-bold uppercase">{selectedNode.name}</span> executes
              deterministic offline verification against standard operating procedure DAGs. Any omitted
              isolation step or premature case closure generates a cryptographic non-compliance finding.
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 mt-4 border-t border-soc-border flex items-center justify-between gap-3">
            <span className="text-3xs font-mono text-soc-textMuted">
              MODEL: {selectedNode.category}
            </span>

            <button
              type="button"
              onClick={() => {
                const elem = document.getElementById('infographic-window-section');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                onSelectNode?.(selectedNode);
              }}
              className="btn-primary font-mono text-2xs font-semibold flex items-center gap-1.5"
            >
              <span>EXPLORE {selectedNode.name} MODEL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
