'use client';

import React from 'react';

export const SocLifecycleFlow: React.FC = () => {
  const lifecycle = [
    { stage: 'Alert', expected: '100% Ingested', actual: '100% Ingested', pass: true },
    { stage: 'Triage', expected: 'Classification in <2m', actual: 'Classified in 16s', pass: true },
    { stage: 'Investigation', expected: '85% Forensic Memory Check', actual: '11% Checked (74% Drop)', pass: false },
    { stage: 'Escalation', expected: '30% Tier-2 Route', actual: '7% Routed (Bypassed)', pass: false },
    { stage: 'Response', expected: 'Host Isolation in <5m', actual: 'Partial (No Host Isolation)', pass: false },
    { stage: 'Resolution', expected: 'Human Verification', actual: 'Rapid False-Positive Claim', pass: false },
  ];

  return (
    <div className="soc-panel space-y-3 p-5 font-mono select-none">
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <h3 className="panel-label">SOC Lifecycle Infographic: Expected vs Observed Path</h3>
        <span className="text-2xs uppercase tracking-[0.14em] text-soc-textDim">End-to-End Audit</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {lifecycle.map((item) => (
          <div
            key={item.stage}
            className={`space-y-1.5 rounded-md border p-3 ${
              item.pass ? 'border-soc-border bg-soc-overlay' : 'border-soc-crit/40 bg-soc-critDim/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold text-soc-text">{item.stage}</span>
              {item.pass ? (
                <span
                  className="flex h-4 w-4 items-center justify-center border border-soc-ok/40 text-2xs font-bold text-soc-ok"
                  aria-label="Expected behavior observed"
                >
                  ✓
                </span>
              ) : (
                <span
                  className="flex h-4 w-4 items-center justify-center border border-soc-crit/40 text-2xs font-bold text-soc-crit"
                  aria-label="Expected behavior not observed"
                >
                  ✕
                </span>
              )}
            </div>
            <div className="text-2xs text-soc-textMuted">
              Expected: <strong className="font-mono font-medium text-soc-textSecondary">{item.expected}</strong>
            </div>
            <div className={`text-[10.5px] font-bold ${item.pass ? 'text-soc-ok' : 'text-soc-crit'}`}>{item.actual}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
