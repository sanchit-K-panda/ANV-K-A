'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Shield,
  ShieldAlert,
  Server,
  Database,
  ArrowRight,
  UserCheck,
  EyeOff,
  Cpu,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Search,
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLocked = searchParams.get('locked') === 'true';

  const [selectedProfile, setSelectedProfile] = useState<SupervisorProfile>(DEMO_PROFILES[0]);
  const [authStage, setAuthStage] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED'>('IDLE');
  const [denyReason, setDenyReason] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleStartAuth = (testScenario: 'NORMAL' | 'SPOOF_MASK' | 'UNTRUSTED_DEVICE' = 'NORMAL') => {
    setAuthStage('SCANNING');
    setDenyReason(null);
    setStatusMessage('1. Verifying DARŚANA optical liveness & 3D facial vectors...');

    setTimeout(() => {
      if (testScenario === 'SPOOF_MASK') {
        setAuthStage('DENIED');
        setDenyReason(
          'ANTI-SPOOFING ALERT: 2D static reflection / photo-mask artifact detected. Zero-trust security gate engaged. Sensitive operations locked.'
        );
        setStatusMessage('SECURITY DENIAL: Biometric Anti-Spoofing Engaged');
        return;
      }

      setStatusMessage('2. Validating BANDHA hardware TPM trust signature...');
      setTimeout(() => {
        if (testScenario === 'UNTRUSTED_DEVICE') {
          setAuthStage('DENIED');
          setDenyReason(
            'HARDWARE BINDING FAILURE: Hardware TPM fingerprint mismatch. Station unauthorized for supervisor credential elevation.'
          );
          setStatusMessage('SECURITY DENIAL: Untrusted Hardware Device Blocked');
          return;
        }

        setStatusMessage('3. Generating ephemeral KṢAṆA 15-minute rotating session token...');
        setTimeout(() => {
          setStatusMessage('4. Writing tamper-evident SAKṢĪ hash-chain audit ledger entry...');
          setAuthStage('VERIFIED');

          setTimeout(() => {
            router.push('/');
          }, 1200);
        }, 500);
      }, 600);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 font-sans text-xs">
      {/* Institutional Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-wider uppercase">
                ANVĪKṢA (SAT-SA)
              </h1>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                SIH26157 · NTRO
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Supervisory Analytics Tool for Security Operations Centre Assessment
            </p>
          </div>
        </div>

        {/* Air-gap Assurance Tags */}
        <div className="flex items-center gap-2 text-[10.5px]">
          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-full flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>AIR-GAPPED ENCLAVE</span>
          </div>
          <div className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full">
            Egress: <strong className="text-slate-900 font-semibold">Disabled</strong>
          </div>
          <div className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full">
            Audit: <strong className="text-slate-900 font-semibold">Hash-Chained</strong>
          </div>
        </div>
      </div>

      {/* Session Lock Banner */}
      {isLocked && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl font-mono text-xs text-rose-900 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold uppercase tracking-wider text-rose-900 text-xs">
              Session Locked · Biometric Re-Authentication Required
            </div>
            <div className="text-[11px] text-rose-700 font-sans">
              Continuous supervisor verification interval expired. Complete DARŚANA optical verification to resume access.
            </div>
          </div>
        </div>
      )}

      {/* Main Authentication Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Credentials & Security Posture (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 font-mono shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                Supervisor Access Enclave (KAVACA)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">SPEC V4.2</span>
          </div>

          {/* Supervisor Roster Selector */}
          <div className="space-y-2">
            <label className="block text-slate-500 uppercase font-bold text-[10.5px] tracking-wider">
              Select Authorized Supervisor Profile:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                    className={`p-3 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{p.name}</span>
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.role}
                    </div>
                    <div className={`text-[9px] mt-1 tracking-tight font-mono ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {p.clearance}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Station Telemetry */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
            <div className="flex justify-between py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Supervisor ID:</span>
              <span className="text-slate-900 font-bold font-mono">{selectedProfile.id}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Device Binding (BANDHA):</span>
              <span className="text-slate-900 font-bold font-mono">{selectedProfile.deviceId}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Assigned Console:</span>
              <span className="text-slate-900 font-bold font-mono">{selectedProfile.station}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Session Lifespan:</span>
              <span className="text-emerald-700 font-bold font-mono">15-MINUTE ROTATING (AIR-GAP)</span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => handleStartAuth('NORMAL')}
              disabled={authStage === 'SCANNING'}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {authStage === 'SCANNING' ? (
                <span>{statusMessage || 'VERIFYING CREDENTIALS...'}</span>
              ) : authStage === 'VERIFIED' ? (
                <span>AUTHENTICATED · ENTERING COMMAND CENTRE...</span>
              ) : (
                <>
                  <span>AUTHENTICATE &amp; ENTER COMMAND CENTRE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Zero Trust Failure Mode Testing */}
            <div className="pt-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                Zero-Trust Verification Testing:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleStartAuth('SPOOF_MASK')}
                  disabled={authStage === 'SCANNING'}
                  className="p-2.5 text-left bg-slate-50 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-xl text-slate-600 hover:text-rose-900 transition-colors text-[10.5px]"
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Test 2D Photo / Mask Spoof</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Triggers DARŚANA anti-spoofing block</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartAuth('UNTRUSTED_DEVICE')}
                  disabled={authStage === 'SCANNING'}
                  className="p-2.5 text-left bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 rounded-xl text-slate-600 hover:text-amber-900 transition-colors text-[10.5px]"
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-600" />
                    <span>Test Untrusted Device ID</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Triggers BANDHA hardware deny</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Biometric HUD (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <BiometricHUD
            authStage={authStage}
            denyReason={denyReason}
            mode="ENHANCED_3D"
          />

          <div className="bg-white border border-slate-200 rounded-2xl p-5 font-mono text-[11px] space-y-2.5 shadow-card">
            <div className="text-slate-900 font-bold tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Cpu className="w-4 h-4 text-slate-700" />
              <span>CRYPTOGRAPHIC PROTOCOLS</span>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Key Derivation:</span>
                <span className="text-slate-900 font-medium">Argon2id (m=64MB, t=3, p=4)</span>
              </div>
              <div className="flex justify-between">
                <span>Enclave Encryption:</span>
                <span className="text-slate-900 font-medium">AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span>Tamper-Evident Ledger:</span>
                <span className="text-emerald-700 font-bold">Local SHA-256 Hash Chain</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Architecture Briefing Strip */}
      <div className="space-y-3 font-mono pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Supervisory Analytical Engines
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">OPERATIONAL ASSESSMENT STACK</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-card">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-bold text-slate-900">01. Execution Gap</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">VIVEKA</span>
            </div>
            <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
              Detects omissions and procedural bypasses between established incident response SOPs and actual forensic actions.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-card">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-bold text-slate-900">02. Negative Space</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">ABHĀVA</span>
            </div>
            <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
              Identifies actions that <strong className="text-slate-900 font-semibold">should have occurred but didn&apos;t</strong> (unperformed memory dumps, missing host isolation).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-card">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-bold text-slate-900">03. Behavioural ML</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">VIKĀRA</span>
            </div>
            <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
              Surfaces synthetic metric gaming, rapid-fire alert dismissals, and analyst burnout using statistical anomaly detection.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-card">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-bold text-slate-900">04. Explainability</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">PRATYAYA</span>
            </div>
            <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
              Eliminates opaque scoring. Every finding exposes WHAT, WHY, WHEN, WHERE, EVIDENCE, CONFIDENCE, and RECOMMENDATIONS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
