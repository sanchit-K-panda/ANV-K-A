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

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setNotice(`Offline cryptographic report generated: ANVIKSA_${selectedReport.replace(/ /g, '_')}_20260831.json`);
      setTimeout(() => setNotice(null), 4000);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      <div className="soc-panel p-4 flex items-center justify-between font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Assessment Reports &amp; Governance Export
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              GOVERNANCE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Export offline, cryptographically signed SOC effectiveness assessments and supervisory compliance packages.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-mono text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left: Report Types Selector */}
        <div className="md:col-span-4 soc-panel p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-1">
            REPORT TEMPLATES
          </div>
          {reportTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReport(type)}
              className={`w-full text-left p-2.5 font-semibold transition-colors text-xs flex items-center gap-2 rounded ${
                selectedReport === type
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{type}</span>
            </button>
          ))}
        </div>

        {/* Right: Preview and Export Enclave */}
        <div className="md:col-span-8 soc-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <h2 className="text-xs font-bold text-slate-900 font-sans">{selectedReport}</h2>
                <div className="text-[10.5px] text-slate-500">Scope: SOC-04 · Signed by Supervisor Dr. A. Sharma</div>
              </div>
              <span className="badge-verified">SIGNED SHA-256</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5 text-xs">
              <div>Target Entity: <span className="text-slate-900 font-semibold">SOC-04 Security Operations Centre</span></div>
              <div>Assessment Period: <span className="text-slate-700">Last 24 Hours (Shift Alpha through Delta)</span></div>
              <div>Overall Grade: <span className="text-slate-900 font-bold">C- (Score: 78/100 · DEGRADED)</span></div>
              <div>Critical Findings: <span className="text-rose-700 font-bold">07 Unresolved Execution Gaps</span></div>
              <div>Hash Fingerprint: <span className="text-slate-500 font-mono">c74a9f...e9281b (AKṢARA Verified)</span></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleExport}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'EXPORTING PACKAGE...' : 'EXPORT OFFLINE REPORT (JSON/PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
