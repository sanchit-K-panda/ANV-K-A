'use client';

import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';

interface BlockItem {
  height: number;
  hash: string;
  prevHash: string;
  timestamp: string;
  actor: string;
  action: string;
  status: 'VERIFIED' | 'TAMPERED';
}

const RECENT_BLOCKS: BlockItem[] = [
  {
    height: 9903,
    hash: '3f8a92b...e41c',
    prevHash: '7a1c09d...882a',
    timestamp: '09:20:14 UTC',
    actor: 'Dr. A. Sharma',
    action: 'DARŚANA_AUTHENTICATE',
    status: 'VERIFIED',
  },
  {
    height: 9904,
    hash: '9e2b104...77fa',
    prevHash: '3f8a92b...e41c',
    timestamp: '09:30:12 UTC',
    actor: 'VIVEKA Engine',
    action: 'FINDING_DETECTED (FND-EXEC-001)',
    status: 'VERIFIED',
  },
  {
    height: 9905,
    hash: 'b148fa7...cc90',
    prevHash: '9e2b104...77fa',
    timestamp: '10:34:22 UTC',
    actor: 'Dr. A. Sharma',
    action: 'SUPERVISOR_ACTION_DISPATCH',
    status: 'VERIFIED',
  },
];

export function HashChainLedger() {
  return (
    <div className="soc-panel select-none h-full flex flex-col">
      {/* Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-soc-okDim flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-soc-ok" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <span className="panel-label">SAKṢĪ Hash Ledger</span>
            <p className="text-2xs text-soc-textMuted mt-0.5">Tamper-evident · append-only</p>
          </div>
        </div>
        <Link href="/audit" className="text-xs text-soc-accent hover:text-soc-accentBright font-medium transition-colors whitespace-nowrap">
          Explorer →
        </Link>
      </div>

      {/* Vertical chain — each block links to the previous via the connector rail */}
      <div className="relative flex-1 px-5 py-4">
        <div className="absolute left-[30px] top-7 bottom-7 w-px bg-soc-border" aria-hidden="true" />
        <div className="space-y-4">
          {RECENT_BLOCKS.map((block) => (
            <div key={block.height} className="relative flex gap-3.5">
              {/* Node */}
              <span className="relative z-10 mt-0.5 w-4 h-4 rounded-full bg-soc-panel border-2 border-soc-ok flex items-center justify-center flex-shrink-0">
                <Check className="w-2 h-2 text-soc-ok" strokeWidth={3.5} aria-hidden="true" />
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-soc-text truncate">
                    {block.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span className="font-mono text-2xs text-soc-textMuted flex-shrink-0 tabular-nums">
                    #{block.height}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-2xs text-soc-textMuted mt-0.5">
                  <span className="truncate">{block.actor}</span>
                  <span className="text-soc-textDim">·</span>
                  <span className="font-mono tabular-nums flex-shrink-0">{block.timestamp.replace(' UTC', '')}</span>
                </div>
                <div className="font-mono text-2xs text-soc-textDim mt-1 truncate">
                  {block.hash}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-soc-border flex items-center justify-between">
        <span className="soc-badge badge-ok">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" aria-hidden="true" />
          Chain integrity verified
        </span>
        <span className="font-mono text-2xs text-soc-textDim">SHA-256</span>
      </div>
    </div>
  );
}
