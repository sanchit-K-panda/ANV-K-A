'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Camera,
  Check,
  X,
  RefreshCw,
  Eye,
  Shield,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLocked = searchParams.get('locked') === 'true';

  const [username, setUsername] = useState('a_sharma_supervisor');
  const [authStage, setAuthStage] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED'>('IDLE');
  const [denyReason, setDenyReason] = useState<string | null>(null);

  const handleStartAuth = (simulateDenial: boolean = false) => {
    setAuthStage('SCANNING');
    setDenyReason(null);

    setTimeout(() => {
      if (simulateDenial) {
        setAuthStage('DENIED');
        setDenyReason('IDENTITY VERIFICATION FAILED: DARŚANA biometric anti-spoofing detected 2D static mask or facial signature mismatch. Sensitive operations locked.');
      } else {
        setAuthStage('VERIFIED');
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    }, 1800);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 font-sans text-xs">
      {/* Session Lock Banner */}
      {isLocked && (
        <div className="mb-4 p-3 bg-[#0C0E12] border border-white font-mono text-xs text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-white flex-shrink-0" />
          <div>
            <div className="font-bold uppercase tracking-wider">IDENTITY VERIFICATION FAILED / SESSION LOCKED</div>
            <div className="text-[#848B98]">Sensitive operations locked. DARŚANA biometric re-authentication required.</div>
          </div>
        </div>
      )}

      {/* Main KAVACA Authentication Enclave Card */}
      <div className="bg-[#0C0E12] border border-[#232732] p-6 font-mono space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#232732]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold font-mono text-xs border border-white">
              A
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-widest uppercase">
                ANVĪKṢA : KAVACA SECURE ACCESS
              </h1>
              <p className="text-[10px] text-[#848B98]">
                DARŚANA Biometric Verification & BANDHA Device Binding
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] text-white font-bold">
            ● LOCAL AIR-GAP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          {/* Left: Input & Enclave Status */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#848B98] uppercase font-semibold mb-1 text-[10px]">
                Supervisor Identifier
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#060709] border border-[#232732] px-2.5 py-1.5 text-white focus:outline-none focus:border-white text-xs font-mono"
              />
            </div>

            {/* Hardware & Enclave Security State */}
            <div className="p-3 bg-[#060709] border border-[#232732] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#848B98]">Identity Verification (DARŚANA):</span>
                <span className={authStage === 'VERIFIED' ? 'text-white font-bold' : authStage === 'SCANNING' ? 'text-white font-bold' : 'text-[#848B98]'}>
                  {authStage === 'VERIFIED' ? 'VERIFIED' : authStage === 'SCANNING' ? 'VERIFYING...' : 'READY'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848B98]">Liveness Analysis:</span>
                <span className="text-white font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848B98]">Device Binding (BANDHA):</span>
                <span className="text-white font-bold">TRUSTED (DEV-21)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848B98]">Depth Sensor (NETRA-3D):</span>
                <span className="text-white font-bold">CONNECTED</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleStartAuth(false)}
                disabled={authStage === 'SCANNING'}
                className="w-full py-2 bg-white text-black font-bold text-xs border border-white hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
              >
                {authStage === 'SCANNING' ? 'PERFORMING DARŚANA VERIFICATION...' : 'AUTHENTICATE SUPERVISOR'}
              </button>

              <button
                onClick={() => handleStartAuth(true)}
                disabled={authStage === 'SCANNING'}
                className="w-full py-1.5 bg-[#060709] border border-[#232732] hover:border-white text-[#848B98] hover:text-white transition-colors text-[10px]"
              >
                Simulate DARŚANA Biometric Mismatch (Test Deny Path)
              </button>
            </div>
          </div>

          {/* Right: Technical Biometric HUD */}
          <div className="bg-[#060709] border border-[#232732] p-4 flex flex-col items-center justify-center text-center">
            {authStage === 'IDLE' && (
              <div className="space-y-2">
                <div className="w-14 h-14 border border-[#232732] mx-auto flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs text-white font-bold">
                  Camera Feed & NETRA-3D Ready
                </div>
                <div className="text-[10px] text-[#656C7A]">
                  [ Face Detection Frame Active · Zero Cloud Ingestion ]
                </div>
              </div>
            )}

            {authStage === 'SCANNING' && (
              <div className="space-y-2">
                <div className="w-14 h-14 border border-white animate-spin mx-auto flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs text-white font-bold">
                  Analyzing Facial Liveness & Depth Vectors...
                </div>
                <div className="text-[10px] text-[#848B98]">
                  NETRA-3D Depth Verification: ACTIVE
                </div>
              </div>
            )}

            {authStage === 'VERIFIED' && (
              <div className="space-y-1.5">
                <div className="w-12 h-12 bg-white text-black mx-auto flex items-center justify-center font-bold">
                  <Check className="w-6 h-6" />
                </div>
                <div className="text-xs text-white font-bold">
                  Identity: VERIFIED · Device: TRUSTED
                </div>
                <div className="text-[10px] text-[#848B98]">
                  Session: ESTABLISHED · KṢAṆA Credential: ACTIVE
                </div>
              </div>
            )}

            {authStage === 'DENIED' && (
              <div className="space-y-1.5">
                <div className="w-12 h-12 border border-white text-white mx-auto flex items-center justify-center font-bold">
                  <X className="w-6 h-6" />
                </div>
                <div className="text-xs text-white font-bold">
                  IDENTITY VERIFICATION FAILED
                </div>
                <div className="text-[10px] text-[#9CA3AF] text-left p-2 border border-[#232732] mt-2">
                  {denyReason}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
