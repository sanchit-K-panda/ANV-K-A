'use client';

import React from 'react';
import { MOCK_THREAT_RECURRENCE } from '@/lib/mockData';
import { ArrowRight } from 'lucide-react';

export default function ThreatsPage() {
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
            <span className="h-2 w-2 rounded-full bg-soc-crit" />
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Detection of unresolved recurring threat signatures hitting SOC assets without root-cause remediation
          </p>
        </div>
        <span className="font-mono text-3xs text-soc-accent font-bold px-2.5 py-1 rounded-md bg-soc-accentDim border border-soc-accent/30 tabular-nums">
          {MOCK_THREAT_RECURRENCE.length} RECURRING SIGNATURES TRACKED
        </span>
      </div>

      {/* Threat recurrence records */}
      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {MOCK_THREAT_RECURRENCE.map((t) => (
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
                  t.recurrence_score >= 80 ? 'badge-critical font-bold' : t.recurrence_score >= 50 ? 'badge-high font-bold' : 'badge-medium'
                }`}
              >
                RECURRENCE SCORE: {t.recurrence_score} / 100
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Incident chain progression */}
              <div className="bg-soc-overlay/90 rounded-lg p-3.5 space-y-2 border border-soc-border">
                <div className="panel-label">Incident Chain Progression</div>
                <div className="flex flex-wrap items-center gap-2">
                  {t.incident_chain.map((inc, idx) => (
                    <React.Fragment key={inc}>
                      <span className="px-2.5 py-1 bg-soc-raised border border-soc-borderStrong/70 rounded-md font-mono text-xs font-bold text-soc-text tabular-nums shadow-sm">
                        {inc}
                      </span>
                      {idx < t.incident_chain.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-soc-accent flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Observation grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-soc-overlay rounded-lg border border-soc-border">
                  <div className="panel-label mb-1 text-3xs">First Seen</div>
                  <div className="font-mono text-2xs font-bold text-soc-text tabular-nums">{t.first_seen}</div>
                </div>
                <div className="p-3 bg-soc-overlay rounded-lg border border-soc-border">
                  <div className="panel-label mb-1 text-3xs">Last Seen</div>
                  <div className="font-mono text-2xs font-bold text-soc-accent tabular-nums">{t.last_seen}</div>
                </div>
                <div className="p-3 bg-soc-overlay rounded-lg border border-soc-border">
                  <div className="panel-label mb-1 text-3xs">Target Assets</div>
                  <div className="font-mono text-2xs font-bold text-soc-text">{t.affected_assets.join(', ')}</div>
                </div>
                <div className="p-3 bg-soc-overlay rounded-lg border border-soc-border">
                  <div className="panel-label mb-1 text-3xs">Resolution History</div>
                  <div className="text-2xs text-soc-crit font-bold leading-relaxed">{t.resolution_history}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
