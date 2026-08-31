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
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 font-mono select-none shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider">
            SAKṢĪ Tamper-Evident Hash Ledger
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold rounded-full">
            ● CHAIN INTEGRITY VERIFIED
          </span>
          <Link href="/audit" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Audit Explorer →
          </Link>
        </div>
      </div>

      {/* Blocks Grid with Soft Rounded Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {RECENT_BLOCKS.map((block) => (
          <div
            key={block.height}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 hover:bg-slate-100/70 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-900 rounded-md shadow-xs">
                BLOCK #{block.height}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> VERIFIED
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 truncate font-sans">
              {block.action}
            </div>

            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Actor:</span>
                <span className="text-slate-900 font-mono font-medium">{block.actor}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-500">{block.timestamp}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                <span className="text-slate-400">Digest:</span>
                <span className="text-slate-700 font-mono font-medium">{block.hash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
