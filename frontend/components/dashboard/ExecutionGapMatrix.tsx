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
        <div className="lg:col-span-7 p-3 rounded border border-soc-border bg-soc-raised/40 space-y-2">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-soc-textMuted mb-1">
            SOP Execution vs Forensic Telemetry
          </div>
          <div className="space-y-1">
            {steps.map((s, idx) => {
              const isFailed = !s.actual;
              return (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded border flex items-center justify-between gap-3 transition-colors ${
                    isFailed
                      ? 'bg-soc-panel border-red-500/30 dark:border-red-500/30'
                      : 'bg-soc-panel border-soc-border'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-4 h-4 rounded-sm flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 ${
                        isFailed
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                      aria-hidden="true"
                    >
                      {isFailed ? '✕' : '✓'}
                    </span>
                    <span className={`text-xs font-mono truncate ${isFailed ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-soc-text'}`}>{s.name}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.note && (
                      <span className="text-[11px] text-soc-textMuted hidden md:inline font-mono">{s.note}</span>
                    )}
                    {s.duration && (
                      <span className="col-mono hidden sm:inline text-[11px]">{s.duration}</span>
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
        <div className="lg:col-span-5 p-3 rounded border border-soc-border bg-soc-raised/40 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-soc-textMuted mb-1">
            <FileSearch className="w-3.5 h-3.5 text-soc-accent" />
            <span>Negative Space · Omitted Forensics</span>
          </div>

          <div className="space-y-2">
            {negativeSpaceItems.map((item) => (
              <div key={item.label} className="p-2.5 bg-soc-panel border border-soc-border rounded space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-soc-text">{item.label}</span>
                  <span className="font-mono text-[11px] text-red-600 dark:text-red-400 font-bold tabular-nums">
                    {item.missing} missing {item.unit}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-soc-textMuted font-mono tabular-nums">
                  <span>Expected: {item.expected}</span>
                  <span>Observed: <span className="text-soc-text font-semibold">{item.observed}</span></span>
                </div>
                {/* Ratio Bar */}
                <div className="w-full h-1.5 rounded-sm bg-soc-raised overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(item.observed / item.expected) * 100}%` }}
                  />
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(item.missing / item.expected) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-soc-panel border border-soc-border rounded text-[11px] text-soc-textMuted leading-relaxed">
            Negative-space analysis proved that <strong className="text-soc-text font-semibold">83 critical alerts were dismissed</strong> without mandatory forensic memory dumps required under Directive 4.2.
          </div>
        </div>
      </div>
    </div>
  );
};
