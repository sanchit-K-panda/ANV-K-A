'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Check, X, Shield, Cpu, Lock, Eye } from 'lucide-react';

interface BiometricHUDProps {
  authStage: 'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED';
  denyReason?: string | null;
  mode?: 'BASELINE' | 'ENHANCED_3D';
  onCameraStatusChange?: (active: boolean) => void;
}

export function BiometricHUD({
  authStage,
  denyReason,
  mode = 'ENHANCED_3D',
  onCameraStatusChange,
}: BiometricHUDProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [hasCameraError, setHasCameraError] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(99.4);
  const [vectorHash, setVectorHash] = useState<string>('sha256:8f9a2c...41e0');

  const enableWebcam = async () => {
    try {
      setHasCameraError(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      onCameraStatusChange?.(true);
    } catch (err) {
      console.warn('Camera access unavailable. Using hardware enclave simulation.', err);
      setHasCameraError(true);
      setCameraActive(false);
      onCameraStatusChange?.(false);
    }
  };

  const disableWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    onCameraStatusChange?.(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authStage === 'SCANNING') {
      interval = setInterval(() => {
        setConfidence(+(98.5 + Math.random() * 1.3).toFixed(1));
        const randHex = Math.random().toString(16).substring(2, 8);
        setVectorHash(`sha256:e4b${randHex}...${Math.floor(Math.random() * 900 + 100)}`);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [authStage]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between font-mono text-xs select-none shadow-card">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-bold text-slate-900 tracking-wide uppercase">
            DARŚANA Optical Sensor
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10.5px]">
          <span className="text-slate-500">Mode: <strong className="text-slate-800">{mode}</strong></span>
          <button
            type="button"
            onClick={cameraActive ? disableWebcam : enableWebcam}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-3 h-3 text-rose-600" />
                <span>Disconnect</span>
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 text-emerald-600" />
                <span>{hasCameraError ? 'Retry Camera' : 'Enable Camera'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optical Frame with Soft Rounded Viewport */}
      <div className="relative w-full aspect-[16/10] bg-slate-100 rounded-xl border border-slate-200 my-4 flex items-center justify-center overflow-hidden">
        {/* Video Feed */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover grayscale contrast-110 ${
            cameraActive ? 'opacity-90' : 'hidden'
          }`}
          playsInline
          muted
        />

        {/* Framing Guides */}
        <div className="absolute inset-6 border-2 border-dashed border-slate-300 rounded-xl pointer-events-none flex items-center justify-center">
          {authStage === 'IDLE' && (
            <div className="text-center space-y-1.5 z-10 px-4 bg-white/95 p-4 rounded-xl border border-slate-200 shadow-sm max-w-[260px]">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900">
                Optical Terminal Ready
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                Align face within frame for on-device 3D verification
              </div>
            </div>
          )}

          {authStage === 'SCANNING' && (
            <div className="text-center space-y-2 z-10 bg-white/95 p-4 rounded-xl border border-blue-200 shadow-md max-w-[260px]">
              <div className="text-xs font-bold text-blue-900 uppercase">
                Verifying Facial Mesh...
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full animate-[shimmer_1.2s_infinite] w-full rounded-full" />
              </div>
              <div className="text-[9.5px] text-slate-500 font-sans">
                Evaluating 3D depth topology &amp; anti-spoofing vectors
              </div>
            </div>
          )}

          {authStage === 'VERIFIED' && (
            <div className="text-center space-y-1.5 z-10 bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-md max-w-[260px]">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="text-xs font-bold text-emerald-900 uppercase">
                Identity Verified
              </div>
              <div className="text-[10px] text-emerald-700 font-sans">
                Biometric template matched (Confidence: 99.4%)
              </div>
            </div>
          )}

          {authStage === 'DENIED' && (
            <div className="text-center space-y-1.5 z-10 bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-md max-w-[280px]">
              <div className="w-8 h-8 bg-rose-600 text-white rounded-full mx-auto flex items-center justify-center font-bold">
                <X className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="text-xs font-bold text-rose-900 uppercase">
                Verification Failed
              </div>
              <div className="text-[10px] text-rose-700 leading-snug font-sans">
                {denyReason || 'Spoofing pattern detected or signature mismatch.'}
              </div>
            </div>
          )}
        </div>

        {/* Live Vector Tags */}
        <div className="absolute bottom-2.5 left-2.5 text-[9.5px] text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
          Liveness: <strong className="text-slate-900">Active (3D Mesh)</strong>
        </div>
        <div className="absolute bottom-2.5 right-2.5 text-[9.5px] text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
          Confidence: <strong className="text-slate-900">{authStage === 'SCANNING' ? confidence : '99.4'}%</strong>
        </div>
      </div>

      {/* Cryptographic Assurance Footer */}
      <div className="pt-3 border-t border-slate-100 text-[10.5px] space-y-1.5 text-slate-600">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Protected Template:</span>
          </span>
          <span className="text-slate-900 font-mono font-semibold">{vectorHash}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
          <span>Raw Biometric Storage:</span>
          <span className="text-emerald-700 font-semibold">Disabled (Zero Persistence)</span>
        </div>
      </div>
    </div>
  );
}
