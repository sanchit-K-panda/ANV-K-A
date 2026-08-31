'use client';

import React from 'react';
import { Check, X, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface WorkflowStep {
  name: string;
  expectedStatus: 'PASS';
  observedStatus: 'PASS' | 'FAILED' | 'BYPASSED';
  timeExpected: string;
  timeObserved?: string;
  note?: string;
}

const STEPS: WorkflowStep[] = [
  {
    name: '1. Ingestion & Initial Triage',
    expectedStatus: 'PASS',
    observedStatus: 'PASS',
    timeExpected: '< 2 min',
    timeObserved: '16 sec',
    note: 'Alert acknowledged & classified as Ransomware',
  },
  {
    name: '2. Memory & Artifact Acquisition',
    expectedStatus: 'PASS',
    observedStatus: 'FAILED',
    timeExpected: '10 min',
    note: 'OMITTED: 0 memory dumps taken on DC-PROD-01',
  },
  {
    name: '3. Host Network Isolation',
    expectedStatus: 'PASS',
    observedStatus: 'FAILED',
    timeExpected: '< 5 min',
    note: 'OMITTED: No firewall block or endpoint isolation applied',
  },
  {
    name: '4. Tier-2/3 Escalation',
    expectedStatus: 'PASS',
    observedStatus: 'BYPASSED',
    timeExpected: '< 15 min',
    note: 'BYPASSED: Escalation queue avoided by analyst A-01',
  },
  {
    name: '5. Remediation & Closure',
    expectedStatus: 'PASS',
    observedStatus: 'FAILED',
    timeExpected: '44 min',
    timeObserved: '42 sec',
    note: 'ABNORMAL CLOSURE: Marked False Positive without verification',
  },
];

export function WorkflowGapDiagram() {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 font-mono select-none shadow-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            SOP Execution vs Observed Actions (FND-EXEC-001)
          </h3>
        </div>
        <Link
          href="/findings/FND-EXEC-001"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <span>Finding Detail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {STEPS.map((step, idx) => {
          const isPassed = step.observedStatus === 'PASS';
          const isFailed = step.observedStatus === 'FAILED';
          const isBypassed = step.observedStatus === 'BYPASSED';

          return (
            <div
              key={idx}
              className={`p-3.5 border rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                isPassed
                  ? 'bg-slate-50 border-slate-200'
                  : isFailed
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              {/* Step Title (4 cols) */}
              <div className="md:col-span-4 flex items-center gap-2.5">
                {isPassed ? (
                  <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                    ✕
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900">{step.name}</div>
                  <div className="text-[10px] text-slate-500">Target SLA: {step.timeExpected}</div>
                </div>
              </div>

              {/* Status Badge (3 cols) */}
              <div className="md:col-span-3">
                {isPassed && (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                    EXECUTED ({step.timeObserved})
                  </span>
                )}
                {isFailed && (
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full border border-rose-200">
                    ACTION OMITTED
                  </span>
                )}
                {isBypassed && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                    QUEUE BYPASSED
                  </span>
                )}
              </div>

              {/* Note (5 cols) */}
              <div className="md:col-span-5 text-xs font-sans text-slate-600 border-t md:border-t-0 md:border-l border-slate-200 pt-1.5 md:pt-0 md:pl-3">
                {step.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-slate-100 text-xs flex flex-wrap items-center justify-between text-slate-500">
        <div className="flex items-center gap-4">
          <span>Affected Alerts: <strong className="text-slate-900 font-semibold">83 cases</strong></span>
          <span>Target Asset: <strong className="text-slate-900 font-semibold">DC-PROD-01</strong></span>
          <span>Dwell Deviation: <strong className="text-rose-700 font-bold">-98.4%</strong></span>
        </div>
        <span className="text-rose-700 font-bold">RISK SCORE: 91/100</span>
      </div>
    </div>
  );
}
