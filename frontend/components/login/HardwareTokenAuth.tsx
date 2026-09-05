'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Cpu,
  ShieldCheck,
  Usb,
  Fingerprint,
  Radio,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';

interface HardwareTokenAuthProps {
  deviceId: string;
  station: string;
  authStage: 'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED';
  onAuthenticate: (pin: string) => void;
}

export function HardwareTokenAuth({
  deviceId,
  station,
  authStage,
  onAuthenticate,
}: HardwareTokenAuthProps) {
  const [pin, setPin] = useState<string>('729401');
  const [tokenPresent, setTokenPresent] = useState<boolean>(true);
  const [touchRequired, setTouchRequired] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* TPM Hardware Diagnostics Block */}
      <div className="p-4 bg-[#070A10] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 tracking-wider uppercase text-2xs">
              BANDHA Hardware Cryptoprocessor
            </span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded text-[9.5px] font-bold">
            TPM 2.0 ATTESTED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
          <div className="p-2 bg-[#0E1424] rounded border border-slate-800">
            <div className="text-slate-500 text-2xs">PCR-7 Binding:</div>
            <div className="text-cyan-400 font-bold truncate">SECURE_BOOT_ENCLAVE</div>
          </div>
          <div className="p-2 bg-[#0E1424] rounded border border-slate-800">
            <div className="text-slate-500 text-2xs">Hardware Token:</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Usb className="w-3 h-3" />
              <span>YubiKey FIPS 5.4</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-2xs text-slate-400">
          <div className="flex justify-between">
            <span className="text-slate-500">Device ID:</span>
            <span className="text-slate-200 font-semibold">{deviceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Authorized Console:</span>
            <span className="text-slate-200 font-semibold">{station}</span>
          </div>
        </div>
      </div>

      {/* PIN & Touchpad Authentication */}
      <div className="p-4 bg-[#070A10] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-slate-400 text-2xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Hardware Token Security PIN:</span>
          </label>
          <span className="text-2xs text-slate-500 font-sans">6-digit Enclave PIN</span>
        </div>

        {/* PIN Display Field */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex justify-center gap-2 py-2 px-3 bg-[#0E1424] border border-slate-700/80 rounded-lg">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const hasDigit = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                    hasDigit
                      ? 'bg-cyan-400 border-cyan-300 shadow-sm shadow-cyan-400/50'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-2xs border border-slate-700 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEV', '0', '⌫'].map((k) => {
            if (k === 'DEV') {
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPin('729401')}
                  className="p-2 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 text-cyan-400 rounded-lg text-2xs font-bold transition-all"
                  title="Autofill Verified TPM PIN"
                >
                  AUTO-PIN
                </button>
              );
            }
            if (k === '⌫') {
              return (
                <button
                  key={k}
                  type="button"
                  onClick={handleBackspace}
                  className="p-2 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleDigit(k)}
                disabled={authStage === 'SCANNING'}
                className="p-2.5 bg-[#0E1424] hover:bg-slate-800 border border-slate-800 text-slate-100 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
