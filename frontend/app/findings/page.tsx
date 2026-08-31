'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFindings } from '@/lib/api';
import { Finding } from '@/types';
import { Search, ChevronRight, SlidersHorizontal, ShieldAlert, ArrowUpDown, Filter } from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';

export default function FindingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get('scenario') || 'investigation_gap';

  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [socFilter, setSocFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchFindings({ scenario });
        setFindings(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scenario]);

  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;
    if (socFilter !== 'ALL' && f.soc_scope !== socFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;

    const q = search.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      f.affected_scope.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      {/* Title Header Bar */}
      <div className="soc-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Supervisory Findings Centre
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
              VIVEKA + ABHĀVA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Offline supervisory anomaly detections, execution omissions, and behavioural deviations across active SOC enclaves.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
          <span>Active Findings: <strong className="text-slate-900 font-bold">{filteredFindings.length}</strong></span>
          <span className="text-slate-300">·</span>
          <span>Air-Gap Verified</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="soc-panel p-3 flex flex-wrap items-center gap-2.5 font-mono text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter finding title, ID, entity, or engine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2.5 py-1.5 text-slate-900 rounded text-xs placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-700 rounded focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
        >
          <option value="ALL">Severity: ALL</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-700 rounded focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
        >
          <option value="ALL">Type: ALL</option>
          <option value="Execution Gap">Execution Gap (VIVEKA)</option>
          <option value="VIKĀRA">VIKĀRA (Behaviour)</option>
          <option value="ABHĀVA">ABHĀVA (Negative Space)</option>
          <option value="PUNARĀVṚTTI">PUNARĀVṚTTI (Recurrence)</option>
        </select>

        <select
          value={socFilter}
          onChange={(e) => setSocFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-700 rounded focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
        >
          <option value="ALL">SOC: ALL</option>
          <option value="SOC-04">SOC-04</option>
          <option value="SOC-02">SOC-02</option>
          <option value="SOC-01">SOC-01</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-700 rounded focus:outline-none focus:border-slate-400 cursor-pointer text-xs"
        >
          <option value="ALL">Status: ALL</option>
          <option value="OPEN">OPEN</option>
          <option value="REVIEW">REVIEW</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Unified Enterprise Table */}
      <div className="soc-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table font-sans">
            <thead>
              <tr>
                <th>SEVERITY</th>
                <th>FINDING &amp; IDENTIFIER</th>
                <th>ENGINE / TYPE</th>
                <th>CONFIDENCE</th>
                <th>SOC</th>
                <th>AFFECTED SCOPE</th>
                <th>DETECTED</th>
                <th className="text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/findings/${f.id}`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td>
                    <div className="font-sans font-bold text-slate-900 text-xs hover:text-blue-600">
                      {f.title}
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-mono">{f.id}</div>
                  </td>
                  <td className="text-xs text-slate-600 whitespace-nowrap font-mono">{f.type}</td>
                  <td className="text-xs text-slate-900 font-bold whitespace-nowrap font-mono">
                    {Math.round(f.confidence * 100)}%
                  </td>
                  <td className="text-xs text-slate-600 whitespace-nowrap font-mono">{f.soc_scope}</td>
                  <td className="text-xs text-slate-600 whitespace-nowrap">{f.affected_scope}</td>
                  <td className="text-xs text-slate-400 whitespace-nowrap font-mono">{f.detected_time}</td>
                  <td className="text-right whitespace-nowrap">
                    <StatusBadge status={f.status} />
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
