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
    { label: 'Database & State Store', value: 'LOCAL (SQLITE / PARQUET)' },
    { label: 'Authentication Provider', value: 'LOCAL (DARŚANA / BANDHA)' },
    { label: 'Cryptographic Audit', value: 'LOCAL (AKṢARA SHA-256)' },
    { label: 'External APIs / SaaS Telemetry', value: 'NONE (0 B/s EGRESS)' },
    { label: 'Physical Security Node', value: 'SEC-WS-092-AIRGAP' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 font-mono text-xs">
      <div className="w-full max-w-md bg-[#060709] border-l border-[#232732] h-full flex flex-col justify-between p-5 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#232732] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                SOVEREIGN AIR-GAP ASSURANCE MANIFEST
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#848B98] hover:text-white border border-[#232732] hover:bg-[#14171E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[#9CA3AF] font-sans leading-relaxed">
            ANVĪKṢA operates in strict offline sovereign mode. All supervisory ML inferences, behavioural baselines, and audit hash-chains execute locally on this workstation without external network connectivity.
          </p>

          <div className="border border-[#232732] divide-y divide-[#232732] text-[11px]">
            {manifestItems.map((item) => (
              <div key={item.label} className="flex justify-between p-2.5 bg-[#0C0E12]">
                <span className="text-[#848B98]">{item.label}:</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0C0E12] border border-[#232732] space-y-1.5 text-[10px]">
            <div className="text-[#656C7A] uppercase font-bold">AKṢARA GENESIS PROOF:</div>
            <div className="text-[#9CA3AF] break-all">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#232732] flex justify-between items-center text-[10px] text-[#656C7A]">
          <span>COMPLIANCE: NIST 800-53 / ISO 27001</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white text-black font-bold border border-white hover:bg-[#E5E7EB]"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
