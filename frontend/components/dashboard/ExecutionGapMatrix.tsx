'use client';

import React from 'react';
import { ArrowRight, ShieldAlert, FileSearch } from 'lucide-react';
import Link from 'next/link';

export const ExecutionGapMatrix: React.FC = () => {
  const steps = [
    { name: '1. Alert Ingestion', expected: true, actual: true, status: 'EXECUTED', duration: '16s' },
    { name: '2. Triage & Correlation', expected: true, actual: true, status: 'EXECUTED', duration: '24s' },
    { name: '3. Forensic Investigation', expected: true, actual: false, status: 'OMITTED', note: '0 memory dumps on DC-PROD-01' },
    { name: '4. Tier 2/3 Escalation', expected: true, actual: false, status: 'BYPASSED', note: 'Bypassed supervisor queue' },
    { name: '5. Containment & Response', expected: true, actual: true, status: 'PARTIAL', note: 'No host isolation applied' },
    { name: '6. Direct Closure', expected: true, actual: false, status: 'ABNORMAL', duration: '42s (44m baseline)' },
  ];

  const negativeSpaceItems = [
    { label: 'Investigations', expected: 80, observed: 17, missing: 63, unit: 'cases' },
    { label: 'Escalations', expected: 30, observed: 2, missing: 28, unit: 'cases' },
    { label: 'Evidence Logs', expected: 75, observed: 21, missing: 54, unit: 'artifacts' },
  ];

  return (
    <div className="soc-panel select-none">
      {/* Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-soc-critDim flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-soc-crit" />
          </span>
          <h3 className="panel-label">Execution Gap &amp; Negative-Space Evidence</h3>
          <span className="soc-badge badge-neutral hidden md:inline-flex">VIVEKA + ABHĀVA</span>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-soc-accent hover:text-soc-accentBright font-medium flex items-center gap-1 transition-colors"
        >
          <span>Deep analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
        {/* Left: Expected vs Actual Workflow */}
        <div className="lg:col-span-7 p-4 rounded-lg bg-soc-overlay space-y-2.5">
          <div className="text-[11px] font-semibold text-soc-textSecondary mb-1">SOP execution vs actual actions</div>
          <div className="space-y-1.5">
            {steps.map((s, idx) => {
              const isFailed = !s.actual;
              return (
                <div
                  key={idx}
                  className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                    isFailed
                      ? 'bg-soc-critDim border-soc-crit/25'
                      : 'bg-soc-panel border-soc-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] flex-shrink-0 ${
                        isFailed
                          ? 'bg-soc-crit/10 text-soc-crit'
                          : 'bg-soc-ok/10 text-soc-ok'
                      }`}
                      aria-hidden="true"
                    >
                      {isFailed ? '✕' : '✓'}
                    </span>
                    <span className={`text-xs truncate ${isFailed ? 'text-soc-crit font-medium' : 'text-soc-text'}`}>{s.name}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {s.note && (
                      <span className="text-2xs text-soc-textMuted hidden md:inline">{s.note}</span>
                    )}
                    {s.duration && (
                      <span className="col-mono hidden sm:inline">{s.duration}</span>
                    )}
                    <span className={`soc-badge ${isFailed ? 'badge-critical' : 'badge-ok'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Negative Space Breakdown */}
        <div className="lg:col-span-5 p-4 rounded-lg bg-soc-overlay space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-soc-textSecondary mb-1">
            <FileSearch className="w-3.5 h-3.5 text-soc-accent" />
            <span>Negative space — what was omitted</span>
          </div>

          <div className="space-y-3">
            {negativeSpaceItems.map((item) => (
              <div key={item.label} className="p-3.5 bg-soc-panel border border-soc-border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-soc-text">{item.label}</span>
                  <span className="font-mono text-2xs text-soc-crit font-semibold tabular-nums">
                    {item.missing} missing {item.unit}
                  </span>
                </div>
                <div className="flex justify-between text-2xs text-soc-textMuted tabular-nums">
                  <span>Expected {item.expected}</span>
                  <span>Observed <span className="text-soc-textSecondary font-medium">{item.observed}</span></span>
                </div>
                {/* Visual Ratio Bar */}
                <div className="risk-factor-bar flex">
                  <div className="h-full bg-soc-ok" style={{ width: `${(item.observed / item.expected) * 100}%` }} />
                  <div className="h-full bg-soc-crit" style={{ width: `${(item.missing / item.expected) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-soc-panel border border-soc-border rounded-lg text-2xs text-soc-textSecondary leading-relaxed">
            Negative-space analysis proved that <span className="text-soc-text font-medium">83 critical alerts were dismissed</span> without the mandatory forensic memory acquisition steps required under SOC Directive 4.2.
          </div>
        </div>
      </div>
    </div>
  );
};
