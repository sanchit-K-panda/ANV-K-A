'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface ActivityItem {
  time: string;
  text: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  id?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { time: '08:08:37', text: 'Critical finding generated', id: 'FND-EXEC-001', type: 'CRITICAL' },
  { time: '08:08:31', text: 'Investigation anomaly detected on Analyst A-01', type: 'WARNING' },
  { time: '08:08:24', text: 'SOC-04 composite risk increased to 78/100', type: 'CRITICAL' },
  { time: '08:08:18', text: 'INC-84920 flagged with missing memory artifact', type: 'WARNING' },
  { time: '08:08:06', text: 'Threat T-0042 recurred on DC-PROD-01', type: 'CRITICAL' },
  { time: '08:07:44', text: 'MEDHĀ behavioral baseline evaluation cycle complete', type: 'INFO' },
];

const TYPE_DOT: Record<ActivityItem['type'], string> = {
  CRITICAL: 'dot-red',
  WARNING: 'dot-amber',
  INFO: 'dot-accent',
  SUCCESS: 'dot-green',
};

export const LiveActivityStream: React.FC = () => {
  const [activities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  return (
    <div className="soc-panel flex flex-col h-full">
      {/* Header */}
      <div className="soc-panel-header">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-soc-accent" />
          <h3 className="panel-label">Live Activity Stream</h3>
        </div>
        <div className="flex items-center gap-1.5 text-2xs font-mono text-soc-textMuted">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok animate-pulse" aria-hidden="true" />
          <span>REAL-TIME TELEMETRY</span>
        </div>
      </div>

      {/* Stream List */}
      <div className="divide-y divide-soc-border flex-1">
        {activities.map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-soc-raised/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`dot-${a.type === 'CRITICAL' ? 'red' : a.type === 'WARNING' ? 'amber' : a.type === 'SUCCESS' ? 'green' : 'accent'}`} aria-hidden="true" />
              <span className="col-mono flex-shrink-0 tabular-nums">{a.time}</span>
              <span className="text-xs text-soc-textSecondary truncate">{a.text}</span>
            </div>
            {a.id && (
              <span className="col-mono text-soc-crit flex-shrink-0">
                {a.id}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
