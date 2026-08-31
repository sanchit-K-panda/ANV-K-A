'use client';

import React from 'react';
import { Check, X, ArrowRight, ShieldAlert, FileSearch } from 'lucide-react';
import Link from 'next/link';

export const ExecutionGapMatrix: React.FC = () => {
  const steps = [
    { name: '1. Alert Ingestion', expected: true, actual: true, status: 'EXECUTED', duration: '16s' },
    { name: '2. Triage & Correlation', expected: true, actual: true, status: 'EXECUTED', duration: '24s' },
    { name: '3. Forensic Investigation', expected: true, actual: false, status: 'OMITTED (✕)', note: '0 memory dumps on DC-PROD-01' },
    { name: '4. Tier 2/3 Escalation', expected: true, actual: false, status: 'BYPASSED (✕)', note: 'Bypassed supervisor queue' },
    { name: '5. Containment & Response', expected: true, actual: true, status: 'PARTIAL', note: 'No host isolation applied' },
    { name: '6. Direct Closure', expected: true, actual: false, status: 'ABNORMAL (✕)', duration: '42s (44m baseline)' },
  ];

  const negativeSpaceItems = [
    { label: 'Investigations', expected: 80, observed: 17, missing: 63, unit: 'cases' },
    { label: 'Escalations', expected: 30, observed: 2, missing: 28, unit: 'cases' },
    { label: 'Evidence Logs', expected: 75, observed: 21, missing: 54, unit: 'artifacts' },
  ];

  return (
    <div className="soc-panel p-5 space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Execution Gap &amp; Negative-Space Evidence (VIVEKA + ABHĀVA)
          </h3>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <span>Deep Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Expected vs Actual Workflow (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
            SOP Execution vs Actual Actions
          </div>
          <div className="space-y-1.5 text-xs">
            {steps.map((s, idx) => {
              const isFailed = !s.actual;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded border flex items-center justify-between ${
                    isFailed
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFailed ? (
                      <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                        ✕
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 font-sans">{s.name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    {s.note && (
                      <span className="text-slate-500 hidden sm:inline font-sans">{s.note}</span>
                    )}
                    <span
                      className={`font-mono font-bold ${
                        isFailed ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Negative Space Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileSearch className="w-3.5 h-3.5 text-blue-600" />
            <span>Negative Space (What Was Omitted?)</span>
          </div>

          <div className="space-y-2">
            {negativeSpaceItems.map((item) => (
              <div
                key={item.label}
                className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 font-sans">{item.label}</span>
                  <span className="text-rose-700 font-bold font-mono">
                    {item.missing} missing {item.unit}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Expected: {item.expected}</span>
                  <span>Observed: {item.observed}</span>
                </div>
                {/* Visual Ratio Bar */}
                <div className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${(item.observed / item.expected) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(item.missing / item.expected) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-100 rounded text-[11px] font-sans text-slate-600 leading-snug">
            Negative space analysis proved that <strong className="text-slate-900 font-semibold">83 critical alerts were dismissed</strong> without the mandatory forensic memory acquisition steps required under SOC Directive 4.2.
          </div>
        </div>
      </div>
    </div>
  );
};
