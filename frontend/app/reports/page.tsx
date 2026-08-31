'use client';

import React, { useState } from 'react';
import { FileText, Download, Check } from 'lucide-react';

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
    }, 1000);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              GOVERNANCE
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Assessment Reports
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Export offline, cryptographically signed SOC effectiveness assessments and supervisory compliance packages.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-2.5 bg-[#0C0E12] border border-white text-xs font-mono text-white flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left: Report Types Selector */}
        <div className="md:col-span-4 bg-[#0C0E12] border border-[#232732] p-3 space-y-1">
          <div className="text-[9px] text-[#656C7A] font-bold uppercase tracking-wider mb-2">REPORT TEMPLATES</div>
          {reportTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReport(type)}
              className={`w-full text-left p-2 font-semibold transition-colors text-xs flex items-center gap-2 ${
                selectedReport === type
                  ? 'bg-white text-black'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#14171E]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{type}</span>
            </button>
          ))}
        </div>

        {/* Right: Preview and Export Enclave */}
        <div className="md:col-span-8 bg-[#0C0E12] border border-[#232732] p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center border-b border-[#232732] pb-2">
              <div>
                <h2 className="text-xs font-bold text-white font-sans">{selectedReport}</h2>
                <div className="text-[10px] text-[#848B98]">Scope: SOC-04 · Signed by Supervisor A. Sharma</div>
              </div>
              <span className="badge-verified">[SIGNED SHA-256]</span>
            </div>

            <div className="p-3 bg-[#060709] border border-[#232732] space-y-1.5 text-[11px]">
              <div>Target Entity: <span className="text-white">SOC-04 Security Operations Centre</span></div>
              <div>Assessment Period: <span className="text-white">Last 24 Hours (Shift Alpha through Delta)</span></div>
              <div>Overall Grade: <span className="text-white font-bold">C- (Score: 78/100 · DEGRADED)</span></div>
              <div>Critical Findings: <span className="text-white font-bold">07 Unresolved Execution Gaps</span></div>
              <div>Hash Fingerprint: <span className="text-[#656C7A]">c74a9f...e9281b (AKṢARA Verified)</span></div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#232732]">
            <button
              onClick={handleExport}
              disabled={downloading}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-black font-bold border border-white hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
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
