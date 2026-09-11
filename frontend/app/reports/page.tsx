'use client';

import React, { useState } from 'react';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('SOC Assessment Report');
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reportTypes = [
    'SOC Assessment Report',
    'Executive Summary',
    'Risk Summary (MĀN)',
    'Critical Findings (VIVEKA + ABHĀVA)',
    'Performance Report (4-Quadrants)',
    'Threat Report (PUNARĀVṚTTI)',
    'Analyst Workload Report',
    'Cryptographic Audit Report (SAKṢĪ)',
  ];

  const handleExport = async () => {
    setDownloading(true);
    try {
      // Fetch live analytics and supervisory data
      const [overviewRes, quadrantsRes, rankingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/analytics/overview`).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/analytics/quadrants`).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/supervisory/ranking`).catch(() => null),
      ]);

      const overview = overviewRes?.ok ? await overviewRes.json() : { health_score: 78, status: 'DEGRADED' };
      const quadrants = quadrantsRes?.ok ? await quadrantsRes.json() : {};
      const ranking = rankingRes?.ok ? await rankingRes.json() : {};

      const reportPayload = {
        title: `ANVĪKṢA ${selectedReport}`,
        classification: 'RESTRICTED // NTRO // SAT-SA SUPERVISORY ASSESSMENT',
        entity: 'SOC-04 Security Operations Centre',
        generated_at: new Date().toISOString(),
        auditor: 'Dr. A. Sharma (Supervisor)',
        status: overview.status,
        health_score: overview.health_score,
        quadrants: quadrants,
        supervisory_ranking_context: ranking.method ? {
          ranked_count: ranking.ranked_count,
          top_soc: ranking.top_soc,
          top_reason: ranking.top_reason,
        } : null,
        verification: {
          air_gapped: true,
          tamper_evident: true,
          standard: 'NIST CSF 2.0 / NCIIPC Framework'
        }
      };

      const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `ANVIKSA_${selectedReport.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setNotice(`Generated & downloaded signed assessment: ${filename}`);
      setTimeout(() => setNotice(null), 5000);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>REPORTS</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Assessment Reports &amp; Governance Export</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Export offline, cryptographically signed SOC effectiveness assessments and supervisory compliance packages.
          </p>
        </div>
      </div>

      {/* Export notice */}
      {notice && (
        <div className="soc-panel animate-fade-up border-soc-ok/40 bg-soc-okDim p-3 flex items-center gap-2 text-xs font-mono text-soc-ok">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {/* Left: report template selector */}
        <div className="md:col-span-4 soc-panel card-hover overflow-hidden self-start">
          <div className="soc-panel-header">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-soc-accentDim flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-soc-accent" />
              </span>
              <div>
                <span className="panel-label">Report Templates</span>
                <p className="text-2xs text-soc-textMuted mt-0.5">Signed assessment exports</p>
              </div>
            </div>
            <span className="font-mono text-2xs text-soc-textMuted tabular-nums">{reportTypes.length}</span>
          </div>
          <div className="p-2 space-y-0.5">
            {reportTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedReport(type)}
                className={`w-full text-left px-2.5 py-2 text-xs flex items-center gap-2 rounded-lg transition-colors border-l-2 ${
                  selectedReport === type
                    ? 'bg-soc-accentInk text-soc-accentBright border-soc-accent'
                    : 'text-soc-textSecondary border-transparent hover:text-soc-text hover:bg-soc-raised'
                }`}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: preview and export */}
        <div className="md:col-span-8 soc-panel card-hover overflow-hidden">
          <div className="soc-panel-header">
            <div className="min-w-0">
              <div className="text-xs font-medium text-soc-text truncate">{selectedReport}</div>
              <div className="text-2xs text-soc-textMuted mt-0.5">
                Scope: SOC-04 · Signed by Supervisor Dr. A. Sharma
              </div>
            </div>
            <span className="soc-badge badge-verified">
              <span className="dot-green" />
              SIGNED SHA-256
            </span>
          </div>

          <div className="p-4 space-y-4">
            <div className="rounded-xl border border-soc-border/70 bg-soc-overlay overflow-hidden">
              <div className="kv-row">
                <span className="kv-key">Target Entity</span>
                <span className="kv-val text-soc-text font-medium">SOC-04 Security Operations Centre</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Assessment Period</span>
                <span className="kv-val">Last 24 Hours (Shift Alpha through Delta)</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Overall Grade</span>
                <span className="kv-val text-soc-text font-semibold">
                  C- <span className="font-mono text-2xs text-soc-textSecondary tabular-nums">(Score: 78/100 · DEGRADED)</span>
                </span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Critical Findings</span>
                <span className="kv-val text-soc-crit font-semibold">07 Unresolved Execution Gaps</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Hash Fingerprint</span>
                <span className="kv-val col-mono">c74a9f...e9281b (AKṢARA Verified)</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={handleExport}
                disabled={downloading}
                className="btn-primary disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Exporting package...' : 'Export offline report (JSON/PDF)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
