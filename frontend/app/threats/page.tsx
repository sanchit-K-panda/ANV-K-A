'use client';

import React, { useEffect, useState } from 'react';
import { fetchThreatRecurrence } from '@/lib/api';
import type { ThreatRecurrenceItem } from '@/types';
import { ArrowRight } from 'lucide-react';

export default function ThreatsPage() {
  const [items, setItems] = useState<ThreatRecurrenceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchThreatRecurrence('recurring_threat')
      .then((data) => { if (alive) setItems(data); })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : 'Backend unreachable'); });
    return () => { alive = false; };
  }, []);

  const loading = items === null && !error;

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-3xs font-mono text-soc-textMuted mb-1">
            <span className="font-bold text-soc-text">ANVĪKṢA</span>
            <span>/</span>
            <span>THREAT_RECURRENCE</span>
            <span>/</span>
            <span className="text-soc-accent font-bold">PUNARĀVṚTTI ENGINE</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-soc-text flex items-center gap-2.5">
            <span>Threat Recurrence Intelligence &amp; Persistence Tracking</span>
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Detection of unresolved recurring threat signatures hitting SOC assets without root-cause remediation
          </p>
        </div>
        <span className="font-mono text-3xs text-soc-accent font-bold px-2.5 py-1 rounded-md bg-soc-accentDim border border-soc-accent/30 tabular-nums">
          {items ? `${items.length} RECURRING SIGNATURES TRACKED` : '—'}
        </span>
      </div>

      {loading && (
        <div className="soc-panel p-8 text-center text-xs font-mono text-soc-textMuted animate-pulse">
          LOADING THREAT RECURRENCE MATRIX…
        </div>
      )}

      {error && (
        <div className="soc-panel p-8 text-center">
          <p className="text-xs font-mono text-red-500 mb-2">BACKEND UNREACHABLE — {error}</p>
          <p className="text-2xs text-soc-textMuted">
            This screen renders only backend-sourced threat telemetry.
          </p>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="soc-panel p-8 text-center text-xs font-mono text-emerald-500">
          ✓ NO RECURRING THREATS OBSERVED in the current dataset.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {items.map((t) => (
            <div key={t.threat_id} className="soc-panel card-hover overflow-hidden bg-soc-panel">
              <div className="soc-panel-header">
                <div className="min-w-0">
                  <div className="text-sm font-bold font-display text-soc-text truncate">{t.name}</div>
                  <div className="font-mono text-3xs text-soc-accent mt-0.5 font-bold">
                    {t.threat_id} · {t.category}
                  </div>
                </div>
                <span
                  className={`soc-badge ${
                    t.incident_count >= 5 ? 'badge-critical font-bold' : t.incident_count >= 2 ? 'badge-high font-bold' : 'badge-medium'
                  }`}
                >
                  {t.incident_count} INCIDENT{t.incident_count === 1 ? '' : 'S'}
                  {t.all_closed ? ' · ALL CLOSED' : ' · OPEN'}
                </span>
                <span className={`soc-badge ${t.remediation_applied ? 'badge-ok' : 'badge-critical'}`}>
                  {t.remediation_applied ? 'REMEDIATED' : 'NOT REMEDIATED'}
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Affected assets */}
                <div className="bg-soc-overlay/90 rounded-lg p-3.5 space-y-2 border border-soc-border">
                  <div className="panel-label">Affected Assets</div>
                  <div className="flex flex-wrap gap-2">
                    {t.affected_assets.length === 0 && (
                      <span className="font-mono text-2xs text-soc-textMuted">No assets linked in dataset</span>
                    )}
                    {t.affected_assets.slice(0, 12).map((a) => (
                      <span key={a} className="px-2.5 py-1 bg-soc-raised border border-soc-borderStrong/70 rounded-md font-mono text-xs font-bold text-soc-text tabular-nums shadow-sm">
                        {a}
                      </span>
                    ))}
                    {t.affected_assets.length > 12 && (
                      <span className="font-mono text-2xs text-soc-textMuted self-center">
                        +{t.affected_assets.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
