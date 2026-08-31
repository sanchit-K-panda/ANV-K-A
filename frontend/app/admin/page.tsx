'use client';

import React from 'react';
import { Settings, Shield, Lock, KeyRound, Database, Sliders, Users } from 'lucide-react';

export default function AdminPage() {
  const sections = [
    { title: 'Users & RBAC Roles', desc: 'Manage supervisor and analyst clearance permissions', icon: Users },
    { title: 'Device & TPM Binding (BANDHA)', desc: 'Configure hardware-bound public key enclaves', icon: Shield },
    { title: 'Biometric Security (DARŚANA)', desc: 'Tune facial liveness confidence thresholds', icon: Lock },
    { title: 'KṢAṆA Ephemeral Token Policy', desc: 'Set credential rotation dwell periods (current: 900s)', icon: KeyRound },
    { title: 'SOC Ingestion Connectors (SAṄGRAHA)', desc: 'Local air-gapped syslog, JSON, and PCAP parsers', icon: Database },
    { title: 'Supervisory Detection Rules (PARĪKṢA)', desc: 'Configure statistical baseline standard deviations', icon: Sliders },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Administration &amp; Enclave Policy
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              SYSTEM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Local security policies, biometric hardware thresholds, and offline ingestion configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              className="soc-panel p-5 hover:border-slate-300 transition-colors space-y-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 font-sans">{sec.title}</h2>
                <p className="text-[11px] text-slate-500 mt-1 font-sans leading-normal">{sec.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
