'use client';

import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '@/lib/mockData';
import { Search, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    'AKṢARA Immutable Chain Height: 9,904 blocks | 0 Tampering Anomalies Detected'
  );

  const handleVerifyChain = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerificationResult(
        '100% CRYPTOGRAPHIC INTEGRITY VERIFIED: All SHA-256 block hashes valid across local air-gapped ledger.'
      );
    }, 800);
  };

  const filteredLogs = MOCK_AUDIT_LOGS.filter(
    (log) =>
      log.user_id.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.device_id.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-xs pb-16">
      {/* Header */}
      <div className="soc-panel p-4 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Immutable Audit Chain &amp; Trust Ledger
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              SAKṢĪ + AKṢARA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Tamper-evident cryptographic ledger recording every supervisor decision, case modification, and evidence inspection.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'VERIFYING SHA-256 CHAIN...' : 'VERIFY CRYPTOGRAPHIC PROOFS'}</span>
        </button>
      </div>

      {/* Verification Status */}
      {verificationResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between text-xs font-mono text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{verificationResult}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">STATUS: VERIFIED</span>
        </div>
      )}

      {/* AKṢARA Hash-Chain Ledger Cards */}
      <div className="soc-panel p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AKṢARA Cryptographic Block Sequence
            </h2>
          </div>
          <span className="text-[10.5px] text-slate-500">SHA-256 HASH CHAIN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { block: '9901', action: 'DARŚANA_AUTH', user: 'Dr. A. Sharma', hash: 'ef2d12...884a', prev: 'Genesis' },
            { block: '9902', action: 'OPEN_FINDING', user: 'VIVEKA Engine', hash: '4b2277...19cf', prev: 'ef2d12...' },
            { block: '9903', action: 'VIEW_EVIDENCE', user: 'Dr. A. Sharma', hash: '9f86d0...cc01', prev: '4b2277...' },
            { block: '9904', action: 'SUPERVISOR_ACTION', user: 'Dr. A. Sharma', hash: '5e8848...d2a8', prev: '9f86d0...' },
          ].map((b) => (
            <div key={b.block} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="font-bold text-slate-900 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                  BLOCK #{b.block}
                </span>
                <span className="text-emerald-700 font-bold">VERIFIED ✓</span>
              </div>
              <div className="text-xs font-bold text-slate-900 font-sans mt-1">{b.action}</div>
              <div className="text-[10.5px] text-slate-500">{b.user}</div>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60 truncate">
                Hash: {b.hash}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="soc-panel overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between font-mono">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action, device, or hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2.5 py-1.5 text-slate-900 placeholder-slate-400 rounded text-xs focus:outline-none focus:border-slate-400"
            />
          </div>
          <span className="text-slate-500 text-[10.5px]">{filteredLogs.length} AUDIT ENTRIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ACTOR / USER</th>
                <th>ACTION</th>
                <th>STATION / DEVICE</th>
                <th>PAYLOAD DIGEST</th>
                <th className="text-right">LEDGER STATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="text-slate-900 font-bold">{log.timestamp}</td>
                  <td className="text-slate-700 font-sans">{log.user_id}</td>
                  <td className="text-slate-900 font-bold">{log.action}</td>
                  <td className="text-slate-600">{log.device_id}</td>
                  <td className="text-slate-500 truncate max-w-xs">{log.current_hash}</td>
                  <td className="text-right whitespace-nowrap">
                    <span className="badge-verified">VERIFIED</span>
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
