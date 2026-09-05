'use client';

import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
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
    <div className="soc-panel space-y-4 p-5 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-soc-crit" aria-hidden="true" />
          <h3 className="panel-label">SOP Execution vs Observed Actions (FND-EXEC-001)</h3>
        </div>
        <Link
          href="/findings/FND-EXEC-001"
          className="flex items-center gap-1 text-[11px] text-soc-accent transition-colors hover:text-soc-accentBright"
        >
          <span>Finding Detail</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
              className={`grid grid-cols-1 items-center gap-3 rounded-sm border p-3.5 md:grid-cols-12 ${
                isPassed
                  ? 'border-soc-border bg-soc-overlay'
                  : isFailed
                  ? 'border-soc-crit/40 bg-soc-critDim/60'
                  : 'border-soc-med/40 bg-soc-medDim/60'
              }`}
            >
              {/* Step Title (4 cols) */}
              <div className="flex items-center gap-2.5 md:col-span-4">
                {isPassed ? (
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center border border-soc-ok/40 bg-soc-okDim text-[10px] font-bold text-soc-ok"
                    aria-label="Step executed"
                  >
                    ✓
                  </span>
                ) : (
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center border border-soc-crit/40 bg-soc-critDim text-[10px] font-bold text-soc-crit"
                    aria-label="Step not executed"
                  >
                    ✕
                  </span>
                )}
                <div>
                  <div className="text-xs font-bold text-soc-text">{step.name}</div>
                  <div className="text-[10px] tabular-nums text-soc-textMuted">Target SLA: {step.timeExpected}</div>
                </div>
              </div>

              {/* Status Badge (3 cols) */}
              <div className="md:col-span-3">
                {isPassed && (
                  <span className="rounded-sm border border-soc-ok/30 bg-soc-okDim px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-soc-ok">
                    EXECUTED ({step.timeObserved})
                  </span>
                )}
                {isFailed && (
                  <span className="rounded-sm border border-soc-crit/30 bg-soc-critDim px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-soc-crit">
                    ACTION OMITTED
                  </span>
                )}
                {isBypassed && (
                  <span className="rounded-sm border border-soc-med/30 bg-soc-medDim px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-soc-med">
                    QUEUE BYPASSED
                  </span>
                )}
              </div>

              {/* Note (5 cols) */}
              <div className="border-t border-soc-border pt-1.5 font-sans text-xs text-soc-textSecondary md:col-span-5 md:border-l md:border-t-0 md:pl-3 md:pt-0">
                {step.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-soc-border pt-3 text-[11px] text-soc-textMuted">
        <div className="flex items-center gap-4">
          <span>Affected Alerts: <strong className="font-semibold tabular-nums text-soc-text">83 cases</strong></span>
          <span>Target Asset: <strong className="font-semibold text-soc-text">DC-PROD-01</strong></span>
          <span>Dwell Deviation: <strong className="font-bold tabular-nums text-soc-crit">-98.4%</strong></span>
        </div>
        <span className="font-bold text-soc-crit">RISK SCORE: 91/100</span>
      </div>
    </div>
  );
}
