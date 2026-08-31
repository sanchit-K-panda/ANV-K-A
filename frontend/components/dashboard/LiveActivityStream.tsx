'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';

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

export const LiveActivityStream: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  return (
    <div className="soc-panel p-5 space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Live Activity Stream
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>REAL-TIME TELEMETRY</span>
        </div>
      </div>

      {/* Stream List */}
      <div className="space-y-1.5 text-xs">
        {activities.map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-slate-400 text-[10.5px] flex-shrink-0">{a.time}</span>
              <span className="text-slate-800 font-sans truncate text-xs">{a.text}</span>
            </div>
            {a.id && (
              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex-shrink-0">
                {a.id}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
