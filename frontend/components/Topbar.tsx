'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  RefreshCw,
  Clock,
  Shield,
  KeyRound,
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
      <header className="h-10 bg-[#060709] border-b border-[#1D212B] px-4 flex items-center justify-between sticky top-0 z-20 font-mono text-xs select-none">
        {/* Left: Product, Scope & Air-Gap Assurance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-widest text-xs">ANVĪKṢA</span>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[11px] text-white font-semibold">SOC-04</span>
          </div>

          {/* Air-Gap Status Pill */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0C0E12] border border-[#2A303E] hover:border-[#4B5563] text-white text-[10px] tracking-wide transition-colors"
            title="Inspect Sovereign Air-Gap Hardware & Enclave Security"
          >
            <span className="w-1.5 h-1.5 bg-white inline-block" />
            <span>LOCAL / AIR-GAPPED</span>
          </button>

          {/* Passive MEDHĀ Live Engine State */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-[#848B98] pl-2 border-l border-[#1D212B]">
            <span className="w-1.5 h-1.5 bg-white inline-block opacity-80" />
            <span>MEDHĀ LIVE:</span>
            <span className="text-white">evaluated {lastEvaluatedSec}s ago</span>
          </div>
        </div>

        {/* Right: Grouped Supervisor Enclave & Token Info */}
        <div className="flex items-center gap-3 text-[11px]">
          {/* Supervisor Identity + Device Trust Group */}
          <div className="hidden sm:flex items-center gap-2 text-[#9CA3AF]">
            <span>Supervisor: <strong className="text-white font-normal">A. Sharma</strong></span>
            <span className="text-[#374151]">|</span>
            <span>DEV-21 <strong className="text-white font-normal">(TRUSTED)</strong></span>
            <span className="text-[#374151]">|</span>
            <span className="text-white">Session Active</span>
          </div>

          {/* Rotating KṢAṆA Credential Timer */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#0C0E12] border border-[#232732] text-white text-[10px]">
            <span className="text-[#656C7A]">KṢAṆA:</span>
            <span className="font-bold">{formatTimer(secondsToRenewal)}</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden xl:block text-[10px] text-[#656C7A]">
            {utcTime}
          </div>

          {/* Emergency Lock Session */}
          <button
            onClick={handleLockSession}
            className="p-1 bg-[#0C0E12] border border-[#232732] hover:bg-[#14171E] text-[#9CA3AF] hover:text-white transition-colors"
            title="Lock Session (DARŚANA Re-Authentication Required)"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Air Gap Drawer */}
      <AirGapDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
