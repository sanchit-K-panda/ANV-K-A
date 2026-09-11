'use client';

import React from 'react';

export default function RiskPage() {
  const [factors, setFactors] = React.useState([
    { name: 'Investigation Gap (VIVEKA)', score: 31, weight: '34%', desc: '83 ransomware alerts closed with 0 memory dumps', category: 'SOP_VIOLATION' },
    { name: 'Escalation Anomaly (VIKĀRA)', score: 24, weight: '26%', desc: 'High severity bypassed Tier 2/3 supervisor queue', category: 'TIER_BYPASS' },
    { name: 'Negative Space (ABHĀVA)', score: 18, weight: '20%', desc: 'Missing memory dumps and host isolation telemetry', category: 'VOID_TELEMETRY' },
    { name: 'Closure Dwell Anomaly', score: 11, weight: '12%', desc: 'Average closure dwell time 42s vs 44m human baseline', category: 'DWELL_ANOMALY' },
    { name: 'Threat Recurrence (PUNARĀVṚTTI)', score: 7, weight: '8%', desc: 'Second unresolved attack instance targeting DC-PROD-01', category: 'PERSISTENCE' },
  ]);

  const totalScore = factors.reduce((acc, f) => acc + f.score, 0);

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-3xs font-mono text-soc-textMuted mb-1">
            <span className="font-bold text-soc-text">ANVĪKṢA</span>
            <span>/</span>
            <span>RISK_QUANTIFICATION</span>
            <span>/</span>
            <span className="text-soc-accent font-bold">MĀN ENGINE</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-soc-text flex items-center gap-2.5">
            <span>Bayesian Risk Decomposition &amp; Factor Quantification</span>
            <span className="h-2 w-2 rounded-full bg-soc-crit" />
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Deterministic additive factor model · Linear penalty weights · Zero-knowledge verifiable risk vectors
          </p>
        </div>

        <div className="flex items-center gap-2 text-3xs font-mono">
          <span className="px-2.5 py-1 rounded-md border border-soc-accent/30 bg-soc-accent/10 text-soc-accent font-bold">
            MODEL: MĀN-BAYES-v2
          </span>
        </div>
      </div>

      {/* Formula Strip */}
      <div className="p-3.5 rounded-lg border border-soc-border bg-soc-raised/40 font-mono text-xs text-soc-text flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-soc-accent font-bold uppercase text-3xs">Mathematical Basis:</span>
          <code className="text-2xs font-bold text-soc-text bg-soc-panel px-2 py-0.5 rounded border border-soc-border">
            Risk_Total = Σ(w_i · S_i) · (1 + γ · Recurrence_Penalty)
          </code>
        </div>
        <div className="text-3xs text-soc-ok font-semibold">
          SAKṢĪ AUDIT SEAL: VERIFIED (0x5E88...42D8)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Composite SOC risk gauge */}
        <div className="lg:col-span-4 soc-panel card-hover overflow-hidden self-start animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="soc-panel-header">
            <div>
              <span className="panel-label">Composite Enclave Risk</span>
              <p className="text-3xs font-mono text-soc-textMuted mt-0.5">MĀN Additive Weights</p>
            </div>
            <span className="soc-badge badge-critical">P &lt; 0.001</span>
          </div>
          <div className="p-5 space-y-5 bg-soc-panel">
            <div className="text-center space-y-2 py-2">
              <div className="font-mono text-5xl font-extrabold text-soc-crit tabular-nums tracking-tight font-display">
                {totalScore} <span className="text-base text-soc-textMuted font-normal">/ 100</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full border border-soc-crit/40 bg-soc-crit/10 text-soc-crit font-mono text-3xs font-bold uppercase tracking-wider">
                CRITICAL OPERATIONAL RISK
              </div>
            </div>

            <div className="border-t border-soc-border pt-2 space-y-1">
              <div className="kv-row">
                <span className="kv-key">Enclave Scope</span>
                <span className="kv-val font-mono font-bold text-soc-text">SOC-04 (PROD)</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Statistical Confidence</span>
                <span className="kv-val font-mono font-bold text-soc-accent tabular-nums">94.2%</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Quantification Engine</span>
                <span className="kv-val font-mono text-xs">MĀN Multi-Factor</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Air-Gap Status</span>
                <span className="kv-val font-mono text-soc-ok font-bold">100% LOCAL ISOLATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk factor decomposition */}
        <div className="lg:col-span-8 soc-panel card-hover overflow-hidden animate-fade-up bg-soc-panel" style={{ animationDelay: '120ms' }}>
          <div className="soc-panel-header">
            <div className="flex items-center gap-2">
              <span className="panel-label">Risk Factor Decomposition (MĀN)</span>
              <span className="soc-badge badge-accent">5 FACTORS</span>
            </div>
            <span className="font-mono text-xs font-bold text-soc-crit tabular-nums">
              Net Score: +{totalScore} pts
            </span>
          </div>

          <div className="divide-y divide-soc-border">
            {factors.map((rf) => (
              <div key={rf.name} className="px-5 py-4 flex items-center gap-4 hover:bg-soc-raised/40 transition-colors">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-soc-text font-display">{rf.name}</span>
                      <span className="text-3xs font-mono text-soc-textDim px-1.5 py-0.5 rounded bg-soc-raised">
                        {rf.category}
                      </span>
                    </div>
                    <span className="font-mono text-2xs text-soc-accent font-bold tabular-nums whitespace-nowrap">
                      Weight: {rf.weight}
                    </span>
                  </div>
                  <div className="risk-factor-bar h-2 bg-soc-raised">
                    <div
                      className={`risk-factor-fill ${
                        rf.score >= 25
                          ? 'bg-soc-crit'
                          : rf.score >= 15
                          ? 'bg-soc-high'
                          : 'bg-soc-accent'
                      }`}
                      style={{ width: `${(rf.score / 40) * 100}%` }}
                    />
                  </div>
                  <div className="text-2xs font-mono text-soc-textSecondary">{rf.desc}</div>
                </div>
                <div className="text-right pl-3">
                  <span className="font-mono text-base font-bold text-soc-crit tabular-nums whitespace-nowrap">
                    +{rf.score}
                  </span>
                  <div className="text-3xs font-mono text-soc-textMuted uppercase">PTS</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
