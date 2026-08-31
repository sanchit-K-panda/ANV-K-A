'use client';

import React from 'react';
import { Lock, ShieldCheck, Cpu, KeyRound, Eye, FileCheck } from 'lucide-react';

export const SecureSessionEnclave: React.FC = () => {
  const flow = [
    { title: '1. Identity Proof', subtitle: 'DARŚANA Biometrics', desc: 'On-device facial vector template matched with 99.4% confidence (0 server storage).', icon: Eye, status: 'VERIFIED' },
    { title: '2. Device TPM Binding', subtitle: 'BANDHA Security', desc: 'Hardware-backed TPM 2.0 enclave signature validated on DEV-21 workstation.', icon: Cpu, status: 'TRUSTED' },
    { title: '3. Ephemeral Session', subtitle: 'KṢAṆA 900s Token', desc: '15-minute rotating credential minted locally inside kernel memory space.', icon: KeyRound, status: 'ROTATING' },
    { title: '4. Action Audit Chain', subtitle: 'SAKṢĪ Ledger', desc: 'All supervisor decisions cryptographically signed to append-only SHA-256 block ledger.', icon: FileCheck, status: 'CHAINED' },
  ];

  return (
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            KAVACA Zero-Trust Session Enclave Architecture
          </h3>
        </div>
        <span className="text-[10.5px] text-slate-500">CONTINUOUS TRUST PROTOCOL</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {flow.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 text-slate-700" />
                <span className="badge-verified">{step.status}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 font-sans">{step.title}</div>
              <div className="text-[10.5px] text-slate-500 font-mono">{step.subtitle}</div>
              <p className="text-[11px] font-sans text-slate-600 pt-1 leading-snug">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
