'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Check, X, Cpu, Scan } from 'lucide-react';

interface BiometricHUDProps {
  authStage: 'IDLE' | 'SCANNING' | 'VERIFIED' | 'DENIED';
  denyReason?: string | null;
  mode?: 'BASELINE' | 'ENHANCED_3D';
  onCameraStatusChange?: (active: boolean) => void;
}

/**
 * DARŚANA optical verification sensor.
 * Baseline Mode: camera → facial features → verification.
 * LiDAR/3D is an optional enhancement, never a hard dependency.
 * Camera frames are processed locally — zero raw persistence (ISO 30107-3).
 */
export function BiometricHUD({
  authStage,
  denyReason,
  mode = 'BASELINE',
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

  const isScanning = authStage === 'SCANNING';

  return (
    <div className="soc-panel overflow-hidden select-none">
      {/* Sensor Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-soc-ok' : 'bg-soc-textDim'}`} aria-hidden="true" />
          <span className="panel-label">DARŚANA Optical Sensor</span>
        </div>

        <button
          type="button"
          onClick={cameraActive ? disableWebcam : enableWebcam}
          className={`soc-badge ${cameraActive ? 'badge-critical' : 'badge-accent'} hover:opacity-80 transition-opacity`}
        >
          {cameraActive ? (
            <>
              <CameraOff className="w-2.5 h-2.5" />
              DISCONNECT
            </>
          ) : (
            <>
              <Camera className="w-2.5 h-2.5" />
              {hasCameraError ? 'RETRY CAMERA' : 'ENABLE CAMERA'}
            </>
          )}
        </button>
      </div>

      {/* Optical Frame Viewport */}
      <div className="relative w-full aspect-[16/10] bg-soc-bg border-b border-soc-border flex items-center justify-center overflow-hidden">
        {/* Live Camera Stream — desaturated for forensic neutrality */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-75 ${
            cameraActive ? 'opacity-80' : 'hidden'
          }`}
          playsInline
          muted
        />

        {/* Tactical Reticle Overlay */}
        <div className="absolute inset-3 border border-dashed border-soc-borderStrong/70 pointer-events-none flex items-center justify-center">
          {/* Corner ticks */}
          {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((pos) => (
            <span key={pos} className={`absolute w-4 h-4 border-soc-accent/60 ${pos}`} aria-hidden="true" />
          ))}

          {authStage === 'IDLE' && (
            <div className="text-center space-y-1.5 z-10 bg-soc-panel/90 px-4 py-3 rounded-sm border border-soc-border max-w-[220px]">
              <Scan className="w-4 h-4 text-soc-accent mx-auto" />
              <div className="text-2xs font-medium text-soc-text tracking-wide">OPTICAL TERMINAL READY</div>
              <div className="text-2xs text-soc-textMuted leading-tight">
                Align facial profile for vector match. Camera capture is optional — simulation fallback active.
              </div>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-x-0 top-6 bottom-6 pointer-events-none" aria-hidden="true">
              <style>{`
                @keyframes darsana-sweep {
                  0% { transform: translateY(0); opacity: 0.9; }
                  50% { opacity: 0.4; }
                  100% { transform: translateY(100%); opacity: 0.9; }
                }
              `}</style>
              <div
                className="h-px w-full bg-soc-accent"
                style={{ animation: 'darsana-sweep 1.6s ease-in-out infinite alternate' }}
              />
            </div>
          )}

          {authStage === 'VERIFIED' && (
            <div className="text-center space-y-1.5 z-10 bg-soc-okDim/90 border border-soc-ok/40 px-4 py-3 rounded-sm max-w-[210px]">
              <span className="w-6 h-6 bg-soc-ok/20 border border-soc-ok/50 rounded-full mx-auto flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-soc-ok" />
              </span>
              <div className="text-2xs font-semibold text-soc-ok tracking-wider">IDENTITY VERIFIED</div>
              <div className="text-2xs text-soc-ok/70 font-mono">Template matched · 99.8%</div>
            </div>
          )}

          {authStage === 'DENIED' && (
            <div className="text-center space-y-1.5 z-10 bg-soc-critDim/90 border border-soc-crit/40 px-4 py-3 rounded-sm max-w-[230px]">
              <span className="w-6 h-6 bg-soc-crit/20 border border-soc-crit/50 rounded-full mx-auto flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-soc-crit" />
              </span>
              <div className="text-2xs font-semibold text-soc-crit tracking-wider">VERIFICATION FAILED</div>
              <div className="text-2xs text-soc-crit/80 font-mono leading-tight">
                {denyReason || 'Biometric anomaly detected.'}
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Badges */}
        <div className="absolute bottom-1.5 left-1.5 text-2xs font-mono text-soc-textSecondary bg-soc-panel/85 px-1.5 py-0.5 rounded-sm border border-soc-border">
          LIVENESS: <span className={mode === 'ENHANCED_3D' ? 'text-soc-accent' : 'text-soc-text'}>{mode === 'ENHANCED_3D' ? '3D ACTIVE' : 'BASELINE'}</span>
        </div>
        <div className="absolute bottom-1.5 right-1.5 text-2xs font-mono text-soc-textSecondary bg-soc-panel/85 px-1.5 py-0.5 rounded-sm border border-soc-border tabular-nums">
          CONF: <span className="text-soc-text">{authStage === 'SCANNING' ? confidence : '99.4'}%</span>
        </div>
      </div>

      {/* Sensor Metadata Footer */}
      <div className="px-3.5 py-2.5 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-2xs text-soc-textMuted font-mono">
            <Cpu className="w-2.5 h-2.5" />
            VECTOR HASH
          </span>
          <span className="text-2xs text-soc-text font-mono">{vectorHash}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xs text-soc-textMuted font-mono">PRIVACY STANDARD</span>
          <span className="text-2xs text-soc-ok font-mono">ZERO RAW PERSISTENCE · ISO 30107-3</span>
        </div>
      </div>
    </div>
  );
}
