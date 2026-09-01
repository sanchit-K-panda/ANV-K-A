'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Server,
  Lock,
  ArrowRight,
  UserCheck,
  EyeOff,
  Cpu,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Search,
  KeyRound,
  Fingerprint,
  Radio,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { BiometricHUD } from '@/components/BiometricHUD';

interface SupervisorProfile {
  id: string;
  name: string;
  role: string;
  clearance: string;
  station: string;
  deviceId: string;
}

const DEMO_PROFILES: SupervisorProfile[] = [
  {
    id: 'a_sharma_supervisor',
    name: 'Dr. A. Sharma',
    role: 'Chief SOC Supervisor',
    clearance: 'LEVEL-4 (EXECUTIVE)',
    station: 'STATION-01-SECURE',
    deviceId: 'DEV-21-FEDORA-TPM',
  },
  {
    id: 'v_raman_auditor',
    name: 'V. Raman',
    role: 'Compliance & Integrity Auditor',
    clearance: 'LEVEL-3 (AUDIT)',
    station: 'AUDIT-CONSOLE-04',
    deviceId: 'DEV-14-AUDIT-STATION',
  },
  {
    id: 'k_menon_lead',
    name: 'K. Menon',
    role: 'Incident Response Commander',
    clearance: 'LEVEL-3 (OPERATIONAL)',
    station: 'IR-CONSOLE-09',
    deviceId: 'DEV-09-IR-PRIMARY',
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLocked = searchParams.get('locked') === 'true';

  const [authMethod, setAuthMethod] = useState<'BIOMETRIC' | 'PIN'>('BIOMETRIC');
  const [selectedProfile, setSelectedProfile] = useState<SupervisorProfile>(DEMO_PROFILES[0]);
  const [authStage, setAuthStage] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED'>('IDLE');
  const [denyReason, setDenyReason] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [pin, setPin] = useState<string>('729401');

  const handleStartAuth = (
    testScenario: 'NORMAL' | 'SPOOF_MASK' | 'UNTRUSTED_DEVICE' = 'NORMAL'
  ) => {
    setAuthStage('SCANNING');
    setDenyReason(null);
    setStatusMessage('1. Verifying DARŚANA optical liveness & 3D facial vectors...');

    setTimeout(() => {
      if (testScenario === 'SPOOF_MASK') {
        setAuthStage('DENIED');
        setDenyReason(
          'ANTI-SPOOFING ALERT: 2D static reflection / photo-mask artifact detected.'
        );
        setStatusMessage('SECURITY DENIAL: Biometric Anti-Spoofing Engaged');
        return;
      }

      setStatusMessage('2. Validating BANDHA hardware TPM trust signature...');
      setTimeout(() => {
        if (testScenario === 'UNTRUSTED_DEVICE') {
          setAuthStage('DENIED');
          setDenyReason(
            'HARDWARE BINDING FAILURE: Hardware TPM fingerprint mismatch.'
          );
          setStatusMessage('SECURITY DENIAL: Untrusted Hardware Device Blocked');
          return;
        }

        setStatusMessage('3. Minting ephemeral KṢAṆA 15-minute rotating session token...');
        setTimeout(() => {
          setStatusMessage('4. Writing tamper-evident SAKṢĪ hash-chain audit ledger entry...');
          setAuthStage('VERIFIED');

          setTimeout(() => {
            router.push('/');
          }, 1000);
        }, 450);
      }, 550);
    }, 800);
  };

  return (
    <div className="max-w-4xl w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col font-mono text-xs">
      {/* 1. Unified Institutional Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">
                ANVĪKṢA (SAT-SA)
              </h1>
              <span className="text-[9.5px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.2 rounded border border-slate-200">
                SIH26157 · NTRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Supervisory Analytics Tool for Security Operations Centre Assessment
            </p>
          </div>
        </div>

        {/* Air-gap Assurance Badges */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-full flex items-center gap-1 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>AIR-GAPPED</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full hidden sm:block">
            Egress: <strong className="text-slate-900">Disabled</strong>
          </div>
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full hidden sm:block">
            Audit: <strong className="text-slate-900">Hash-Chained</strong>
          </div>
        </div>
      </div>

      {/* 2. Session Lock Alert (When locked=true) */}
      {isLocked && (
        <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-900 flex items-center gap-2.5 text-[11px]">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <div className="font-bold uppercase tracking-wider text-rose-900">
            Session Locked · Biometric Re-Authentication Required
          </div>
        </div>
      )}

      {/* 3. Main Enclave Body (2 Columns) */}
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Supervisor Profile & Credentials (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Supervisor Profile Selector */}
          <div className="space-y-1.5">
            <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              Authorized Supervisor Profile:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_PROFILES.map((p) => {
                const isSelected = selectedProfile.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfile(p);
                      setAuthStage('IDLE');
                      setDenyReason(null);
                    }}
                    className={`p-2.5 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[11px] truncate">{p.name}</span>
                      {isSelected && <UserCheck className="w-3 h-3 text-white shrink-0" />}
                    </div>
                    <div
                      className={`text-[9.5px] font-sans truncate ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {p.role}
                    </div>
                    <div
                      className={`text-[8.5px] mt-1 font-mono truncate ${
                        isSelected ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {p.clearance.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Factor Switcher */}
          <div className="space-y-2">
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 gap-1 text-[10.5px]">
              <button
                type="button"
                onClick={() => setAuthMethod('BIOMETRIC')}
                className={`flex-1 py-1 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'BIOMETRIC'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Fingerprint className="w-3 h-3 text-slate-700" />
                <span>DARŚANA Biometric</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('PIN')}
                className={`flex-1 py-1 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'PIN'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-3 h-3 text-slate-700" />
                <span>Hardware Token PIN</span>
              </button>
            </div>

            {authMethod === 'PIN' ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-600 font-bold">BANDHA Security PIN:</span>
                  <span className="text-[9.5px] text-slate-400 font-sans">6-digit Enclave Key</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center text-xs font-bold tracking-widest text-slate-900 focus:outline-none focus:border-slate-400"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setPin('729401')}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 transition-colors whitespace-nowrap"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[10.5px]">
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Supervisor ID:</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.id}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Device Binding:</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.deviceId}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Assigned Station:</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.station}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Session Lifespan:</span>
                  <span className="text-emerald-700 font-bold">15-MIN ROTATING</span>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleStartAuth('NORMAL')}
              disabled={authStage === 'SCANNING'}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
            >
              {authStage === 'SCANNING' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>{statusMessage || 'VERIFYING CREDENTIALS...'}</span>
                </>
              ) : authStage === 'VERIFIED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AUTHENTICATED · ENTERING COMMAND CENTRE...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE &amp; ENTER COMMAND CENTRE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Subtle Zero Trust Failure Mode Testing */}
            <div className="pt-1.5 border-t border-slate-100">
              <div className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                Zero-Trust Verification Testing:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStartAuth('SPOOF_MASK')}
                  disabled={authStage === 'SCANNING'}
                  className="p-2 text-left bg-slate-50 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-lg text-slate-600 hover:text-rose-900 transition-colors text-[10px]"
                >
                  <div className="font-bold flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>Test 2D Spoof</span>
                  </div>
                  <div className="text-[8.5px] text-slate-400 mt-0.5 font-sans">
                    DARŚANA anti-spoof block
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartAuth('UNTRUSTED_DEVICE')}
                  disabled={authStage === 'SCANNING'}
                  className="p-2 text-left bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 rounded-lg text-slate-600 hover:text-amber-900 transition-colors text-[10px]"
                >
                  <div className="font-bold flex items-center gap-1">
                    <Server className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Test Untrusted Device</span>
                  </div>
                  <div className="text-[8.5px] text-slate-400 mt-0.5 font-sans">
                    BANDHA hardware deny
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Biometric HUD & Cryptographic Specs (5 Cols) */}
        <div className="md:col-span-5 space-y-3">
          <BiometricHUD
            authStage={authStage}
            denyReason={denyReason}
            mode="ENHANCED_3D"
          />

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 font-mono text-[10px] space-y-1.5">
            <div className="text-slate-900 font-bold tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5 text-[10.5px]">
              <Cpu className="w-3 h-3 text-slate-700" />
              <span>CRYPTOGRAPHIC PROTOCOLS</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Key Derivation:</span>
                <span className="text-slate-900 font-medium">Argon2id (m=64MB, t=3, p=4)</span>
              </div>
              <div className="flex justify-between">
                <span>Enclave Cipher:</span>
                <span className="text-slate-900 font-medium">AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Chain:</span>
                <span className="text-emerald-700 font-bold">Local SHA-256 Hash Chain</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Unified Minimalist Footer */}
      <div className="py-2 px-4 bg-slate-50 border-t border-slate-100 text-center text-[9.5px] text-slate-400 font-mono">
        <span>ANVĪKṢA · NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) · AIR-GAP ENCLAVE KAVACA</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
            <span>INITIALIZING ENCLAVE GATEWAY...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
