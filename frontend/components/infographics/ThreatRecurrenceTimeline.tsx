'use client';

import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    <div className="soc-panel p-5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Threat Recurrence Timeline (PUNARĀVṚTTI)
          </h3>
        </div>
        <span className="text-[10.5px] text-slate-500">REPEAT INCIDENT CHRONOLOGY</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border space-y-1.5 ${
              s.state === 'GAP' || s.state === 'RECURRENCE' || s.state === 'FINDING'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-400">0{idx + 1}</span>
              <span className="text-slate-500">{s.time}</span>
            </div>
            <div className="text-xs font-bold text-slate-900 font-sans">{s.title}</div>
            <p className="text-[11px] font-sans text-slate-600 leading-snug">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
