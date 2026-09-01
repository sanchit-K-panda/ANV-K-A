'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Check,
  X,
  Shield,
  Cpu,
  Lock,
  Eye,
  Scan,
} from 'lucide-react';

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
  const [vectorHash, setVectorHash] = useState<string>('sha256:8f9a2c09bd31');

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
      console.warn('Camera access unavailable. Falling back to local enclave simulation.', err);
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
        setConfidence(+(98.6 + Math.random() * 1.2).toFixed(1));
        const randHex = Math.random().toString(16).substring(2, 6);
        setVectorHash(`sha256:e4b${randHex}...`);
      }, 150);
    } else if (authStage === 'VERIFIED') {
      setConfidence(99.8);
      setVectorHash('sha256:8f9a2c09bd31');
    }
    return () => clearInterval(interval);
  }, [authStage]);

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between font-mono text-xs select-none">
      {/* Sensor Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[10.5px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span className="font-bold text-slate-900 tracking-wide uppercase">
            DARŚANA Optical Sensor
          </span>
        </div>

        <button
          type="button"
          onClick={cameraActive ? disableWebcam : enableWebcam}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 border ${
            cameraActive
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {cameraActive ? (
            <>
              <CameraOff className="w-2.5 h-2.5 text-rose-600" />
              <span>Disconnect</span>
            </>
          ) : (
            <>
              <Camera className="w-2.5 h-2.5 text-emerald-600" />
              <span>{hasCameraError ? 'Retry' : 'Enable Camera'}</span>
            </>
          )}
        </button>
      </div>

      {/* Optical Frame Viewport */}
      <div className="relative w-full aspect-[16/10] bg-white rounded-lg border border-slate-200 my-2 flex items-center justify-center overflow-hidden">
        {/* Live Camera Stream */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover grayscale contrast-110 ${
            cameraActive ? 'opacity-85' : 'hidden'
          }`}
          playsInline
          muted
        />

        {/* Minimalist Tactical Reticle Overlay */}
        <div className="absolute inset-3 border border-dashed border-slate-300/80 rounded pointer-events-none flex items-center justify-center">
          {authStage === 'IDLE' && (
            <div className="text-center space-y-1 z-10 bg-white/95 px-3 py-2 rounded-lg border border-slate-200 shadow-xs max-w-[200px]">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 mx-auto flex items-center justify-center">
                <Scan className="w-3 h-3" />
              </div>
              <div className="text-[10.5px] font-bold text-slate-900">
                Optical Terminal Ready
              </div>
              <div className="text-[9px] text-slate-500 font-sans leading-tight">
                Align facial profile for 3D vector match
              </div>
            </div>
          )}

          {authStage === 'SCANNING' && (
            <div className="text-center space-y-1.5 z-10 bg-white/95 px-3 py-2.5 rounded-lg border border-blue-200 shadow-md max-w-[210px]">
              <div className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wide">
                Verifying 3D Facial Mesh...
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full w-full animate-pulse rounded-full" />
              </div>
              <div className="text-[9px] text-slate-500 font-sans">
                Evaluating liveness vectors
              </div>
            </div>
          )}

          {authStage === 'VERIFIED' && (
            <div className="text-center space-y-1 z-10 bg-emerald-50/95 border border-emerald-200 px-3 py-2 rounded-lg shadow-md max-w-[210px]">
              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="text-[10.5px] font-bold text-emerald-900 uppercase">
                Identity Verified
              </div>
              <div className="text-[9px] text-emerald-700 font-sans">
                Template matched (99.8%)
              </div>
            </div>
          )}

          {authStage === 'DENIED' && (
            <div className="text-center space-y-1 z-10 bg-rose-50/95 border border-rose-200 px-3 py-2 rounded-lg shadow-md max-w-[220px]">
              <div className="w-6 h-6 bg-rose-600 text-white rounded-full mx-auto flex items-center justify-center font-bold">
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="text-[10.5px] font-bold text-rose-900 uppercase">
                Verification Failed
              </div>
              <div className="text-[9px] text-rose-700 font-sans leading-tight">
                {denyReason || 'Biometric anomaly detected.'}
              </div>
            </div>
          )}
        </div>

        {/* Clean Telemetry Badges */}
        <div className="absolute bottom-1.5 left-1.5 text-[8.5px] text-slate-600 bg-white/90 px-1.5 py-0.2 rounded border border-slate-200">
          Liveness: <strong className="text-slate-900">3D Active</strong>
        </div>
        <div className="absolute bottom-1.5 right-1.5 text-[8.5px] text-slate-600 bg-white/90 px-1.5 py-0.2 rounded border border-slate-200">
          Confidence: <strong className="text-slate-900">{authStage === 'SCANNING' ? confidence : '99.4'}%</strong>
        </div>
      </div>

      {/* Sensor Metadata Footer */}
      <div className="pt-2 border-t border-slate-200 text-[9.5px] space-y-1 text-slate-500">
        <div className="flex justify-between items-center bg-white px-2 py-1 rounded border border-slate-200/80">
          <span className="flex items-center gap-1 text-slate-600">
            <Cpu className="w-2.5 h-2.5 text-slate-400" />
            <span>Vector Hash:</span>
          </span>
          <span className="text-slate-900 font-mono font-semibold">{vectorHash}</span>
        </div>
        <div className="flex justify-between items-center px-0.5 text-[9px]">
          <span>Privacy Standard:</span>
          <span className="text-emerald-700 font-semibold">Zero Raw Persistence (ISO 30107-3)</span>
        </div>
      </div>
    </div>
  );
}
