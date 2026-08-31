'use client';

import React from 'react';
import { Settings, Shield, Lock, KeyRound, Database, Sliders, Users } from 'lucide-react';

export default function AdminPage() {
  const sections = [
    { title: 'Users & Roles', desc: 'Manage supervisor and analyst RBAC permissions', icon: Users },
    { title: 'Device & Session Binding (BANDHA)', desc: 'Configure hardware-bound public key enclaves', icon: Shield },
    { title: 'Biometric Security (DARŚANA & NETRA-3D)', desc: 'Tune facial liveness confidence thresholds', icon: Lock },
    { title: 'KṢAṆA Ephemeral Token Policy', desc: 'Set credential rotation dwell periods (current: 900s)', icon: KeyRound },
    { title: 'SOC Ingestion Connectors (SAṄGRAHA)', desc: 'Local air-gapped syslog, JSON, and PCAP parsers', icon: Database },
    { title: 'Supervisory Detection Rules (PARĪKṢA)', desc: 'Configure statistical baseline standard deviations', icon: Sliders },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              SYSTEM
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Administration & Policy
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
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
              className="p-4 bg-[#0C0E12] border border-[#232732] hover:border-white transition-colors space-y-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-[#060709] border border-[#232732] flex items-center justify-center text-white">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white font-sans">{sec.title}</h2>
                <p className="text-[10px] text-[#848B98] mt-0.5">{sec.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
