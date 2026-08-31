'use client';

import React from 'react';
import { MOCK_THREAT_RECURRENCE } from '@/lib/mockData';
import { ArrowRight } from 'lucide-react';

export default function ThreatsPage() {
  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              PUNARĀVṚTTI
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Threat Recurrence Intelligence
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Detection of unresolved recurring threat signatures hitting SOC assets without root-cause remediation.
          </p>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {MOCK_THREAT_RECURRENCE.map((t) => (
          <div key={t.threat_id} className="p-4 bg-[#0C0E12] border border-[#232732] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232732] pb-2">
              <div>
                <span className="text-xs font-bold text-white font-sans">{t.name}</span>
                <div className="text-[10px] text-[#848B98]">{t.threat_id} · {t.category}</div>
              </div>
              <span className="text-white font-bold text-xs bg-[#1C2029] px-2 py-0.5 border border-[#4A5162]">
                RECURRENCE SCORE: {t.recurrence_score} / 100
              </span>
            </div>

            <div className="p-2.5 bg-[#060709] border border-[#232732] space-y-1.5">
              <div className="text-[10px] text-[#656C7A] uppercase font-bold">INCIDENT CHAIN PROGRESSION:</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {t.incident_chain.map((inc, idx) => (
                  <React.Fragment key={inc}>
                    <span className="px-2 py-0.5 bg-[#14171E] border border-[#3A4050] font-bold text-white text-[10px]">
                      {inc}
                    </span>
                    {idx < t.incident_chain.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[#656C7A]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">First Seen</div>
                <div className="font-semibold text-white mt-0.5">{t.first_seen}</div>
              </div>
              <div className="p-2 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Last Seen</div>
                <div className="font-semibold text-white mt-0.5">{t.last_seen}</div>
              </div>
              <div className="p-2 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Target Assets</div>
                <div className="font-semibold text-white mt-0.5">{t.affected_assets.join(', ')}</div>
              </div>
              <div className="p-2 bg-[#060709] border border-[#232732]">
                <div className="text-[#656C7A]">Resolution Gap</div>
                <div className="font-semibold text-white mt-0.5">{t.resolution_history}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
