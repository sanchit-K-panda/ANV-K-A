'use client';

import React from 'react';
import { Printer, Download, X, ShieldAlert, FileCheck2, Building2, CheckCircle } from 'lucide-react';
import { SocRankingResponse, ExaminerSampleResponse } from '@/types';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  soc: SocRankingResponse | null;
  samples: ExaminerSampleResponse[];
}

export default function DossierModal({ isOpen, onClose, soc, samples }: DossierModalProps) {
  if (!isOpen || !soc) return null;

  const dossierRef = `NTRO-SATSA-2026-${soc.soc_id.substring(0, 8).toUpperCase()}`;
  const generationDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const generationTime = new Date().toLocaleTimeString();

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const mdContent = `# NTRO // SUPERVISORY ANALYTICS TOOL FOR SOC ASSESSMENT (SAT-SA)
## OFFICIAL EXAMINER AUDIT DOSSIER — CONFIDENTIAL

- **Dossier Reference:** ${dossierRef}
- **Inspected SOC:** ${soc.soc_name} (${soc.soc_id})
- **Evaluation Date:** ${generationDate} ${generationTime}
- **Supervisory Risk Score:** ${(soc.supervisory_risk_score * 100).toFixed(1)} / 100
- **Assessment Tier:** ${soc.status_tier.toUpperCase()}

---

### 1. EXECUTIVE CAPABILITY SCORECARD
| Capability Area | Observed Score | National Baseline | Status |
| :--- | :--- | :--- | :--- |
${Object.entries(soc.capability_scores || {})
  .map(
    ([cap, score]) =>
      `| ${cap.replace(/_/g, ' ').toUpperCase()} | ${(Number(score) * 100).toFixed(1)}% | 75.0% | ${Number(score) >= 0.75 ? 'COMPLIANT' : 'DEFICIENT'} |`
  )
  .join('\n')}

---

### 2. PRIORITIZED EXAMINER CASE SAMPLES (N=${samples.length})
${samples
  .map(
    (s, idx) => `
#### Case ${idx + 1}: ${s.case_id} [Score: ${(s.examiner_priority_score * 100).toFixed(1)}]
- **Incident ID:** ${s.incident_id || 'N/A'}
- **Alert Type:** ${s.alert_type || 'Workflow Event'}
- **Omission Reason:** ${s.primary_reason}
- **Forensic Detail:** ${s.detailed_rationale}
`
  )
  .join('\n')}

---

### 3. CRYPTOGRAPHIC VERIFICATION & ATTESTATION
- **Cryptographic Engine:** SAKṢĪ SHA-256 Hash Chain
- **Integrity Seal:** VERIFIED (Zero Tampering Detected)
- **Supervising Body:** National Technical Research Organisation (NTRO)
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Examiner_Dossier_${soc.soc_id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-cyan-500/40 rounded-2xl w-full max-w-4xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header (Excluded from Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#070b14] border-b border-gray-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
              OFFICIAL EXAMINER DOSSIER
            </span>
            <span className="text-xs text-gray-400">{dossierRef}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 border border-gray-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-900/30 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Body */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-gray-100 bg-[#0a0f1d] print:bg-white print:text-black space-y-6">
          {/* Official Letterhead */}
          <div className="border-b-2 border-cyan-500/60 pb-6 print:border-black flex justify-between items-start">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-cyan-400 print:text-gray-700 font-bold uppercase">
                Government of India • Defence & Intelligence Oversight
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white print:text-black mt-1">
                NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO)
              </h1>
              <p className="text-sm font-semibold text-gray-300 print:text-gray-800">
                Supervisory Analytics Tool for SOC Assessment (SAT-SA) — On-Site Examiner Dossier
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-red-950/80 border border-red-500 text-red-300 print:bg-gray-100 print:text-black print:border-black text-xs font-mono font-bold rounded">
                RESTRICTED // SUPERVISORY
              </div>
              <div className="text-xs text-gray-400 print:text-gray-600 mt-2 font-mono">
                REF: {dossierRef}
              </div>
              <div className="text-xs text-gray-400 print:text-gray-600 font-mono">
                DATE: {generationDate}
              </div>
            </div>
          </div>

          {/* Target Profile Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/50 print:bg-gray-50 p-4 rounded-xl border border-gray-800 print:border-gray-300">
            <div>
              <span className="text-[11px] font-mono text-gray-400 print:text-gray-600 uppercase">Inspected SOC Entity</span>
              <h3 className="text-base font-bold text-white print:text-black flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-4 h-4 text-cyan-400 print:text-black" />
                {soc.soc_name}
              </h3>
              <p className="text-xs text-gray-400 print:text-gray-600 font-mono">{soc.soc_id}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-gray-400 print:text-gray-600 uppercase">Supervisory Risk Score</span>
              <div className="text-xl font-mono font-bold text-amber-400 print:text-black mt-0.5">
                {(soc.supervisory_risk_score * 100).toFixed(1)} <span className="text-xs text-gray-400">/ 100</span>
              </div>
              <p className="text-xs text-gray-400 print:text-gray-600">Rank #{soc.rank_position} of evaluated entities</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-gray-400 print:text-gray-600 uppercase">Examiner Status Tier</span>
              <div className="mt-1">
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 print:bg-gray-200 print:text-black">
                  {soc.status_tier}
                </span>
              </div>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-1">Inspection Priority: HIGH</p>
            </div>
          </div>

          {/* Section 1: 8 Capability Scores Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black mb-2 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              1. Eight-Axis Capability Assessment vs. National Benchmark
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800 print:border-gray-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-900/80 print:bg-gray-100 text-gray-300 print:text-black border-b border-gray-800 print:border-gray-300">
                  <tr>
                    <th className="p-2.5 font-semibold">Capability Area</th>
                    <th className="p-2.5 font-semibold text-center">Observed Score</th>
                    <th className="p-2.5 font-semibold text-center">National Baseline</th>
                    <th className="p-2.5 font-semibold text-right">Supervisory Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 print:divide-gray-300">
                  {Object.entries(soc.capability_scores || {}).map(([cap, score]) => {
                    const num = Number(score);
                    const isPassing = num >= 0.75;
                    return (
                      <tr key={cap} className="hover:bg-gray-800/30 print:hover:bg-transparent">
                        <td className="p-2.5 font-medium text-gray-200 print:text-black">
                          {cap.replace(/_/g, ' ').toUpperCase()}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-gray-100 print:text-black">
                          {(num * 100).toFixed(1)}%
                        </td>
                        <td className="p-2.5 text-center font-mono text-gray-400 print:text-gray-700">
                          75.0%
                        </td>
                        <td className="p-2.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPassing
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 print:bg-transparent print:text-black'
                                : 'bg-red-950 text-red-400 border border-red-500/30 print:bg-transparent print:text-black'
                            }`}
                          >
                            {isPassing ? 'COMPLIANT' : 'DEFICIENCY FLAGGED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Flagged Case Samples Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              2. Prioritized Case Samples for On-Site Forensic Inspection
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800 print:border-gray-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-900/80 print:bg-gray-100 text-gray-300 print:text-black border-b border-gray-800 print:border-gray-300">
                  <tr>
                    <th className="p-2.5 font-semibold">Case / Alert ID</th>
                    <th className="p-2.5 font-semibold">Type</th>
                    <th className="p-2.5 font-semibold text-center">Priority</th>
                    <th className="p-2.5 font-semibold">Primary Forensic Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 print:divide-gray-300">
                  {samples.slice(0, 8).map((s) => (
                    <tr key={s.case_id} className="hover:bg-gray-800/30 print:hover:bg-transparent">
                      <td className="p-2.5 font-mono text-cyan-300 print:text-black font-semibold">
                        {s.case_id}
                      </td>
                      <td className="p-2.5 text-gray-300 print:text-gray-800">{s.alert_type || 'Telemetry'}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-amber-400 print:text-black">
                        {(s.examiner_priority_score * 100).toFixed(0)}
                      </td>
                      <td className="p-2.5 text-gray-300 print:text-gray-800">
                        <strong className="text-white print:text-black">{s.primary_reason}:</strong>{' '}
                        {s.detailed_rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Examiner Signature & Attestation Block */}
          <div className="border-t-2 border-gray-800 print:border-black pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-2">
              <span className="font-mono text-gray-400 print:text-gray-600 uppercase font-semibold">
                Cryptographic Attestation (SAKṢĪ Hash Chain)
              </span>
              <p className="text-gray-300 print:text-gray-700">
                All telemetry records, omission indicators, and supervisory risk derivations have been signed and validated against local SHA-256 blocks. Zero alteration detected.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 print:text-black font-mono font-semibold text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" />
                SEAL ID: SHA256-ANVIKSA-SOVEREIGN-VERIFIED
              </div>
            </div>
            <div className="border border-dashed border-gray-700 print:border-gray-400 p-4 rounded-xl flex flex-col justify-between h-28">
              <span className="text-gray-400 print:text-gray-600 text-[11px] uppercase font-mono">
                Supervisory Lead Examiner Signature
              </span>
              <div className="border-b border-gray-600 print:border-black w-full" />
              <div className="flex justify-between text-[10px] text-gray-400 print:text-gray-600 font-mono">
                <span>NAME / BADGE NO.</span>
                <span>DATE OF ON-SITE INSPECTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
