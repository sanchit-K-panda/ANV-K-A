'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Clock, ShieldCheck, Activity } from 'lucide-react';
import { AirGapDrawer } from './AirGapDrawer';

export const Topbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [secondsToRenewal, setSecondsToRenewal] = useState(868);
  const [lastEvaluatedSec, setLastEvaluatedSec] = useState(18);
  const [utcTime, setUtcTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    const renewTimer = setInterval(() => {
      setSecondsToRenewal((prev) => (prev > 10 ? prev - 1 : 900));
      setLastEvaluatedSec((prev) => (prev < 60 ? prev + 1 : 12));
    }, 1000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(renewTimer);
    };
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
      <header className="h-12 bg-white border-b border-slate-200 px-5 flex items-center justify-between sticky top-0 z-20 font-mono text-xs select-none shadow-xs">
        {/* Left: Product & Enclave Scope */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-wider text-xs">ANVĪKṢA</span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              SOC-04
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Air-gap Indicator */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 text-[11px] text-slate-700 hover:text-slate-900 transition-colors"
            title="Inspect Air-Gap Security Manifest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold">LOCAL / AIR-GAPPED</span>
          </button>
        </div>

        {/* Center: Live Evaluation Pulse */}
        <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">MEDHĀ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-800 font-medium">LIVE</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Last evaluated: {lastEvaluatedSec}s ago</span>
        </div>

        {/* Right: Supervisor Credentials & Controls */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="hidden lg:flex items-center gap-2 text-slate-600">
            <span>Supervisor: <strong className="text-slate-900 font-semibold">Dr. A. Sharma</strong></span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium font-mono">DEV-21 (TRUSTED)</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden lg:block" />

          {/* Ephemeral Session Timer */}
          <div className="flex items-center gap-1 text-[11px] text-slate-700" title="KṢAṆA 15-Minute Rotating Token">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 font-mono">KṢAṆA:</span>
            <span className="font-bold font-mono text-slate-900">{formatTimer(secondsToRenewal)}</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden xl:block" />

          {/* UTC Clock */}
          <div className="hidden xl:block text-[11px] text-slate-400 font-mono">
            {utcTime}
          </div>

          {/* Lock Session Action */}
          <button
            onClick={handleLockSession}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Lock Supervisory Session"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <AirGapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
