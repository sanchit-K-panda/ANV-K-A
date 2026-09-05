'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ThreatRecurrenceTimeline: React.FC = () => {
  const steps = [
    { title: 'Threat Ingress', time: 'Aug 28 09:12', desc: 'Ransomware vssadmin execution on DC-PROD-01', state: 'ALERT' },
    { title: 'Incident Created', time: 'Aug 28 09:14', desc: 'INC-81204 assigned to Analyst A-01', state: 'INCIDENT' },
    { title: 'Superficial Closure', time: 'Aug 28 09:15', desc: 'Closed in 58s as False Positive (No dump taken)', state: 'GAP' },
    { title: 'Threat Recurrence', time: 'Aug 31 10:31', desc: 'Same IOC hash returns on DC-PROD-01', state: 'RECURRENCE' },
    { title: 'Second Incident', time: 'Aug 31 10:32', desc: 'INC-84920 triggered', state: 'INCIDENT' },
    { title: 'Supervisory Detection', time: 'Aug 31 10:34', desc: 'PUNARĀVṚTTI generates finding FND-REC-004', state: 'FINDING' },
  ];

  return (
    <div className="soc-panel space-y-3 p-5 font-mono select-none">
      <div className="flex items-center justify-between gap-2 border-b border-soc-border pb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-soc-med" aria-hidden="true" />
          <h3 className="panel-label">Threat Recurrence Timeline (PUNARĀVṚTTI)</h3>
        </div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-soc-textDim">Repeat Incident Chronology</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-6">
        {steps.map((s, idx) => {
          const flagged = s.state === 'GAP' || s.state === 'RECURRENCE' || s.state === 'FINDING';
          return (
            <div
              key={idx}
              className={`space-y-1.5 rounded-sm border p-3 ${
                flagged ? 'border-soc-crit/40 bg-soc-critDim/60' : 'border-soc-border bg-soc-overlay'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-soc-textDim">0{idx + 1}</span>
                <span className="tabular-nums text-soc-textMuted">{s.time}</span>
              </div>
              <div className={`font-sans text-xs font-bold ${flagged ? 'text-soc-crit' : 'text-soc-text'}`}>{s.title}</div>
              <p className="font-sans text-[11px] leading-snug text-soc-textSecondary">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
