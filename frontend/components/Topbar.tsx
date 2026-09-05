'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Clock, ShieldCheck, Search, Command } from 'lucide-react';
import { AirGapDrawer } from './AirGapDrawer';
import { ThemeToggle } from './ThemeToggle';

export const Topbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [secondsToRenewal, setSecondsToRenewal] = useState(868);
  const [lastEvaluatedSec, setLastEvaluatedSec] = useState(18);
  const router = useRouter();

  useEffect(() => {
    const renewTimer = setInterval(() => {
      setSecondsToRenewal((prev) => (prev > 10 ? prev - 1 : 900));
      setLastEvaluatedSec((prev) => (prev < 60 ? prev + 1 : 12));
    }, 1000);
    return () => clearInterval(renewTimer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLockSession = () => {
    router.push('/login?locked=true');
  };

  return (
    <>
      <header className="h-12 flex-shrink-0 border-b border-soc-border bg-soc-panel px-4 flex items-center justify-between gap-4 select-none z-20">
        {/* Left: SOC scope + air-gap */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-soc-border bg-soc-raised/60 hover:bg-soc-raised transition-colors"
            title="Switch SOC scope"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-soc-accent" aria-hidden="true" />
            <span className="font-mono text-xs font-semibold text-soc-text">SOC-04</span>
            <span className="text-[10px] font-mono text-soc-textMuted hidden xl:inline">PROD_ENCLAVE</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs transition-colors hover:bg-emerald-500/20"
            title="Inspect Air-Gap Security Manifest"
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] font-semibold hidden sm:inline uppercase">LOCAL / AIR-GAPPED</span>
          </button>
        </div>

        {/* Center: Command search */}
        <div className="hidden md:block flex-1 max-w-sm">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2.5 py-1 rounded border border-soc-border bg-soc-bg text-left text-xs text-soc-textMuted hover:border-soc-borderStrong transition-colors"
            onClick={() => router.push('/findings')}
          >
            <Search className="w-3.5 h-3.5 text-soc-textMuted flex-shrink-0" />
            <span className="flex-1 text-[11px] truncate">Search findings, alerts, IOCs, forensic traces...</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-soc-textMuted border border-soc-border rounded px-1 py-0.2 bg-soc-panel">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </button>
        </div>

        {/* Right: identity, session, theme */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden xl:flex items-center gap-2 pr-1">
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-soc-text">Dr. A. Sharma</div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                DEV-21 TRUSTED
              </div>
            </div>
            <div className="w-7 h-7 rounded bg-soc-raised border border-soc-border text-soc-text flex items-center justify-center text-xs font-mono font-bold">
              AS
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded border border-soc-border bg-soc-raised/40" title="KṢAṆA 15-Minute Rotating Session Credential">
            <Clock className="w-3 h-3 text-soc-textMuted" />
            <span className="font-mono text-xs font-medium text-soc-text tabular-nums">{formatTimer(secondsToRenewal)}</span>
          </div>

          <ThemeToggle />

          <button
            onClick={handleLockSession}
            className="p-1.5 text-soc-textMuted hover:text-soc-crit hover:bg-soc-critDim rounded transition-colors"
            title="Lock Supervisory Session"
            aria-label="Lock Supervisory Session"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <AirGapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
