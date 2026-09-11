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
    <div className="soc-panel space-y-3 p-5 font-mono select-none">
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
          <h3 className="panel-label">KAVACA Zero-Trust Session Enclave Architecture</h3>
        </div>
        <span className="text-2xs uppercase tracking-[0.14em] text-soc-textDim">Continuous Trust Protocol</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {flow.map((step) => {
          const Icon = step.icon;
          const isRotating = step.status === 'ROTATING';
          return (
            <div key={step.title} className="space-y-1.5 rounded-md border border-soc-border bg-soc-overlay p-3.5">
              <div className="flex items-center justify-between">
                <Icon className="h-3.5 w-3.5 text-soc-textMuted" aria-hidden="true" />
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-2xs font-bold uppercase tracking-[0.08em] ${
                    isRotating
                      ? 'border-soc-accent/35 bg-soc-accentDim text-soc-accent'
                      : 'border-soc-ok/30 bg-soc-okDim text-soc-ok'
                  }`}
                >
                  {step.status}
                </span>
              </div>
              <div className="font-sans text-xs font-bold text-soc-text">{step.title}</div>
              <div className="text-[10.5px] text-soc-textMuted">{step.subtitle}</div>
              <p className="pt-1 font-sans text-2xs leading-snug text-soc-textSecondary">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
