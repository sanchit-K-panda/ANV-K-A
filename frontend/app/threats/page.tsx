'use client';

import React from 'react';
import { MOCK_THREAT_RECURRENCE } from '@/lib/mockData';
import { ArrowRight } from 'lucide-react';

export default function ThreatsPage() {
  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>THREAT RECURRENCE</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Threat Recurrence Intelligence</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Detection of unresolved recurring threat signatures hitting SOC assets without root-cause remediation.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {MOCK_THREAT_RECURRENCE.length} recurring signatures
        </span>
      </div>

      {/* Threat recurrence records */}
      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {MOCK_THREAT_RECURRENCE.map((t) => (
          <div key={t.threat_id} className="soc-panel card-hover overflow-hidden">
            <div className="soc-panel-header">
              <div className="min-w-0">
                <div className="text-xs font-medium text-soc-text truncate">{t.name}</div>
                <div className="font-mono text-2xs text-soc-textMuted mt-0.5">
                  {t.threat_id} · {t.category}
                </div>
              </div>
              <span
                className={`soc-badge ${
                  t.recurrence_score >= 80 ? 'badge-critical' : t.recurrence_score >= 50 ? 'badge-high' : 'badge-medium'
                }`}
              >
                RECURRENCE SCORE: {t.recurrence_score} / 100
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Incident chain progression */}
              <div className="bg-soc-overlay rounded-lg p-3 space-y-2">
                <div className="panel-label">Incident Chain Progression</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {t.incident_chain.map((inc, idx) => (
                    <React.Fragment key={inc}>
                      <span className="px-2 py-0.5 bg-soc-raised border border-soc-border rounded-lg font-mono text-2xs text-soc-text tabular-nums">
                        {inc}
                      </span>
                      {idx < t.incident_chain.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-soc-textDim" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Observation grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-soc-overlay rounded-lg">
                  <div className="panel-label mb-1">First Seen</div>
                  <div className="font-mono text-2xs text-soc-text tabular-nums">{t.first_seen}</div>
                </div>
                <div className="p-3 bg-soc-overlay rounded-lg">
                  <div className="panel-label mb-1">Last Seen</div>
                  <div className="font-mono text-2xs text-soc-text tabular-nums">{t.last_seen}</div>
                </div>
                <div className="p-3 bg-soc-overlay rounded-lg">
                  <div className="panel-label mb-1">Target Assets</div>
                  <div className="font-mono text-2xs text-soc-text">{t.affected_assets.join(', ')}</div>
                </div>
                <div className="p-3 bg-soc-overlay rounded-lg">
                  <div className="panel-label mb-1">Resolution History</div>
                  <div className="text-2xs text-soc-crit font-medium leading-relaxed">{t.resolution_history}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
