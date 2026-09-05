'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Shield, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';

interface TerminalLog {
  id: string;
  time: string;
  module: 'DARŚANA' | 'BANDHA' | 'KṢAṆA' | 'SAKṢĪ' | 'ENCLAVE' | 'AUDIT';
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
}

interface CryptoTerminalStreamProps {
  logs: TerminalLog[];
  authStage: 'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED';
}

export function CryptoTerminalStream({ logs, authStage }: CryptoTerminalStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getModuleBadge = (mod: TerminalLog['module']) => {
    switch (mod) {
      case 'DARŚANA':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40';
      case 'BANDHA':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40';
      case 'KṢAṆA':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
      case 'SAKṢĪ':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  const getTypeStyle = (type: TerminalLog['type']) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-emerald-300 font-semibold';
      case 'WARN':
        return 'text-amber-300 font-semibold';
      case 'ERROR':
        return 'text-rose-400 font-bold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-[#070A10] border border-slate-800 rounded-xl font-mono text-2xs overflow-hidden flex flex-col shadow-inner">
      {/* Terminal Title Bar */}
      <div className="px-3 py-2 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-300 font-bold tracking-wider text-2xs ml-1 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>KAVACA-ENCLAVE-KERNEL // LIVE PROTOCOL LOG</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-2xs">
          {authStage === 'SCANNING' && (
            <span className="flex items-center gap-1 text-cyan-400 animate-pulse">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>ACTIVE_STREAM</span>
            </span>
          )}
          {authStage === 'VERIFIED' && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>SEALED</span>
            </span>
          )}
          {authStage === 'DENIED' && (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              <span>DENIED</span>
            </span>
          )}
        </div>
      </div>

      {/* Log Output Stream */}
      <div
        ref={containerRef}
        className="p-3 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[10.5px] leading-relaxed select-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2">
            <span className="text-slate-600 text-[9.5px] shrink-0">{log.time}</span>
            <span
              className={`px-1.5 py-0.2 text-2xs rounded border font-semibold shrink-0 ${getModuleBadge(
                log.module
              )}`}
            >
              {log.module}
            </span>
            <span className={`break-all ${getTypeStyle(log.type)}`}>{log.message}</span>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-slate-600 italic py-2 text-center">
            Awaiting supervisor verification trigger...
          </div>
        )}
      </div>

      {/* Terminal Footer Indicator */}
      <div className="px-3 py-1.5 bg-[#0A0E18] border-t border-slate-800/80 flex items-center justify-between text-[9.5px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Local TPM PCR Quote: Verified</span>
        </span>
        <span className="text-slate-400">Argon2id (m=64MB, t=3, p=4)</span>
      </div>
    </div>
  );
}
