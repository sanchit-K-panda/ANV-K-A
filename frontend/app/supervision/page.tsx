'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RadarChart, RadarAxis, RadarSeries } from '@/components/RadarChart';
import SimulateModal from '@/components/SimulateModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RankingFactor {
  name: string;
  points: number;
  metric: string;
  observed_value: number;
  reason: string;
}

interface CapabilityArea {
  area: string;
  label: string;
  score: number;
  max_score: number;
  factors: RankingFactor[];
}

interface SocRanking {
  soc_id: string;
  soc_name: string;
  rank: number;
  total_penalty: number;
  grade: string;
  worst_area: string;
  sample_size: Record<string, number>;
  capability_areas: CapabilityArea[];
}

interface RankingResponse {
  method: string;
  source: string;
  ranked_count: number;
  top_soc: string | null;
  top_reason: string | null;
  rankings: SocRanking[];
}

interface ExaminerSample {
  case_id: string;
  soc_id: string;
  analyst_id: string;
  severity: string;
  review_score: number;
  reasons: string[];
  factors: Record<string, number>;
  created_at: string | null;
  closed_at: string | null;
  incident_ref: string | null;
  alert_refs: string[];
  asset_refs: string[];
}

interface ExaminerResponse {
  soc_id: string | null;
  method: string;
  queue_size: number;
  cap: number;
  queue: ExaminerSample[];
}

interface DossierResponse {
  soc_id: string;
  soc_name: string;
  generated_at: string;
  grade: string;
  total_penalty: number;
  rank: number;
  total_ranked: number;
  worst_area: string;
  sha256_seal: string;
  markdown_content: string;
  summary_data: Record<string, any>;
  samples: ExaminerSample[];
}

// 8 Standard PS Capability Axes
const CAPABILITY_AXES: RadarAxis[] = [
  { key: 'threat_detection', label: 'Detection', shortLabel: 'DET' },
  { key: 'investigation', label: 'Investigation', shortLabel: 'INV' },
  { key: 'escalation', label: 'Escalation', shortLabel: 'ESC' },
  { key: 'incident_response', label: 'Response', shortLabel: 'RES' },
  { key: 'security_operations', label: 'SecOps', shortLabel: 'OPS' },
  { key: 'governance', label: 'Governance', shortLabel: 'GOV' },
  { key: 'operational_discipline', label: 'Discipline', shortLabel: 'DIS' },
  { key: 'cyber_resilience', label: 'Resilience', shortLabel: 'CYB' },
];

function gradeClasses(grade: string): string {
  switch (grade) {
    case 'CRITICAL_ATTENTION':
      return 'bg-red-500/15 text-red-500 border-red-500/40';
    case 'NEEDS_ATTENTION':
      return 'bg-orange-500/15 text-orange-500 border-orange-500/40';
    case 'WATCH':
      return 'bg-amber-500/15 text-amber-600 border-amber-500/40';
    default:
      return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40';
  }
}

function gradeLabel(grade: string): string {
  return grade.replace(/_/g, ' ');
}

export default function SupervisionPage() {
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Single SOC Selection
  const [selectedSoc, setSelectedSoc] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Head-to-head Comparison Mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareSocB, setCompareSocB] = useState<string | null>(null);

  // Examiner Review Queue
  const [queue, setQueue] = useState<ExaminerResponse | null>(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);

  // Human-in-the-Loop Actions State
  const [caseActions, setCaseActions] = useState<Record<string, { status: string; timestamp: string }>>({});
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Dossier Export Modal State
  const [dossierModal, setDossierModal] = useState<boolean>(false);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [dossierData, setDossierData] = useState<DossierResponse | null>(null);

  // Simulation Modal State
  const [isSimulateOpen, setIsSimulateOpen] = useState<boolean>(false);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    setRankingError(null);
    try {
      const res = await fetch(`${API_BASE}/supervisory/ranking`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
      const data: RankingResponse = await res.json();
      setRanking(data);
      if (data.rankings.length > 0) {
        if (!selectedSoc) setSelectedSoc(data.rankings[0].soc_id);
        if (!compareSocB && data.rankings.length > 1) {
          setCompareSocB(data.rankings[1].soc_id);
        }
      }
    } catch (err) {
      setRankingError(err instanceof Error ? err.message : 'Failed to reach backend');
      setRanking(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQueue = useCallback(async (socId: string) => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const res = await fetch(`${API_BASE}/supervisory/ranking/${socId}/samples?top_n=25`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
      setQueue(await res.json());
    } catch (err) {
      setQueueError(err instanceof Error ? err.message : 'Failed to load examiner queue');
      setQueue(null);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const loadDossier = useCallback(async (socId: string) => {
    setDossierLoading(true);
    setDossierModal(true);
    try {
      const res = await fetch(`${API_BASE}/supervisory/ranking/${socId}/dossier?top_n=15`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
      const data: DossierResponse = await res.json();
      setDossierData(data);
    } catch (err) {
      alert(`Failed to generate dossier: ${err instanceof Error ? err.message : 'Error'}`);
      setDossierModal(false);
    } finally {
      setDossierLoading(false);
    }
  }, []);

  const handleExaminerAction = async (caseId: string, actionType: string) => {
    const ts = new Date().toLocaleTimeString();
    setCaseActions(prev => ({
      ...prev,
      [caseId]: { status: actionType, timestamp: ts },
    }));
    try {
      const res = await fetch(`${API_BASE}/supervisory/examiner/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          soc_id: selectedSoc || 'SOC-001',
          action_type: actionType,
          examiner_notes: 'Supervisory directive issued from live examiner console.',
          examiner_id: 'EXAMINER-NTRO-01',
        }),
      });
      const data = await res.json();
      const shortHash = data.audit_hash ? data.audit_hash.substring(0, 8) : 'SHA-256';
      setActionToast(`Case ${caseId}: recorded "${actionType}" [Block: ${shortHash}...] into SAKṢĪ.`);
    } catch {
      setActionToast(`Case ${caseId}: recorded "${actionType}" into local supervisory ledger.`);
    }
    setTimeout(() => setActionToast(null), 4500);
  };

  const downloadDossierFile = () => {
    if (!dossierData) return;
    const blob = new Blob([dossierData.markdown_content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANVIKSA_DOSSIER_${dossierData.soc_id}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  useEffect(() => {
    if (selectedSoc) loadQueue(selectedSoc);
  }, [selectedSoc, loadQueue]);

  const selectedRanking = useMemo(
    () => ranking?.rankings.find(r => r.soc_id === selectedSoc) ?? null,
    [ranking, selectedSoc],
  );

  const compareRankingB = useMemo(
    () => ranking?.rankings.find(r => r.soc_id === compareSocB) ?? null,
    [ranking, compareSocB],
  );

  const drillArea = useMemo(
    () => selectedRanking?.capability_areas.find(a => a.area === selectedArea) ?? null,
    [selectedRanking, selectedArea],
  );

  const worstAreaOf = (r: SocRanking): CapabilityArea | null =>
    r.capability_areas.find(a => a.area === r.worst_area) ?? null;

  // Transform capability areas into Radar series data (0..100% capability score)
  const radarSeries: RadarSeries[] = useMemo(() => {
    if (!selectedRanking) return [];

    const getScores = (r: SocRanking) => {
      return CAPABILITY_AXES.map(axis => {
        const area = r.capability_areas.find(a => a.area === axis.key);
        if (!area || area.max_score === 0) return 100;
        // Invert penalty: Higher score = better capability
        const penaltyRatio = area.score / area.max_score;
        return Math.max(0, Math.round((1 - penaltyRatio) * 100));
      });
    };

    const series: RadarSeries[] = [
      {
        id: selectedRanking.soc_id,
        name: `${selectedRanking.soc_name} (${selectedRanking.soc_id})`,
        color: '#38bdf8', // Sky blue
        data: getScores(selectedRanking),
      },
    ];

    if (compareMode && compareRankingB) {
      series.push({
        id: compareRankingB.soc_id,
        name: `${compareRankingB.soc_name} (${compareRankingB.soc_id})`,
        color: '#f43f5e', // Rose/red
        data: getScores(compareRankingB),
      });
    }

    return series;
  }, [selectedRanking, compareRankingB, compareMode]);

  return (
    <div className="space-y-5 pb-16">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-emerald-500/40 bg-slate-950/90 text-emerald-400 font-mono text-xs shadow-2xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SUPERVISION</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-emerald-400 font-bold">SIH26157 SAT-SA</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text flex items-center gap-3">
            Cross-Organisation Supervision & Audit
            <span className="px-2 py-0.5 rounded text-3xs font-mono bg-soc-accent/10 border border-soc-accent/30 text-soc-accent">
              DECISION SUPPORT
            </span>
          </h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Supervisory evaluation of monitored SOCs across 8 PS capability areas — itemized, verifiable, and derived strictly from workflow exhaust.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`text-2xs font-mono px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 ${
              compareMode
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                : 'border-soc-border bg-soc-raised/40 text-soc-textSecondary hover:text-soc-text hover:border-soc-borderStrong'
            }`}
          >
            <span>⚔️</span>
            <span>{compareMode ? 'HEAD-TO-HEAD ON' : 'COMPARE SOCs'}</span>
          </button>

          {/* Export Dossier */}
          {selectedSoc && (
            <button
              onClick={() => loadDossier(selectedSoc)}
              className="text-2xs font-mono px-3 py-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-colors flex items-center gap-1.5"
            >
              <span>📄</span>
              <span>EXPORT AUDIT DOSSIER</span>
            </button>
          )}

          {/* Run Simulation */}
          <button
            onClick={() => setIsSimulateOpen(true)}
            className="text-2xs font-mono px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-colors flex items-center gap-1.5 font-bold shadow-sm shadow-cyan-950/40"
          >
            <span>⚡</span>
            <span>RUN SIMULATION</span>
          </button>

          <button
            onClick={() => loadRanking()}
            className="text-2xs font-mono px-2.5 py-1.5 rounded border border-soc-border text-soc-textSecondary hover:text-soc-text hover:border-soc-borderStrong transition-colors"
          >
            {loading ? 'SYNCING…' : 'REFRESH'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="soc-panel p-8 text-center text-xs font-mono text-soc-textMuted animate-pulse">
          EVALUATING CROSS-SOC CAPABILITY PROFILES…
        </div>
      )}

      {rankingError && (
        <div className="soc-panel p-8 text-center animate-fade-up">
          <p className="text-xs font-mono text-red-500 mb-2">BACKEND UNREACHABLE — {rankingError}</p>
          <p className="text-2xs text-soc-textMuted">
            Verify the FastAPI backend is running and datasets are generated.
          </p>
        </div>
      )}

      {ranking && ranking.rankings.length > 0 && (
        <>
          {/* Head-to-Head / Radar Section */}
          <div className="soc-panel overflow-hidden animate-fade-up" style={{ animationDelay: '40ms' }}>
            <div className="soc-panel-header">
              <div className="flex items-center gap-2">
                <span className="panel-label">8-Axis Capability Matrix</span>
                <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-soc-raised text-soc-textMuted border border-soc-border">
                  {compareMode ? 'HEAD-TO-HEAD COMPARISON' : 'CAPABILITY SPIDER'}
                </span>
              </div>
              <p className="text-2xs text-soc-textMuted">
                Higher area coverage (100%) indicates zero observed policy or discipline lag
              </p>
            </div>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Radar Visualizer */}
              <div className="lg:col-span-6 flex justify-center py-2">
                <RadarChart
                  axes={CAPABILITY_AXES}
                  series={radarSeries}
                  size={360}
                  showLegend={true}
                />
              </div>

              {/* Comparative Delta / Selector Panel */}
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primary Selector */}
                  <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-500/5">
                    <label className="block text-3xs font-mono text-sky-400 mb-1">PRIMARY INSPECTED SOC</label>
                    <select
                      value={selectedSoc ?? ''}
                      onChange={e => setSelectedSoc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-sky-500"
                    >
                      {ranking.rankings.map(r => (
                        <option key={r.soc_id} value={r.soc_id}>
                          #{r.rank} {r.soc_name} ({r.total_penalty} pts)
                        </option>
                      ))}
                    </select>
                    {selectedRanking && (
                      <div className="mt-2 text-2xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Grade:</span>
                          <span className={`font-mono px-1 rounded ${gradeClasses(selectedRanking.grade)}`}>
                            {gradeLabel(selectedRanking.grade)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Weakest Link:</span>
                          <span className="text-rose-400 font-mono font-medium">{selectedRanking.worst_area}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comparison Selector (Active if compareMode) */}
                  <div className={`p-3 rounded-lg border transition-all ${
                    compareMode
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-slate-800 bg-slate-900/30 opacity-60'
                  }`}>
                    <label className="block text-3xs font-mono text-rose-400 mb-1">BENCHMARK / COMPARISON SOC</label>
                    <select
                      disabled={!compareMode}
                      value={compareSocB ?? ''}
                      onChange={e => setCompareSocB(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-rose-500 disabled:opacity-50"
                    >
                      {ranking.rankings.map(r => (
                        <option key={r.soc_id} value={r.soc_id}>
                          #{r.rank} {r.soc_name} ({r.total_penalty} pts)
                        </option>
                      ))}
                    </select>
                    {compareRankingB && compareMode && (
                      <div className="mt-2 text-2xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Grade:</span>
                          <span className={`font-mono px-1 rounded ${gradeClasses(compareRankingB.grade)}`}>
                            {gradeLabel(compareRankingB.grade)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Weakest Link:</span>
                          <span className="text-rose-400 font-mono font-medium">{compareRankingB.worst_area}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Capability Delta Breakdown */}
                {compareMode && selectedRanking && compareRankingB && (
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2">
                    <span className="text-3xs font-mono text-slate-400">
                      HEAD-TO-HEAD CAPABILITY DELTA ({selectedRanking.soc_id} vs {compareRankingB.soc_id})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {CAPABILITY_AXES.map(axis => {
                        const a1 = selectedRanking.capability_areas.find(a => a.area === axis.key);
                        const a2 = compareRankingB.capability_areas.find(a => a.area === axis.key);
                        const p1 = a1?.score ?? 0;
                        const p2 = a2?.score ?? 0;
                        const delta = p2 - p1; // positive = SOC 1 is better (less penalty)

                        return (
                          <div key={axis.key} className="p-2 rounded bg-slate-950/80 border border-slate-800/80">
                            <div className="text-3xs text-slate-400 truncate">{axis.label}</div>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-2xs font-mono text-slate-200">
                                {p1} vs {p2}
                              </span>
                              <span className={`text-3xs font-mono font-bold ${
                                delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-500'
                              }`}>
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="soc-panel-header">
              <div>
                <span className="panel-label">Supervisory Organisation Leaderboard</span>
                <p className="text-2xs text-soc-textMuted mt-0.5">
                  {ranking.method} · {ranking.source}
                </p>
              </div>
              {ranking.top_reason && (
                <span className="text-2xs font-mono text-soc-textMuted hidden md:block">{ranking.top_reason}</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Organisation</th>
                    <th>Penalty Score</th>
                    <th>Grade</th>
                    <th>Primary Vulnerability</th>
                    <th className="text-right">Sample basis</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.rankings.map(r => {
                    const worst = worstAreaOf(r);
                    const isTop = r.rank === 1;
                    return (
                      <tr
                        key={r.soc_id}
                        onClick={() => { setSelectedSoc(r.soc_id); setSelectedArea(r.worst_area); }}
                        className={`cursor-pointer transition-colors ${selectedSoc === r.soc_id ? 'bg-soc-accent/5' : 'hover:bg-soc-raised/40'}`}
                      >
                        <td className={`font-mono text-sm tabular-nums font-bold ${isTop ? 'text-red-500' : 'text-soc-textSecondary'}`}>
                          #{r.rank}
                        </td>
                        <td className="text-soc-text font-medium">
                          {r.soc_name} <span className="col-mono">({r.soc_id})</span>
                          {isTop && <span className="soc-badge badge-critical ml-2">CRITICAL ATTENTION</span>}
                        </td>
                        <td className="font-mono text-2xs tabular-nums text-soc-text">{r.total_penalty} pts</td>
                        <td>
                          <span className={`soc-badge border ${gradeClasses(r.grade)}`}>{gradeLabel(r.grade)}</span>
                        </td>
                        <td className="text-2xs text-soc-textSecondary">
                          {worst ? worst.label : '—'}
                        </td>
                        <td className="col-mono text-right">
                          {r.sample_size.incidents ?? 0} inc / {r.sample_size.closed ?? 0} closed
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Capability breakdown + drill-down */}
          {selectedRanking && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
              {/* Area bars */}
              <div className={`soc-panel lg:col-span-2 ${selectedArea ? '' : 'lg:col-span-3'}`}>
                <div className="soc-panel-header">
                  <div>
                    <span className="panel-label">Capability Breakdown — {selectedRanking.soc_name}</span>
                    <p className="text-2xs text-soc-textMuted mt-0.5">Penalty points per area · click to drill down</p>
                  </div>
                </div>
                <div className="p-3 space-y-2.5">
                  {selectedRanking.capability_areas.map(a => {
                    const pct = a.max_score ? Math.min(100, Math.round((a.score / a.max_score) * 100)) : 0;
                    const active = selectedArea === a.area;
                    return (
                      <button
                        key={a.area}
                        onClick={() => setSelectedArea(active ? null : a.area)}
                        className={`w-full text-left rounded border px-3 py-2 transition-colors ${
                          active ? 'border-soc-accent/50 bg-soc-accent/5' : 'border-soc-border hover:border-soc-borderStrong'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xs font-medium text-soc-text">{a.label}</span>
                          <span className="font-mono text-2xs tabular-nums text-soc-textSecondary">
                            {a.score}/{a.max_score} pts
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-soc-raised overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 60 ? 'bg-red-500' : pct >= 30 ? 'bg-orange-500' : pct > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.max(pct, a.score > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Factor drill-down */}
              <div className={`soc-panel ${selectedArea ? 'lg:col-span-3' : 'hidden'}`}>
                <div className="soc-panel-header">
                  <div>
                    <span className="panel-label">
                      {drillArea ? `Factors — ${drillArea.label}` : 'Factor Detail'}
                    </span>
                    <p className="text-2xs text-soc-textMuted mt-0.5">
                      Every point carries a named factor and data-derived telemetry reason
                    </p>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {drillArea?.factors.length === 0 && (
                    <p className="text-2xs font-mono text-emerald-500 p-3">
                      ✓ No penalty factors observed in this capability area.
                    </p>
                  )}
                  {drillArea?.factors.map((f, i) => (
                    <div key={i} className="rounded border border-soc-border px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xs font-medium text-soc-text">{f.name}</span>
                        <span className={`font-mono text-2xs tabular-nums ${f.points > 0 ? 'text-orange-500' : 'text-soc-textMuted'}`}>
                          +{f.points} pts
                        </span>
                      </div>
                      <p className="text-2xs text-soc-textSecondary mt-1">{f.reason}</p>
                      <p className="font-mono text-3xs text-soc-textDim mt-1">
                        metric: {f.metric} = {f.observed_value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Examiner review queue + Decision Support Actions */}
          <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '160ms' }}>
            <div className="soc-panel-header">
              <div>
                <span className="panel-label">Examiner Inspection Queue — {selectedRanking?.soc_name ?? ''}</span>
                <p className="text-2xs text-soc-textMuted mt-0.5">
                  Prioritized case samples with concrete, verifiable reason strings for human supervisory review
                </p>
              </div>
              {queue && (
                <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
                  {queue.queue_size}/{queue.cap} prioritized cases
                </span>
              )}
            </div>

            {queueLoading && (
              <div className="p-6 text-center text-2xs font-mono text-soc-textMuted animate-pulse">
                SCORING WORKFLOW SAMPLES…
              </div>
            )}

            {queueError && (
              <div className="p-6 text-center text-2xs font-mono text-red-500">
                QUEUE UNAVAILABLE — {queueError}
              </div>
            )}

            {queue && !queueLoading && queue.queue.length === 0 && (
              <div className="p-6 text-center text-2xs font-mono text-emerald-500">
                ✓ No cases currently require examiner review for this SOC.
              </div>
            )}

            {queue && !queueLoading && queue.queue.length > 0 && (
              <div className="overflow-x-auto">
                <table className="soc-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Case</th>
                      <th>Severity</th>
                      <th>Analyst</th>
                      <th>Verifiable Examiner Reasons</th>
                      <th>Supervisory Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.queue.map((s, i) => {
                      const action = caseActions[s.case_id];
                      return (
                        <tr key={s.case_id} className="align-top">
                          <td className={`font-mono text-sm tabular-nums font-bold ${i === 0 ? 'text-red-500' : 'text-soc-textSecondary'}`}>
                            #{i + 1}
                          </td>
                          <td className="col-mono">
                            <span className="font-medium text-slate-200">{s.case_id}</span>
                            <div className="text-3xs text-slate-500">{s.review_score} pts</div>
                          </td>
                          <td>
                            <span className={`soc-badge ${s.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                              {s.severity}
                            </span>
                          </td>
                          <td className="col-mono">{s.analyst_id}</td>
                          <td className="max-w-md">
                            <ul className="space-y-1">
                              {s.reasons.map((reason, j) => (
                                <li key={j} className="text-2xs text-soc-textSecondary leading-snug">
                                  <span className="text-soc-textDim mr-1">▸</span>{reason}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            {action ? (
                              <div className="flex flex-col items-start gap-1">
                                <span className={`soc-badge border text-3xs font-mono ${
                                  action.status === 'AUDIT_FLAGGED'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                    : action.status === 'JUSTIFICATION_REQUESTED'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                }`}>
                                  {action.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-3xs font-mono text-slate-500">at {action.timestamp}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1 w-36">
                                <button
                                  onClick={() => handleExaminerAction(s.case_id, 'AUDIT_FLAGGED')}
                                  className="text-3xs font-mono px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-left"
                                >
                                  🚩 Flag On-Site Audit
                                </button>
                                <button
                                  onClick={() => handleExaminerAction(s.case_id, 'JUSTIFICATION_REQUESTED')}
                                  className="text-3xs font-mono px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors text-left"
                                >
                                  📝 Request Clarification
                                </button>
                                <button
                                  onClick={() => handleExaminerAction(s.case_id, 'POLICY_EXCEPTION')}
                                  className="text-3xs font-mono px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-left"
                                >
                                  🛡️ Mark Exception
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dossier Preview & Export Modal */}
      {dossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="text-base">📄</span>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Supervisory Examiner Audit Dossier
                </h3>
              </div>
              <button
                onClick={() => setDossierModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 flex-1">
              {dossierLoading && (
                <div className="text-center py-12 text-slate-400 animate-pulse">
                  COMPILING FORENSIC AUDIT DOSSIER & GENERATING CRYPTOGRAPHIC SEAL…
                </div>
              )}

              {dossierData && (
                <>
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 flex flex-wrap justify-between gap-2 text-2xs">
                    <div>
                      <span className="text-slate-500">ENTITY:</span>{' '}
                      <span className="text-sky-400 font-bold">{dossierData.soc_name} ({dossierData.soc_id})</span>
                    </div>
                    <div>
                      <span className="text-slate-500">GRADE:</span>{' '}
                      <span className={`px-1.5 py-0.5 rounded border ${gradeClasses(dossierData.grade)}`}>
                        {dossierData.grade}
                      </span>
                    </div>
                    <div className="w-full text-slate-500 pt-1 border-t border-slate-900 truncate">
                      SHA-256 SEAL: <span className="text-emerald-400 select-all">{dossierData.sha256_seal}</span>
                    </div>
                  </div>

                  <pre className="p-4 rounded bg-slate-950 border border-slate-800/80 text-3xs font-mono whitespace-pre-wrap text-slate-300 leading-relaxed max-h-[45vh] overflow-y-auto">
                    {dossierData.markdown_content}
                  </pre>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-3xs font-mono text-slate-500">
                100% Sovereign // Air-Gapped Verification Hash Included
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDossierModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono"
                >
                  Close
                </button>
                <button
                  onClick={downloadDossierFile}
                  disabled={!dossierData}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>⬇️</span>
                  <span>DOWNLOAD MARKDOWN (.MD)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Launcher Modal */}
      <SimulateModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSuccess={() => loadRanking()}
      />
    </div>
  );
}
