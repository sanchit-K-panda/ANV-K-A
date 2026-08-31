'use client';

import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock, Network } from 'lucide-react';

export const AirGapArchitecture: React.FC = () => {
  const nodes = [
    { title: 'SOC Data Sources', desc: 'Syslog, EDR agents, and NetFlow streams ingested through local boundary pipe.', metric: 'Local Only', icon: HardDrive },
    { title: 'ANVĪKṢA ML Engines', desc: 'On-device CPU/GPU executing Isolation Forest & statistical deviation scoring.', metric: '0 Cloud Calls', icon: Cpu },
    { title: 'Local State Store', desc: 'On-workstation SQLite/Parquet encrypted with AES-256-GCM enclave keys.', metric: 'Encrypted', icon: Lock },
    { title: 'External Egress Gate', desc: 'Physical NIC isolation with 0 B/s external network egress.', metric: 'DISABLED ✕', icon: Network, isEgress: true },
  ];

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Air-Gap Enclave Isolation Architecture
          </h3>
        </div>
        <span className="text-[10.5px] text-slate-500">SOVEREIGN AIR-GAP</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.title}
              className={`p-3.5 rounded border space-y-1.5 ${
                node.isEgress ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${node.isEgress ? 'text-rose-600' : 'text-slate-700'}`} />
                <span
                  className={`text-[10.5px] font-bold font-mono px-2 py-0.2 rounded ${
                    node.isEgress
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {node.metric}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 font-sans">{node.title}</div>
              <p className="text-[11px] font-sans text-slate-600 leading-snug">{node.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
