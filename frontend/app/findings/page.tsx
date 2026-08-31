'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFindings } from '@/lib/api';
import { Finding } from '@/types';
import { Search, ChevronRight, SlidersHorizontal } from 'lucide-react';
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
    <div className="space-y-4 font-sans text-xs">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              VIVEKA + ABHĀVA
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Findings Centre
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Offline supervisory anomaly findings, execution gaps, and behavioural deviations.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#848B98]">
          <span>TOTAL ACTIVE:</span>
          <strong className="text-white font-bold">{filteredFindings.length} FINDINGS</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-2.5 bg-[#0C0E12] border border-[#232732] flex flex-wrap items-center gap-2 font-mono text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#656C7A]" />
          <input
            type="text"
            placeholder="Search finding, ID, or affected entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060709] border border-[#232732] pl-8 pr-2 py-1 text-white placeholder-[#656C7A] focus:outline-none focus:border-white text-xs"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#060709] border border-[#232732] px-2 py-1 text-white focus:outline-none focus:border-white cursor-pointer"
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
          className="bg-[#060709] border border-[#232732] px-2 py-1 text-white focus:outline-none focus:border-white cursor-pointer"
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
          className="bg-[#060709] border border-[#232732] px-2 py-1 text-white focus:outline-none focus:border-white cursor-pointer"
        >
          <option value="ALL">SOC: ALL</option>
          <option value="SOC-04">SOC-04</option>
          <option value="SOC-02">SOC-02</option>
          <option value="SOC-01">SOC-01</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#060709] border border-[#232732] px-2 py-1 text-white focus:outline-none focus:border-white cursor-pointer"
        >
          <option value="ALL">Status: ALL</option>
          <option value="OPEN">OPEN</option>
          <option value="REVIEW">REVIEW</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Dense High-Fidelity Table */}
      <div className="border border-[#232732] bg-[#0C0E12] overflow-x-auto">
        <table className="soc-table font-mono">
          <thead>
            <tr>
              <th>SEVERITY</th>
              <th>FINDING</th>
              <th>TYPE</th>
              <th>CONFIDENCE</th>
              <th>SOC</th>
              <th>AFFECTED</th>
              <th>DETECTED</th>
              <th className="text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredFindings.map((f) => (
              <tr
                key={f.id}
                onClick={() => router.push(`/findings/${f.id}`)}
                className="cursor-pointer transition-colors"
              >
                <td className="whitespace-nowrap">
                  <SeverityBadge severity={f.severity} />
                </td>
                <td>
                  <div className="font-sans font-bold text-white text-xs hover:underline">
                    {f.title}
                  </div>
                  <div className="text-[10px] text-[#656C7A]">{f.id}</div>
                </td>
                <td className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{f.type}</td>
                <td className="text-[11px] text-white font-bold whitespace-nowrap">
                  {Math.round(f.confidence * 100)}%
                </td>
                <td className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{f.soc_scope}</td>
                <td className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{f.affected_scope}</td>
                <td className="text-[11px] text-[#656C7A] whitespace-nowrap">{f.detected_time}</td>
                <td className="text-right whitespace-nowrap">
                  <StatusBadge status={f.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
