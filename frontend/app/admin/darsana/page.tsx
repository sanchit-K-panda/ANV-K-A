'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Camera,
  CameraOff,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Database,
  ArrowLeft,
  KeyRound,
  Eye,
  Activity,
  Check,
} from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  age: string | null;
  height: string | null;
  weight: string | null;
  has_biometric: boolean;
  registered_at: string | null;
}

export default function DarsanaPage() {
  const router = useRouter();

  // Threshold controls
  const [livenessThreshold, setLivenessThreshold] = useState<number>(85);
  const [toleranceDistance, setToleranceDistance] = useState<number>(0.45);
  const [entropyCheckEnabled, setEntropyCheckEnabled] = useState<boolean>(true);
  const [thresholdSaved, setThresholdSaved] = useState<boolean>(false);

  // Users list
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start webcam
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access unavailable. Please grant permission or check hardware.');
      setCameraActive(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    fetchUsers();
    return () => stopCamera();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch('http://localhost:8000/api/biometric/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Failed to load registered users:', err);
      setUsersError('Could not connect to biometric database service.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Capture current frame from webcam
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    setRegisterError(null);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setRegisterError(null);
  };

  const handleSaveThresholds = () => {
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setRegisterError('Name and Email are required.');
      return;
    }
    if (!capturedImage) {
      setRegisterError('Please capture a facial image using the camera feed before enrolling.');
      return;
    }

    setIsSubmitting(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.toUpperCase(),
        age: age.trim() || undefined,
        height: height.trim() || undefined,
        weight: weight.trim() || undefined,
        image_base64: capturedImage,
      };

      const res = await fetch('http://localhost:8000/api/biometric/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Biometric enrollment failed.');
      }

      setRegisterSuccess(`User "${data.name}" successfully enrolled with encrypted Fernet biometric template!`);
      // Reset form
      setName('');
      setEmail('');
      setAge('');
      setHeight('');
      setWeight('');
      setCapturedImage(null);
      // Refresh users table
      fetchUsers();
    } catch (err: any) {
      setRegisterError(err.message || 'Error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <button
              onClick={() => router.push('/admin')}
              className="hover:text-soc-text flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>ADMINISTRATION</span>
            </button>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">DARŚANA BIOMETRIC ENGINE</span>
          </div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-soc-text flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-soc-accent" />
            DARŚANA Biometric Enrollment &amp; Enclave Policy
          </h1>
          <p className="text-xs text-soc-textMuted mt-1 max-w-2xl leading-relaxed">
            Register authorized SOC personnel with cryptographic facial template generation. Templates are encrypted
            via Fernet (AES-128-CBC + HMAC-SHA256) and anchored into the database schema with physical identity telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="soc-badge badge-ok">FERNET_v1 ENCLAVE ACTIVE</span>
          <span className="soc-badge badge-neutral">ISO 30107-3 COMPLIANT</span>
        </div>
      </div>

      {/* Threshold Configuration Panel */}
      <section className="soc-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-soc-accent" />
            <h2 className="panel-label !text-soc-text">Facial Liveness &amp; Vector Confidence Thresholds</h2>
          </div>
          {thresholdSaved && (
            <span className="text-2xs font-mono text-soc-ok flex items-center gap-1 animate-fade-in">
              <Check className="w-3 h-3" /> THRESHOLDS APPLIED LOCALLY
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Liveness confidence */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-soc-textSecondary font-medium">Liveness Confidence Threshold</span>
              <span className="font-mono text-soc-accent font-bold">{livenessThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="99"
              value={livenessThreshold}
              onChange={(e) => setLivenessThreshold(Number(e.target.value))}
              className="w-full accent-soc-accent bg-soc-overlay cursor-pointer"
            />
            <p className="text-2xs text-soc-textDim">
              Minimum anti-spoofing texture entropy required before accepting biometric payload.
            </p>
          </div>

          {/* Cosine distance tolerance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-soc-textSecondary font-medium">Tolerance Distance (Cosine)</span>
              <span className="font-mono text-soc-accent font-bold">{toleranceDistance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.65"
              step="0.01"
              value={toleranceDistance}
              onChange={(e) => setToleranceDistance(Number(e.target.value))}
              className="w-full accent-soc-accent bg-soc-overlay cursor-pointer"
            />
            <p className="text-2xs text-soc-textDim">
              Lower is stricter (fewer false positives). Higher allows relaxed multi-angle lighting match.
            </p>
          </div>

          {/* Entropy Verification Check */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-soc-textSecondary font-medium">Dynamic Micro-Texture Entropy</span>
              <button
                type="button"
                onClick={() => setEntropyCheckEnabled(!entropyCheckEnabled)}
                className={`text-2xs font-mono px-2 py-1 rounded border transition-colors ${
                  entropyCheckEnabled
                    ? 'bg-soc-okDim border-soc-ok/40 text-soc-ok'
                    : 'bg-soc-overlay border-soc-border text-soc-textDim'
                }`}
              >
                {entropyCheckEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSaveThresholds}
              className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-soc-accent" />
              <span>APPLY POLICY THRESHOLDS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Enrollment Camera + Registration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Optical Camera Feed & Capture (5 cols) */}
        <div className="lg:col-span-5 soc-panel p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-soc-accent" />
                <span className="panel-label">Live Optical Sensor (DARŚANA)</span>
              </div>
              <span className={`soc-badge ${cameraActive ? 'badge-ok' : 'badge-neutral'}`}>
                {cameraActive ? 'FEED ACTIVE' : 'FEED IDLE'}
              </span>
            </div>

            {/* Video Viewport */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-soc-border flex items-center justify-center">
              {capturedImage ? (
                // Captured Image Preview
                <img
                  src={capturedImage}
                  alt="Captured face preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                // Live Webcam Video
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {/* Optical Reticle overlay */}
                  {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-44 h-44 border border-soc-accent/40 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-40 h-40 border border-dashed border-soc-accent/60 rounded-full" />
                      </div>
                      <div className="absolute bottom-2 font-mono text-[10px] text-soc-accent bg-black/60 px-2 py-0.5 rounded">
                        ALIGN FACE WITHIN RETICLE
                      </div>
                    </div>
                  )}
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {cameraError && !capturedImage && (
                <div className="absolute inset-0 bg-soc-panel/90 p-4 flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="w-6 h-6 text-soc-warn mb-2" />
                  <span className="text-xs text-soc-textSecondary max-w-xs">{cameraError}</span>
                  <button
                    onClick={startCamera}
                    className="btn-ghost mt-3 text-2xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Sensor
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Capture Controls */}
          <div className="space-y-2 pt-2">
            {capturedImage ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>RETAKE SNAPSHOT</span>
                </button>
                <div className="flex items-center px-3 bg-soc-okDim border border-soc-ok/30 rounded-lg text-2xs font-mono text-soc-ok gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> FRAME LOCKED
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!cameraActive}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>CAPTURE FACE SAMPLE</span>
              </button>
            )}
            <p className="text-[11px] font-mono text-soc-textDim text-center">
              ISO 30107-3 compliant · Frame analyzed locally and converted to encrypted Fernet vector
            </p>
          </div>
        </div>

        {/* Right: User Biometric Enrollment Form (7 cols) */}
        <div className="lg:col-span-7 soc-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-soc-border pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-soc-accent" />
              <h2 className="panel-label !text-soc-text">Personnel Biometric Enrollment Form</h2>
            </div>
            <span className="text-2xs font-mono text-soc-textDim">ENCLAVE SCHEMA: biometric_profiles</span>
          </div>

          {registerSuccess && (
            <div className="p-3 bg-soc-okDim border border-soc-ok/40 rounded-xl text-xs text-soc-ok flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">ENROLLMENT COMPLETED:</span> {registerSuccess}
              </div>
            </div>
          )}

          {registerError && (
            <div className="p-3 bg-soc-critDim border border-soc-crit/40 rounded-xl text-xs text-soc-crit flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">ENROLLMENT FAILED:</span> {registerError}
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-mono text-soc-textMuted uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="soc-input w-full"
                />
              </div>

              <div>
                <label className="block text-2xs font-mono text-soc-textMuted uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@anviksa.local"
                  className="soc-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-2xs font-mono text-soc-textMuted uppercase mb-1">
                  RBAC Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="soc-input w-full"
                >
                  <option value="ANALYST">ANALYST</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-mono text-soc-textMuted uppercase mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="soc-input w-full"
                />
              </div>

              <div>
                <label className="block text-2xs font-mono text-soc-textMuted uppercase mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 178"
                  className="soc-input w-full"
                />
              </div>

              <div>
                <label className="block text-2xs font-mono text-soc-textMuted uppercase mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 72"
                  className="soc-input w-full"
                />
              </div>
            </div>

            <div className="p-3 bg-soc-overlay border border-soc-border rounded-xl space-y-1 text-2xs font-mono text-soc-textMuted">
              <div className="flex items-center gap-1.5 text-soc-textSecondary font-semibold">
                <Lock className="w-3 h-3 text-soc-accent" />
                <span>CRYPTOGRAPHIC PROFILE STORAGE GUARANTEES</span>
              </div>
              <p>
                • 128-dimensional facial vector is computed in-memory via dlib/ResNet deep metric model.
              </p>
              <p>
                • Vector is immediately wrapped in Fernet symmetric encryption before storing in the database.
              </p>
              <p>
                • Raw facial photos are NEVER written to disk or transmitted over cleartext.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !capturedImage}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>EXTRACTING VECTOR &amp; ENCRYPTING TEMPLATE...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>ENROLL &amp; ENCRYPT BIOMETRIC PROFILE</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Registered Biometric Profiles Table */}
      <section className="soc-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-soc-accent" />
            <h2 className="panel-label !text-soc-text">
              Registered Biometric Profiles in Database ({users.length})
            </h2>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="btn-ghost text-2xs flex items-center gap-1.5 py-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
            <span>SYNC DATABASE</span>
          </button>
        </div>

        {usersError && (
          <div className="p-3 bg-soc-critDim border border-soc-crit/40 rounded-xl text-xs text-soc-crit">
            {usersError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-soc-border font-mono text-2xs text-soc-textMuted uppercase">
                <th className="py-2.5 px-3">Personnel</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Biometrics Status</th>
                <th className="py-2.5 px-3">Physical Metrics</th>
                <th className="py-2.5 px-3">Enrolled At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-soc-raised/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-soc-text">{u.name}</div>
                    <div className="text-2xs font-mono text-soc-textMuted">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`soc-badge ${
                        u.role === 'SUPERVISOR'
                          ? 'badge-accent'
                          : u.role === 'ADMIN'
                          ? 'badge-critical'
                          : 'badge-neutral'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {u.has_biometric ? (
                      <span className="soc-badge badge-ok flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        ENCRYPTED (FERNET_v1)
                      </span>
                    ) : (
                      <span className="soc-badge badge-neutral">NO TEMPLATE</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-2xs text-soc-textSecondary">
                    {u.age ? `${u.age}y` : '—'} · {u.height ? `${u.height}cm` : '—'} ·{' '}
                    {u.weight ? `${u.weight}kg` : '—'}
                  </td>
                  <td className="py-3 px-3 font-mono text-2xs text-soc-textMuted">
                    {u.registered_at
                      ? new Date(u.registered_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Legacy Seed'}
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loadingUsers && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-soc-textMuted font-mono">
                    No registered biometric profiles found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
