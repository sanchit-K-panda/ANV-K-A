'use client';

import React from 'react';
import { MOCK_WORKLOAD } from '@/lib/mockData';

export default function WorkloadPage() {
  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              VIKĀRA / WORKLOAD
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Analyst Workload & Capacity
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Supervisory monitoring of alert fatigue, rapid-closure anomalies, and ticket concentration.
          </p>
        </div>
      </div>

      <div className="border border-[#232732] bg-[#0C0E12] overflow-x-auto font-mono text-xs">
        <table className="soc-table">
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
              <tr key={w.analyst_id}>
                <td className="font-bold text-white font-sans">{w.name} ({w.analyst_id})</td>
                <td className="text-[#9CA3AF]">{w.role}</td>
                <td className="text-white font-bold">{w.critical_cases}</td>
                <td className="text-white">{w.active_cases}</td>
                <td className="text-[#848B98]">{w.mean_closure_minutes} min</td>
                <td className="text-white font-bold">{Math.round(w.investigation_rate * 100)}%</td>
                <td className="text-right">
                  <span
                    className={
                      w.workload_level === 'HIGH'
                        ? 'badge-critical'
                        : w.workload_level === 'NORMAL'
                        ? 'badge-medium'
                        : 'badge-low'
                    }
                  >
                    [{w.workload_level}] {w.is_bottleneck ? '· BOTTLENECK' : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
