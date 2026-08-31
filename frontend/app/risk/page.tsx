'use client';

import React from 'react';
import { MOCK_FINDINGS } from '@/lib/mockData';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function RiskPage() {
  const riskFactors = [
    { name: 'Investigation Gap', score: 31, weight: '34%', desc: '83 ransomware alerts closed with 0 memory dumps' },
    { name: 'Escalation Anomaly', score: 24, weight: '26%', desc: 'High severity bypassed Tier 2/3 supervisor queue' },
    { name: 'Negative Space', score: 18, weight: '20%', desc: 'Missing memory dumps and host isolation logs' },
    { name: 'Closure Anomaly', score: 11, weight: '12%', desc: 'Average closure dwell time <45 seconds' },
    { name: 'Threat Recurrence', score: 7, weight: '8%', desc: 'Second instance targeting DC-PROD-01' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Risk Quantification &amp; Factor Decomposition
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              MĀN
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Quantitative risk index calculated from uninvestigated alerts, negative space, and recurrence vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Main SOC Risk Gauge */}
        <div className="lg:col-span-4 soc-panel p-5 flex flex-col justify-between text-center space-y-3">
          <div>
            <div className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wider">
              COMPOSITE SOC RISK
            </div>
            <div className="text-4xl font-black text-rose-700 mt-3 font-mono">
              91 <span className="text-sm text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="text-xs text-rose-700 font-bold mt-1 bg-rose-50 border border-rose-200 py-0.5 rounded inline-block px-2">
              CRITICAL OPERATIONAL RISK
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-left text-xs space-y-1">
            <div className="text-slate-500">Scope: <strong className="text-slate-900">SOC-04</strong></div>
            <div className="text-slate-500">Confidence: <strong className="text-slate-900">94%</strong></div>
            <div className="text-slate-500">Engine: <strong className="text-slate-900">MĀN Additive Weights</strong></div>
          </div>
        </div>

        {/* Risk Breakdown Table */}
        <div className="lg:col-span-8 soc-panel p-5 space-y-3">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Risk Factor Decomposition (MĀN)
            </h2>
            <span className="text-rose-700 font-bold">TOTAL: +91 PTS</span>
          </div>

          <div className="space-y-2">
            {riskFactors.map((rf) => (
              <div
                key={rf.name}
                className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs font-sans">{rf.name}</div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">{rf.desc}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Factor Weight: {rf.weight}</div>
                </div>
                <span className="text-sm font-bold text-rose-700 font-mono">+{rf.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
