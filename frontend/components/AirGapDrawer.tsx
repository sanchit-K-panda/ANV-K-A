'use client';

import React from 'react';
import { X, ShieldCheck, HardDrive, Cpu, Terminal, CheckCircle2, Lock } from 'lucide-react';

interface AirGapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AirGapDrawer: React.FC<AirGapDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const manifestItems = [
    { label: 'Runtime Mode', value: 'AIR-GAPPED' },
    { label: 'Internet Connectivity', value: 'DISABLED' },
    { label: 'AI Inference Engine', value: 'LOCAL (ON-DEVICE CPU/GPU)' },
    { label: 'Database & State Store', value: 'LOCAL (POSTGRES / SQLALCHEMY)' },
    { label: 'Authentication Provider', value: 'LOCAL (DARŚANA / BANDHA)' },
    { label: 'Cryptographic Audit', value: 'LOCAL (AKṢARA SHA-256)' },
    { label: 'External APIs / Telemetry', value: 'NONE (0 B/s EGRESS)' },
    { label: 'Physical Security Node', value: 'SEC-WS-092-AIRGAP' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs font-mono text-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between p-6 space-y-6 shadow-2xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Air-Gap Assurance Manifest
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            ANVĪKṢA operates in strict offline sovereign mode. All supervisory ML inferences, behavioural baselines, and audit hash-chains execute locally on this workstation without external network connectivity.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-[11px] shadow-xs">
            {manifestItems.map((item) => (
              <div key={item.label} className="flex justify-between p-3 bg-slate-50/50">
                <span className="text-slate-500">{item.label}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
            <div className="text-slate-400 uppercase font-bold text-[10px]">AKṢARA GENESIS PROOF:</div>
            <div className="text-slate-700 break-all font-mono">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10.5px] text-slate-400">
          <span>NIST 800-53 / ISO 27001</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
