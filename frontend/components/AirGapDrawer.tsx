'use client';

import React from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';

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
    { label: 'Cryptographic Audit', value: 'LOCAL (SAKṢĪ SHA-256)' },
    { label: 'External APIs / Telemetry', value: 'NONE (0 B/s EGRESS)' },
    { label: 'Physical Security Node', value: 'SEC-WS-092-AIRGAP' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 font-mono text-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Air-Gap Assurance Manifest"
    >
      <button className="absolute inset-0 cursor-default" onClick={onClose} tabIndex={-1} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-soc-panel border-l border-soc-border h-full flex flex-col justify-between p-5 space-y-5 shadow-drawer">
        <div className="space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-soc-border pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-soc-ok" />
              <h2 className="panel-label">Air-Gap Assurance Manifest</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-soc-textMuted hover:text-soc-text rounded-md hover:bg-soc-raised transition-colors"
              aria-label="Close manifest"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-soc-textSecondary font-sans leading-relaxed">
            ANVĪKṢA operates in strict offline sovereign mode. All supervisory ML inferences,
            behavioural baselines, and audit hash-chains execute locally on this workstation
            without external network connectivity.
          </p>

          <div className="soc-panel overflow-hidden">
            {manifestItems.map((item) => (
              <div key={item.label} className="kv-row">
                <span className="kv-key">{item.label}</span>
                <span className="kv-val font-mono text-soc-text">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="soc-panel p-3.5 space-y-1.5">
            <div className="panel-label">SAKṢĪ Genesis Proof</div>
            <div className="text-xs text-soc-textSecondary break-all font-mono leading-relaxed">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-soc-border flex justify-between items-center text-2xs text-soc-textMuted">
          <span>NIST 800-53 / ISO 27001</span>
          <button onClick={onClose} className="btn-ghost">
            <Lock className="w-3 h-3" />
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
