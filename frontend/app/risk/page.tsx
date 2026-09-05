'use client';

import React from 'react';

export default function RiskPage() {
  const riskFactors = [
    { name: 'Investigation Gap', score: 31, weight: '34%', desc: '83 ransomware alerts closed with 0 memory dumps' },
    { name: 'Escalation Anomaly', score: 24, weight: '26%', desc: 'High severity bypassed Tier 2/3 supervisor queue' },
    { name: 'Negative Space', score: 18, weight: '20%', desc: 'Missing memory dumps and host isolation logs' },
    { name: 'Closure Anomaly', score: 11, weight: '12%', desc: 'Average closure dwell time <45 seconds' },
    { name: 'Threat Recurrence', score: 7, weight: '8%', desc: 'Second instance targeting DC-PROD-01' },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>RISK</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Risk Quantification &amp; Factor Decomposition</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Quantitative risk index calculated from uninvestigated alerts, negative space, and recurrence vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Composite SOC risk gauge */}
        <div className="lg:col-span-4 soc-panel card-hover overflow-hidden self-start animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="soc-panel-header">
            <div>
              <span className="panel-label">Composite SOC Risk</span>
              <p className="text-2xs text-soc-textMuted mt-0.5">MĀN additive weights</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div className="text-center space-y-3">
              <div className="font-mono text-4xl font-semibold text-soc-crit tabular-nums tracking-tight">
                91 <span className="text-sm text-soc-textMuted font-normal">/ 100</span>
              </div>
              <span className="soc-badge badge-critical">CRITICAL OPERATIONAL RISK</span>
            </div>

            <div className="border-t border-soc-border">
              <div className="kv-row">
                <span className="kv-key">Scope</span>
                <span className="kv-val font-medium text-soc-text">SOC-04</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Confidence</span>
                <span className="kv-val font-mono tabular-nums">94%</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Engine</span>
                <span className="kv-val">MĀN Additive Weights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk factor decomposition */}
        <div className="lg:col-span-8 soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="soc-panel-header">
            <span className="panel-label">Risk Factor Decomposition (MĀN)</span>
            <span className="font-mono text-2xs font-semibold text-soc-crit tabular-nums">Total: +91 pts</span>
          </div>

          <div className="divide-y divide-soc-border">
            {riskFactors.map((rf) => (
              <div key={rf.name} className="px-4 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs font-medium text-soc-text">{rf.name}</span>
                    <span className="font-mono text-2xs text-soc-textMuted tabular-nums whitespace-nowrap">
                      Weight {rf.weight}
                    </span>
                  </div>
                  <div className="risk-factor-bar">
                    <div className="risk-factor-fill" style={{ width: `${rf.score}%` }} />
                  </div>
                  <div className="text-2xs text-soc-textMuted">{rf.desc}</div>
                </div>
                <span className="font-mono text-sm font-semibold text-soc-text tabular-nums whitespace-nowrap">
                  +{rf.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
