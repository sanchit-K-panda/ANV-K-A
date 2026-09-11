'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'lucide-react';
import { SocLock, SocClock, SocShieldCheck, SocSearch } from '@/components/icons';
import { AirGapDrawer } from './AirGapDrawer';
import { ThemeToggle } from './ThemeToggle';

export const Topbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [secondsToRenewal, setSecondsToRenewal] = useState(868);
  const router = useRouter();

  useEffect(() => {
    const renewTimer = setInterval(() => {
      setSecondsToRenewal((prev) => (prev > 10 ? prev - 1 : 900));
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
        {/* Left: Scope + Air-gap Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-soc-border bg-soc-raised/50 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-soc-accent" />
            <span className="font-mono text-xs font-semibold text-soc-text">SOC-04</span>
            <span className="text-3xs font-mono text-soc-textMuted hidden sm:inline">PROD</span>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-soc-ok/30 bg-soc-ok/5 text-soc-ok text-xs transition-colors hover:bg-soc-ok/10"
            title="Inspect Air-Gap Hardware Security Manifest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" />
            <span className="font-mono text-3xs font-semibold hidden sm:inline uppercase">
              Air-Gapped (0 B/s)
            </span>
          </button>
        </div>

        {/* Center: Command Search */}
        <div className="hidden md:block flex-1 max-w-sm">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded border border-soc-border bg-soc-bg text-left text-xs text-soc-textMuted hover:border-soc-borderStrong hover:text-soc-text transition-colors"
            onClick={() => router.push('/findings')}
          >
            <SocSearch className="w-3.5 h-3.5 text-soc-textMuted flex-shrink-0" />
            <span className="flex-1 text-2xs truncate font-sans">Search findings, alerts, evidence...</span>
            <span className="flex items-center gap-0.5 text-3xs font-mono text-soc-textMuted border border-soc-border rounded px-1.5 py-0.5 bg-soc-raised">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </button>
        </div>

        {/* Right: Operator, Session, Theme, Lock */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden lg:flex items-center gap-2 pr-1">
            <div className="text-right leading-tight">
              <div className="text-xs font-medium text-soc-text">Dr. A. Sharma</div>
              <div className="text-3xs font-mono text-soc-ok flex items-center justify-end gap-1">
                <SocShieldCheck className="w-3 h-3 text-soc-ok" />
                VERIFIED
              </div>
            </div>
            <div className="w-6 h-6 rounded bg-soc-raised border border-soc-border text-soc-text font-mono font-medium flex items-center justify-center text-xs">
              AS
            </div>
          </div>

          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-soc-border bg-soc-raised/40 text-soc-textMuted text-xs"
            title="Session Renewal Timer"
          >
            <SocClock className="w-3 h-3 text-soc-textMuted" />
            <span className="font-mono text-xs font-medium tabular-nums text-soc-text">{formatTimer(secondsToRenewal)}</span>
          </div>

          <ThemeToggle />

          <button
            type="button"
            onClick={handleLockSession}
            className="p-1.5 text-soc-textMuted hover:text-soc-crit hover:bg-soc-raised rounded transition-colors"
            title="Lock Session"
            aria-label="Lock Session"
          >
            <SocLock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <AirGapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
