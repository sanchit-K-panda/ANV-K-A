'use client';

import React from 'react';
import { MOCK_FINDINGS } from '@/lib/mockData';

export default function RiskPage() {
  const riskFactors = [
    { name: 'Investigation Gap', score: 31, weight: '34%' },
    { name: 'Escalation Anomaly', score: 24, weight: '26%' },
    { name: 'Negative Space', score: 18, weight: '20%' },
    { name: 'Closure Anomaly', score: 11, weight: '12%' },
    { name: 'Threat Recurrence', score: 7, weight: '8%' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              MĀN
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Risk Intelligence
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Quantitative risk index calculated from uninvestigated alerts, negative space, and recurrence vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Main SOC Risk Gauge */}
        <div className="lg:col-span-4 p-5 bg-[#0C0E12] border border-[#232732] flex flex-col justify-between text-center space-y-3">
          <div>
            <div className="text-[10px] text-[#656C7A] font-bold uppercase tracking-wider">
              COMPOSITE SOC RISK
            </div>
            <div className="text-4xl font-bold text-white mt-3">
              91 <span className="text-xs text-[#656C7A]">/ 100</span>
            </div>
            <div className="text-[11px] text-white font-bold mt-1">
              CRITICAL OPERATIONAL RISK
            </div>
          </div>

          <div className="p-2.5 bg-[#060709] border border-[#232732] text-left text-[11px] space-y-1">
            <div className="text-[#848B98]">Scope: <strong className="text-white">SOC-04</strong></div>
            <div className="text-[#848B98]">Confidence: <strong className="text-white">94%</strong></div>
            <div className="text-[#848B98]">Calculation: <strong className="text-white">Additive Linear Weights</strong></div>
          </div>
        </div>

        {/* Risk Breakdown Table */}
        <div className="lg:col-span-8 p-5 bg-[#0C0E12] border border-[#232732] space-y-3">
          <div className="border-b border-[#232732] pb-2">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
              RISK FACTOR DECOMPOSITION (MĀN)
            </h2>
          </div>

          <div className="space-y-1.5">
            {riskFactors.map((rf) => (
              <div
                key={rf.name}
                className="p-2.5 bg-[#060709] border border-[#232732] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white">{rf.name}</span>
                  <div className="text-[9px] text-[#656C7A]">Weight Contribution: {rf.weight}</div>
                </div>
                <span className="text-sm font-bold text-white">+{rf.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
