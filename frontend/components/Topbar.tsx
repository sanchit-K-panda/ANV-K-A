'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Clock,
  Shield,
  Activity,
} from 'lucide-react';
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
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 font-mono text-xs select-none shadow-xs">
        {/* Left: Product & Air-gap Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-wider text-xs">ANVĪKṢA</span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              SOC-04
            </span>
          </div>

          {/* Air-Gap Status Pill */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-[10.5px] rounded-full transition-colors font-medium"
            title="Inspect Sovereign Air-Gap Hardware & Enclave Security"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>LOCAL / AIR-GAPPED</span>
          </button>

          {/* Engine State */}
          <div className="hidden md:flex items-center gap-1.5 text-[10.5px] text-slate-500 pl-3 border-l border-slate-200">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>MEDHĀ LIVE:</span>
            <span className="text-slate-800 font-medium">evaluated {lastEvaluatedSec}s ago</span>
          </div>
        </div>

        {/* Right: Supervisor & Ephemeral Credential */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="hidden sm:flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            <span>Supervisor: <strong className="text-slate-900 font-semibold">Dr. A. Sharma</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium font-mono">DEV-21 (TRUSTED)</span>
          </div>

          {/* Ephemeral Credential Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[10.5px] rounded-xl">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500 font-mono">KṢAṆA:</span>
            <span className="font-bold font-mono">{formatTimer(secondsToRenewal)}</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden xl:block text-[10.5px] text-slate-400 font-mono">
            {utcTime}
          </div>

          {/* Lock Session */}
          <button
            onClick={handleLockSession}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            title="Lock Session"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <AirGapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
