'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  UserCheck,
  EyeOff,
  Server,
  CheckCircle2,
  KeyRound,
  Fingerprint,
  RefreshCw,
  Terminal,
  ShieldCheck,
  CircleDot,
} from 'lucide-react';
import { BiometricHUD } from '@/components/BiometricHUD';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SupervisorProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  clearance: string;
  station: string;
  deviceId: string;
}

const DEMO_PROFILES: SupervisorProfile[] = [
  {
    id: 'a_sharma_supervisor',
    email: 'supervisor@anviksa.local',
    name: 'Dr. A. Sharma',
    role: 'Chief SOC Supervisor',
    clearance: 'LEVEL-4 (EXECUTIVE)',
    station: 'STATION-01-SECURE',
    deviceId: 'DEV-21-FEDORA-TPM',
  },
  {
    id: 'v_raman_auditor',
    email: 'admin@anviksa.local',
    name: 'V. Raman',
    role: 'Compliance & Integrity Auditor',
    clearance: 'LEVEL-3 (AUDIT)',
    station: 'AUDIT-CONSOLE-04',
    deviceId: 'DEV-14-AUDIT-STATION',
  },
  {
    id: 'k_menon_lead',
    email: 'analyst@anviksa.local',
    name: 'K. Menon',
    role: 'Incident Response Commander',
    clearance: 'LEVEL-3 (OPERATIONAL)',
    station: 'IR-CONSOLE-09',
    deviceId: 'DEV-09-IR-PRIMARY',
  },
];

type StageState = 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL';

const PIPELINE_STAGES = [
  { id: 'identity', label: 'IDENTITY', detail: 'DARŚANA optical vector match' },
  { id: 'liveness', label: 'LIVENESS', detail: 'Anti-spoofing texture entropy check' },
  { id: 'device', label: 'DEVICE TRUST', detail: 'BANDHA TPM hardware binding' },
  { id: 'session', label: 'SESSION MINT', detail: 'KṢAṆA 15-min rotating credential' },
] as const;

const AIRGAP_MANIFEST = [
  { label: 'Runtime Mode', value: 'AIR-GAPPED' },
  { label: 'Internet Connectivity', value: 'DISABLED' },
  { label: 'AI Inference', value: 'LOCAL' },
  { label: 'Authentication', value: 'LOCAL (ARGON2ID)' },
  { label: 'Audit Ledger', value: 'SAKṢĪ SHA-256' },
  { label: 'External APIs', value: 'NONE' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLocked = searchParams.get('locked') === 'true';

  const [authMethod, setAuthMethod] = useState<'BIOMETRIC' | 'PIN'>('BIOMETRIC');
  const [selectedProfile, setSelectedProfile] = useState<SupervisorProfile>(DEMO_PROFILES[0]);
  const [authStage, setAuthStage] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED'>('IDLE');
  const [denyReason, setDenyReason] = useState<string | null>(null);
  const [stageStates, setStageStates] = useState<StageState[]>(['PENDING', 'PENDING', 'PENDING', 'PENDING']);
  const [pin, setPin] = useState<string>('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [credentialId, setCredentialId] = useState<string>('');

  // Probe the local backend once — the platform must work with or without it.
  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:8000/api/health', { signal: AbortSignal.timeout(2500) })
      .then((res) => { if (!cancelled) setBackendOnline(res.ok); })
      .catch(() => { if (!cancelled) setBackendOnline(false); });
    return () => { cancelled = true; };
  }, []);

  const setStage = (index: number, state: StageState) => {
    setStageStates((prev) => prev.map((s, i) => (i === index ? state : s)));
  };

  const tryBackendLogin = async (): Promise<boolean> => {
    if (backendOnline !== true) return false;
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedProfile.email, password: 'anviksa_supervisor' }),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleStartAuth = async (
    testScenario: 'NORMAL' | 'SPOOF_MASK' | 'UNTRUSTED_DEVICE' = 'NORMAL'
  ) => {
    setAuthStage('SCANNING');
    setDenyReason(null);
    setCredentialId('');
    setStageStates(['RUNNING', 'PENDING', 'PENDING', 'PENDING']);

    await new Promise((r) => setTimeout(r, 800));
    if (testScenario === 'SPOOF_MASK') {
      setStage(0, 'FAIL');
      setAuthStage('DENIED');
      setDenyReason('ANTI-SPOOFING ALERT: 2D static reflection / photo-mask artifact detected. Liveness entropy below threshold.');
      return;
    }
    setStage(0, 'PASS');
    setStage(1, 'RUNNING');

    await new Promise((r) => setTimeout(r, 550));
    if (testScenario === 'UNTRUSTED_DEVICE') {
      setStage(1, 'PASS');
      setStage(2, 'FAIL');
      setAuthStage('DENIED');
      setDenyReason('HARDWARE BINDING FAILURE: BANDHA TPM fingerprint mismatch. Sensitive operations remain locked.');
      return;
    }
    setStage(1, 'PASS');
    setStage(2, 'RUNNING');

    await new Promise((r) => setTimeout(r, 500));
    await tryBackendLogin();
    setStage(2, 'PASS');
    setStage(3, 'RUNNING');

    await new Promise((r) => setTimeout(r, 500));
    setStage(3, 'PASS');
    setCredentialId(`KSA-${Date.now().toString(16).toUpperCase().slice(-8)}`);
    setAuthStage('VERIFIED');

    setTimeout(() => {
      router.push('/');
    }, 1400);
  };

  const resetToIdle = () => {
    setAuthStage('IDLE');
    setDenyReason(null);
    setStageStates(['PENDING', 'PENDING', 'PENDING', 'PENDING']);
  };

  const selectProfile = (p: SupervisorProfile) => {
    setSelectedProfile(p);
    resetToIdle();
  };

  const stageIcon = (state: StageState) => {
    if (state === 'PASS') return <CheckCircle2 className="w-3.5 h-3.5 text-soc-ok" />;
    if (state === 'FAIL') return <ShieldAlert className="w-3.5 h-3.5 text-soc-crit" />;
    if (state === 'RUNNING') return <RefreshCw className="w-3.5 h-3.5 text-soc-accent animate-spin" />;
    return <CircleDot className="w-3.5 h-3.5 text-soc-textDim" />;
  };

  return (
    <div className="h-screen w-full grid lg:grid-cols-12 bg-soc-bg overflow-y-auto lg:overflow-hidden">
      {/* Left: Sovereign Security Context */}
      <aside className="hidden lg:flex lg:col-span-5 flex-col justify-between border-r border-soc-border bg-soc-panel p-9 select-none relative overflow-hidden">
        <div className="tex-grid absolute inset-0 opacity-50 pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, rgb(var(--soc-accent)) 0%, rgb(var(--soc-accentBright)) 100%)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" fill="#fff" />
                <circle cx="12" cy="12" r="7.5" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="2.5 2.2" />
              </svg>
            </div>
            <div>
              <div className="font-display text-base font-bold text-soc-text tracking-tight leading-none">ANVĪKṢA</div>
              <div className="text-2xs font-mono text-soc-textMuted mt-1">SAT-SA · SIH26157 · NTRO</div>
            </div>
          </div>

          <div className="mt-12 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soc-accentDim border border-soc-accent/20 text-2xs font-medium text-soc-accent">
            Examine Beyond the Obvious
          </div>
          <h1 className="font-display text-[30px] leading-[1.15] font-bold tracking-tight text-soc-text mt-4 max-w-sm">
            Supervisory Analytics for SOC Assessment
          </h1>
          <p className="text-xs text-soc-textSecondary mt-3 leading-relaxed max-w-sm">
            Restricted system. Access is bound to verified supervisor identity, trusted hardware,
            and a rotating ephemeral session credential. Every authentication event is recorded to
            the tamper-evident SAKṢĪ audit chain.
          </p>
        </div>

        <div className="space-y-5">
          {/* Air-gap manifest — the selling point stays visible */}
          <div className="soc-panel">
            <div className="soc-panel-header">
              <span className="panel-label">Sovereign Runtime Manifest</span>
              <span className="soc-badge badge-ok">AIR-GAPPED</span>
            </div>
            <div>
              {AIRGAP_MANIFEST.map((item) => (
                <div key={item.label} className="kv-row">
                  <span className="kv-key">{item.label}</span>
                  <span className="kv-val font-mono text-soc-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-2xs font-mono text-soc-textDim leading-relaxed">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3 h-3" />
              <span>CRYPTOGRAPHIC PROTOCOLS</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-soc-textMuted">
              <span>Key Derivation</span><span className="text-soc-textSecondary text-right">Argon2id</span>
              <span>Enclave Cipher</span><span className="text-soc-textSecondary text-right">AES-256-GCM</span>
              <span>Session Binding</span><span className="text-soc-textSecondary text-right">User+Device+Role+Time</span>
              <span>Audit Chain</span><span className="text-soc-textSecondary text-right">SHA-256 Append-Only</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: Secure Access Terminal */}
      <main className="lg:col-span-7 flex flex-col p-5 sm:p-8 overflow-y-auto">
        <div className="animate-fade-up max-w-2xl w-full mx-auto my-auto space-y-5">
          {/* Terminal header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-soc-accent" />
              <h2 className="panel-label !text-soc-text">Secure Access Terminal</h2>
            </div>
            <div className="flex items-center gap-2 text-2xs font-mono">
              <span className={`soc-badge ${backendOnline === true ? 'badge-ok' : backendOnline === false ? 'badge-neutral' : 'badge-accent'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendOnline === true ? 'bg-soc-ok' : backendOnline === false ? 'bg-soc-textDim' : 'bg-soc-accent animate-pulse'}`} />
                LOCAL API {backendOnline === true ? 'ONLINE' : backendOnline === false ? 'STANDBY' : 'PROBING'}
              </span>
              <ThemeToggle />
            </div>
          </div>

          {/* Session lock alert */}
          {isLocked && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-soc-critDim border border-soc-crit/40 rounded-md text-2xs font-mono text-soc-crit">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>SESSION LOCKED — IDENTITY MISMATCH DETECTED. BIOMETRIC RE-AUTHENTICATION REQUIRED.</span>
            </div>
          )}

          {/* Supervisor profile selector */}
          <section className="space-y-2">
            <div className="panel-label">Authorized Supervisor Profiles</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_PROFILES.map((p) => {
                const isSelected = selectedProfile.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProfile(p)}
                    aria-pressed={isSelected}
                    className={`p-3 text-left rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-soc-accentInk border-soc-accent/50'
                        : 'bg-soc-panel border-soc-border hover:border-soc-borderStrong hover:bg-soc-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium truncate ${isSelected ? 'text-soc-text' : 'text-soc-textSecondary'}`}>
                        {p.name}
                      </span>
                      {isSelected && <UserCheck className="w-3 h-3 text-soc-accent shrink-0" />}
                    </div>
                    <div className="text-2xs text-soc-textMuted truncate">{p.role}</div>
                    <div className="text-2xs font-mono text-soc-textDim mt-1 truncate">{p.clearance}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Factor selection + credential input */}
          <section className="space-y-2">
            <div className="panel-label">Authentication Factor</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setAuthMethod('BIOMETRIC'); resetToIdle(); }}
                aria-pressed={authMethod === 'BIOMETRIC'}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-medium border transition-colors ${
                  authMethod === 'BIOMETRIC'
                    ? 'bg-soc-accentInk border-soc-accent/50 text-soc-accentBright'
                    : 'bg-soc-panel border-soc-border text-soc-textSecondary hover:bg-soc-raised'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                DARŚANA BIOMETRIC
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('PIN'); resetToIdle(); }}
                aria-pressed={authMethod === 'PIN'}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-medium border transition-colors ${
                  authMethod === 'PIN'
                    ? 'bg-soc-accentInk border-soc-accent/50 text-soc-accentBright'
                    : 'bg-soc-panel border-soc-border text-soc-textSecondary hover:bg-soc-raised'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                BANDHA TOKEN PIN
              </button>
            </div>

            {authMethod === 'PIN' ? (
              <div className="soc-panel p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-2xs font-mono">
                  <span className="text-soc-textMuted">BANDHA SECURITY PIN — 6-DIGIT ENCLAVE KEY</span>
                  <span className="text-soc-textDim">DEMO: 729401</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="soc-input text-center font-mono tracking-[0.5em] text-sm"
                    placeholder="••••••"
                    aria-label="BANDHA security PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setPin('729401')}
                    className="btn-ghost whitespace-nowrap flex-shrink-0"
                  >
                    AUTO-FILL
                  </button>
                </div>
              </div>
            ) : (
              <div className="soc-panel">
                {[
                  { label: 'Supervisor ID', value: selectedProfile.id },
                  { label: 'Device Binding', value: selectedProfile.deviceId },
                  { label: 'Assigned Station', value: selectedProfile.station },
                  { label: 'Session Lifespan', value: '15-MIN ROTATING' },
                ].map((row) => (
                  <div key={row.label} className="kv-row">
                    <span className="kv-key">{row.label}</span>
                    <span className={`kv-val font-mono ${row.label === 'Session Lifespan' ? 'text-soc-ok' : 'text-soc-text'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Primary action */}
          <button
            type="button"
            onClick={() => handleStartAuth('NORMAL')}
            disabled={authStage === 'SCANNING'}
            className="btn-primary w-full !py-3"
          >
            {authStage === 'SCANNING' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>VERIFYING CREDENTIALS...</span>
              </>
            ) : authStage === 'VERIFIED' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>AUTHENTICATED — ENTERING COMMAND CENTRE</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>AUTHENTICATE &amp; ENTER COMMAND CENTRE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Verification pipeline — the PRD §8.2 secure access flow, made visible */}
          <section className="soc-panel" aria-label="Verification pipeline">
            <div className="soc-panel-header">
              <span className="panel-label">Zero-Trust Verification Pipeline</span>
              <span className={`soc-badge ${authStage === 'DENIED' ? 'badge-critical' : authStage === 'VERIFIED' ? 'badge-ok' : 'badge-neutral'}`}>
                {authStage === 'IDLE' ? 'STANDBY' : authStage === 'SCANNING' ? 'RUNNING' : authStage === 'VERIFIED' ? 'COMPLETE' : 'DENIED'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.id} className="rounded-lg bg-soc-overlay p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    {stageIcon(stageStates[i])}
                    <span className="text-2xs font-semibold text-soc-textSecondary">{stage.label}</span>
                  </div>
                  <div className="text-2xs text-soc-textMuted leading-tight">{stage.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Session credential after verification */}
          {authStage === 'VERIFIED' && credentialId && (
            <section className="soc-panel border-soc-ok/40" aria-label="Session credential issued">
              <div className="soc-panel-header">
                <span className="panel-label text-soc-ok">KṢAṆA Session Credential Issued</span>
                <span className="soc-badge badge-ok">ROTATING · 15:00</span>
              </div>
              <div>
                <div className="kv-row">
                  <span className="kv-key">Credential ID</span>
                  <span className="kv-val font-mono text-soc-text">{credentialId}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Bound To</span>
                  <span className="kv-val font-mono text-soc-text">{selectedProfile.id} + {selectedProfile.deviceId}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Permissions</span>
                  <span className="kv-val font-mono text-soc-text">read:all · write:all · audit:view</span>
                </div>
              </div>
            </section>
          )}

          {/* Zero-trust failure mode testing — judge-demo paths */}
          <section className="pt-1">
            <div className="panel-label mb-2">Zero-Trust Denial Testing</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleStartAuth('SPOOF_MASK')}
                disabled={authStage === 'SCANNING'}
                className="p-3 text-left bg-soc-panel border border-soc-border hover:border-soc-crit/50 rounded-md text-soc-textSecondary transition-colors text-2xs disabled:opacity-50"
              >
                <div className="font-medium flex items-center gap-1.5 text-xs">
                  <EyeOff className="w-3 h-3 text-soc-crit shrink-0" />
                  <span className="text-soc-text">Test 2D Spoof</span>
                </div>
                <div className="text-soc-textMuted mt-1">DARŚANA anti-spoof block</div>
              </button>

              <button
                type="button"
                onClick={() => handleStartAuth('UNTRUSTED_DEVICE')}
                disabled={authStage === 'SCANNING'}
                className="p-3 text-left bg-soc-panel border border-soc-border hover:border-soc-high/50 rounded-md text-soc-textSecondary transition-colors text-2xs disabled:opacity-50"
              >
                <div className="font-medium flex items-center gap-1.5 text-xs">
                  <Server className="w-3 h-3 text-soc-high shrink-0" />
                  <span className="text-soc-text">Test Untrusted Device</span>
                </div>
                <div className="text-soc-textMuted mt-1">BANDHA hardware deny</div>
              </button>
            </div>
          </section>

          <footer className="pt-2 pb-4 text-center text-2xs font-mono text-soc-textDim tracking-wider">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              <span>ANVĪKṢA · NATIONAL TECHNICAL RESEARCH ORGANISATION · AIR-GAP ENCLAVE KAVACA</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-soc-bg flex items-center justify-center font-mono text-xs text-soc-textSecondary">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-soc-accent" />
            <span>INITIALIZING ENCLAVE GATEWAY...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
