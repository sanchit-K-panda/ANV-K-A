'use client';

import React from 'react';
import { MOCK_THREAT_RECURRENCE } from '@/lib/mockData';
import { ArrowRight, Activity } from 'lucide-react';

export default function ThreatsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Threat Recurrence Intelligence
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              PUNARĀVṚTTI
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Detection of unresolved recurring threat signatures hitting SOC assets without root-cause remediation.
          </p>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {MOCK_THREAT_RECURRENCE.map((t) => (
          <div key={t.threat_id} className="soc-panel p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="text-xs font-bold text-slate-900 font-sans">{t.name}</span>
                <div className="text-[10.5px] text-slate-500">{t.threat_id} · {t.category}</div>
              </div>
              <span className="text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                RECURRENCE SCORE: {t.recurrence_score} / 100
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Incident Chain Progression:</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {t.incident_chain.map((inc, idx) => (
                  <React.Fragment key={inc}>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 font-bold text-slate-900 text-[10.5px] rounded shadow-xs">
                      {inc}
                    </span>
                    {idx < t.incident_chain.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 text-[10px]">First Seen</div>
                <div className="font-semibold text-slate-900 mt-0.5">{t.first_seen}</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 text-[10px]">Last Seen</div>
                <div className="font-semibold text-slate-900 mt-0.5">{t.last_seen}</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 text-[10px]">Target Assets</div>
                <div className="font-semibold text-slate-900 mt-0.5">{t.affected_assets.join(', ')}</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 text-[10px]">Resolution History</div>
                <div className="font-semibold text-rose-700 mt-0.5">{t.resolution_history}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
