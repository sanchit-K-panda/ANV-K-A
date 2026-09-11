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
    <div className="soc-panel select-none h-full flex flex-col bg-soc-panel">
      {/* Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-md bg-soc-ok/10 border border-soc-ok/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-soc-ok" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <span className="panel-label">SAKṢĪ CRYPTO LEDGER</span>
            <p className="text-2xs font-mono text-soc-textMuted mt-0.5">Merkle Proof · Local SHA-256 Chain</p>
          </div>
        </div>
        <Link href="/audit" className="text-xs font-mono text-soc-accent hover:text-soc-accentBright font-semibold transition-colors whitespace-nowrap">
          EXPLORER →
        </Link>
      </div>

      {/* Vertical chain — each block links to the previous via the connector rail */}
      <div className="relative flex-1 px-4 py-4">
        <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-soc-ok/30" aria-hidden="true" />
        <div className="space-y-4">
          {RECENT_BLOCKS.map((block) => (
            <div key={block.height} className="relative flex gap-3">
              {/* Node */}
              <span className="relative z-10 mt-0.5 w-4 h-4 rounded-full bg-soc-panel border-2 border-soc-ok flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-soc-ok font-bold" strokeWidth={3.5} aria-hidden="true" />
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1 p-2 rounded bg-soc-overlay border border-soc-border">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-soc-text font-mono truncate">
                    {block.action}
                  </span>
                  <span className="font-mono text-2xs text-soc-ok font-bold flex-shrink-0 tabular-nums">
                    BLOCK #{block.height}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-2xs font-mono text-soc-textMuted mt-0.5">
                  <span className="truncate text-soc-textSecondary font-semibold">{block.actor}</span>
                  <span className="text-soc-textDim">·</span>
                  <span className="tabular-nums flex-shrink-0">{block.timestamp}</span>
                </div>
                <div className="font-mono text-2xs text-soc-accent font-semibold mt-1 truncate bg-soc-raised px-1.5 py-0.5 rounded border border-soc-border">
                  HASH: {block.hash}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer seal */}
      <div className="px-4 py-2.5 border-t border-soc-border bg-soc-ok/5 flex items-center justify-between text-2xs font-mono text-soc-ok">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" />
          GENESIS ROOT VERIFIED
        </span>
        <span className="text-soc-textMuted text-[10px]">0 TAMPER ATTEMPTS</span>
      </div>
    </div>
  );
}
