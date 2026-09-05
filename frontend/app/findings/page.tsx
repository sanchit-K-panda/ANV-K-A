'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFindings } from '@/lib/api';
import { Finding } from '@/types';
import { Search, ShieldAlert } from 'lucide-react';
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
    <div className="space-y-4 pb-16">
      {/* Title Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-soc-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Findings Centre</h1>
            <span className="soc-badge badge-accent">VIVEKA + ABHĀVA</span>
          </div>
          <p className="text-xs text-soc-textMuted mt-1">
            Offline supervisory anomaly detections, execution omissions, and behavioural deviations across active SOC enclaves.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-2xs text-soc-textMuted">
          <span>ACTIVE FINDINGS <span className="text-soc-text font-semibold tabular-nums">{filteredFindings.length}</span></span>
          <span className="text-soc-borderStrong">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" aria-hidden="true" />
            AIR-GAP VERIFIED
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="soc-panel px-3 py-2.5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-soc-textMuted" />
          <input
            type="text"
            placeholder="Filter finding title, ID, entity, or engine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="soc-input !pl-8"
            aria-label="Search findings"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="soc-input !w-auto cursor-pointer"
          aria-label="Severity filter"
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
          className="soc-input !w-auto cursor-pointer"
          aria-label="Engine type filter"
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
          className="soc-input !w-auto cursor-pointer"
          aria-label="SOC filter"
        >
          <option value="ALL">SOC: ALL</option>
          <option value="SOC-04">SOC-04</option>
          <option value="SOC-02">SOC-02</option>
          <option value="SOC-01">SOC-01</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="soc-input !w-auto cursor-pointer"
          aria-label="Status filter"
        >
          <option value="ALL">Status: ALL</option>
          <option value="OPEN">OPEN</option>
          <option value="REVIEW">REVIEW</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Findings Table */}
      <div className="soc-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table">
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
              {loading && (
                <tr>
                  <td colSpan={8} className="py-8">
                    <div className="space-y-2 px-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-8 bg-soc-raised rounded-md animate-pulse" />
                      ))}
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredFindings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/findings/${f.id}`)}
                  className="cursor-pointer group"
                >
                  <td className="whitespace-nowrap">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td>
                    <div className="font-medium text-soc-text text-xs group-hover:text-soc-accent transition-colors">
                      {f.title}
                    </div>
                    <div className="col-mono">{f.id}</div>
                  </td>
                  <td className="text-xs text-soc-textSecondary whitespace-nowrap font-mono">{f.type}</td>
                  <td className="text-xs text-soc-text font-semibold whitespace-nowrap font-mono tabular-nums">
                    {Math.round(f.confidence * 100)}%
                  </td>
                  <td className="col-mono whitespace-nowrap">{f.soc_scope}</td>
                  <td className="text-xs text-soc-textSecondary whitespace-nowrap">{f.affected_scope}</td>
                  <td className="col-mono whitespace-nowrap">{f.detected_time}</td>
                  <td className="text-right whitespace-nowrap">
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}

              {!loading && filteredFindings.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <ShieldAlert className="w-5 h-5 text-soc-textDim mx-auto mb-2" />
                    <div className="panel-label mb-1">No findings match the current filters</div>
                    <div className="text-2xs text-soc-textMuted font-mono">
                      Adjust severity, type, or status filters, or re-evaluate the scenario.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
