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
      <header className="h-16 flex-shrink-0 rounded-2xl border border-soc-border bg-soc-panel shadow-card px-4 flex items-center justify-between gap-4 select-none">
        {/* Left: SOC scope + air-gap */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-xl border border-soc-border bg-soc-overlay hover:bg-soc-raised transition-colors"
            title="Switch SOC scope"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-soc-accent" aria-hidden="true" />
            <span className="font-display text-xs font-bold text-soc-text tracking-wide">SOC-04</span>
            <span className="text-2xs text-soc-textMuted hidden xl:inline">Production Enclave</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-soc-okDim border border-soc-ok/25 text-xs text-soc-ok transition-all hover:shadow-sm"
            title="Inspect Air-Gap Security Manifest"
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soc-ok opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-soc-ok" />
            </span>
            <span className="font-medium hidden sm:inline">LOCAL / AIR-GAPPED</span>
          </button>
        </div>

        {/* Center: Command search */}
        <div className="hidden md:block flex-1 max-w-sm">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-soc-border bg-soc-overlay text-left text-xs text-soc-textDim hover:border-soc-borderStrong hover:bg-soc-raised transition-colors"
            onClick={() => router.push('/findings')}
          >
            <Search className="w-3.5 h-3.5 text-soc-textMuted" />
            <span className="flex-1">Search findings, alerts, cases...</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-soc-textMuted border border-soc-border rounded-md px-1.5 py-0.5 bg-soc-panel">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </button>
        </div>

        {/* Right: identity, session, theme */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden xl:flex items-center gap-2.5 pr-1">
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-soc-text">Dr. A. Sharma</div>
              <div className="text-[10px] font-mono text-soc-ok flex items-center justify-end gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                DEV-21 TRUSTED
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-soc-accent to-soc-accentBright text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
              AS
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-soc-border bg-soc-overlay" title="KṢAṆA 15-Minute Rotating Session Credential">
            <Clock className="w-3 h-3 text-soc-textMuted" />
            <span className="font-mono text-xs font-medium text-soc-text tabular-nums">{formatTimer(secondsToRenewal)}</span>
          </div>

          <ThemeToggle />

          <button
            onClick={handleLockSession}
            className="p-2 text-soc-textMuted hover:text-soc-crit hover:bg-soc-critDim rounded-xl transition-colors"
            title="Lock Supervisory Session"
            aria-label="Lock Supervisory Session"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      <AirGapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
