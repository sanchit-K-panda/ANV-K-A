'use client';

import React from 'react';
import { MOCK_WORKLOAD } from '@/lib/mockData';
import { Users, AlertTriangle } from 'lucide-react';

export default function WorkloadPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Analyst Workload &amp; Capacity
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              VIKĀRA / WORKLOAD
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Supervisory monitoring of alert fatigue, rapid-closure anomalies, and ticket concentration.
          </p>
        </div>
      </div>

      <div className="soc-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>ANALYST</th>
                <th>ROLE</th>
                <th>CRITICAL CASES</th>
                <th>ACTIVE CASES</th>
                <th>MEAN CLOSURE</th>
                <th>INVESTIGATION RATE</th>
                <th className="text-right">WORKLOAD STATUS</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_WORKLOAD.map((w) => (
                <tr key={w.analyst_id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-slate-900 font-sans">{w.name} ({w.analyst_id})</td>
                  <td className="text-slate-600 font-sans">{w.role}</td>
                  <td className="text-slate-900 font-bold">{w.critical_cases}</td>
                  <td className="text-slate-700">{w.active_cases}</td>
                  <td className="text-slate-500">{w.mean_closure_minutes} min</td>
                  <td className="text-slate-900 font-bold">{Math.round(w.investigation_rate * 100)}%</td>
                  <td className="text-right whitespace-nowrap">
                    <span
                      className={
                        w.workload_level === 'HIGH'
                          ? 'badge-critical'
                          : w.workload_level === 'NORMAL'
                          ? 'badge-medium'
                          : 'badge-low'
                      }
                    >
                      {w.workload_level} {w.is_bottleneck ? '· BOTTLENECK' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
