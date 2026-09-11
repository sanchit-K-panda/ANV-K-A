'use client';

import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock, Network } from 'lucide-react';

interface AirGapNode {
  title: string;
  desc: string;
  metric: string;
  icon: React.ElementType;
  isEgress?: boolean;
}

export const AirGapArchitecture: React.FC = () => {
  const nodes: AirGapNode[] = [
    { title: 'SOC Data Sources', desc: 'Syslog, EDR agents, and NetFlow streams ingested through local boundary pipe.', metric: 'Local Only', icon: HardDrive },
    { title: 'ANVĪKṢA ML Engines', desc: 'On-device CPU/GPU executing Isolation Forest & statistical deviation scoring.', metric: '0 Cloud Calls', icon: Cpu },
    { title: 'Local State Store', desc: 'On-workstation SQLite/Parquet encrypted with AES-256-GCM enclave keys.', metric: 'Encrypted', icon: Lock },
    { title: 'External Egress Gate', desc: 'Physical NIC isolation with 0 B/s external network egress.', metric: 'DISABLED ✕', icon: Network, isEgress: true },
  ];

  const localNodes = nodes.filter((n) => !n.isEgress);
  const egressNode = nodes.find((n) => n.isEgress);

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
          <h3 className="panel-label">Air-Gap Enclave Isolation Architecture</h3>
        </div>
        <span className="text-2xs uppercase tracking-[0.14em] text-soc-textDim">Sovereign Air-Gap</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Local enclave: sealed boundary containing the local data path */}
        <div className="relative rounded-md border border-dashed border-soc-borderStrong p-3 pt-4 lg:col-span-3">
          <span className="absolute -top-[6px] left-3 bg-soc-panel px-1.5 text-2xs uppercase tracking-[0.14em] text-soc-textDim">
            Air-Gap Enclave Boundary
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {localNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.title} className="space-y-1.5 rounded-md border border-soc-border bg-soc-overlay p-3">
                  <div className="flex items-center justify-between">
                    <Icon className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
                    <span className="rounded-md border border-soc-ok/30 bg-soc-okDim px-1.5 py-px text-2xs font-bold uppercase tracking-[0.08em] text-soc-ok">
                      {node.metric}
                    </span>
                  </div>
                  <div className="text-2xs font-bold text-soc-text">{node.title}</div>
                  <p className="font-sans text-2xs leading-snug text-soc-textSecondary">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Egress gate: severed external link */}
        <div className="flex flex-col">
          <div className="hidden items-center gap-2 pb-2 lg:flex" aria-hidden="true">
            <span className="h-px w-4 bg-soc-border" />
            <span className="text-2xs font-bold text-soc-crit">✕</span>
            <span className="h-px flex-1 bg-soc-border" />
          </div>
          {egressNode && (
            <div className="flex-1 space-y-1.5 rounded-md border border-soc-crit/40 bg-soc-critDim/60 p-3">
              <div className="flex items-center justify-between">
                <Network className="h-3.5 w-3.5 text-soc-crit" aria-hidden="true" />
                <span className="rounded-md border border-soc-crit/35 bg-soc-critDim px-1.5 py-px text-2xs font-bold uppercase tracking-[0.08em] text-soc-crit">
                  {egressNode.metric}
                </span>
              </div>
              <div className="text-2xs font-bold text-soc-text">{egressNode.title}</div>
              <p className="font-sans text-2xs leading-snug text-soc-textSecondary">{egressNode.desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
