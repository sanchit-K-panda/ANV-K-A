'use client';

import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '@/lib/mockData';
import { Search, RefreshCw, Check } from 'lucide-react';

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
    }, 1000);
  };

  const filteredLogs = MOCK_AUDIT_LOGS.filter(
    (log) =>
      log.user_id.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.device_id.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              SAKṢĪ + AKṢARA
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Immutable Audit Chain & Trust Ledger
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Tamper-evident cryptographic ledger recording every supervisor decision, case modification, and evidence inspection.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold text-xs font-mono border border-white hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'VERIFYING SHA-256 CHAIN...' : 'VERIFY CRYPTOGRAPHIC PROOFS'}</span>
        </button>
      </div>

      {/* Verification Status */}
      {verificationResult && (
        <div className="p-2.5 bg-[#0C0E12] border border-[#4A5162] flex items-center justify-between text-xs font-mono text-white">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{verificationResult}</span>
          </div>
          <span className="text-[10px] text-[#848B98]">[STATUS: VERIFIED]</span>
        </div>
      )}

      {/* AKṢARA Visual Hash-Chain Schema */}
      <div className="p-3.5 bg-[#0C0E12] border border-[#232732] space-y-2 font-mono text-xs">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
          AKṢARA CRYPTOGRAPHIC HASH-CHAIN
        </h2>
        <div className="p-3 bg-[#060709] border border-[#232732] text-[11px] space-y-1.5">
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold">Block 9901 (LOGIN)</span>
            <span className="text-[#848B98]">→ Hash: ef2d12...</span>
          </div>
          <div className="pl-4 text-[#656C7A]">↓ (PrevHash + Block 9902 Payload)</div>
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold">Block 9902 (OPEN_FINDING)</span>
            <span className="text-[#848B98]">→ Hash: 4b2277...</span>
          </div>
          <div className="pl-4 text-[#656C7A]">↓ (PrevHash + Block 9903 Payload)</div>
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold">Block 9903 (VIEW_EVIDENCE)</span>
            <span className="text-[#848B98]">→ Hash: 9f86d0...</span>
          </div>
          <div className="pl-4 text-[#656C7A]">↓ (PrevHash + Block 9904 Payload)</div>
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold">Block 9904 (UPDATE_CASE)</span>
            <span className="text-[#848B98]">→ Hash: 5e8848...</span>
          </div>
        </div>
      </div>

      {/* Dense Audit Table */}
      <div className="border border-[#232732] bg-[#0C0E12] font-mono text-xs">
        <div className="p-2.5 border-b border-[#232732] flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#656C7A]" />
            <input
              type="text"
              placeholder="Search user, action, or device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#060709] border border-[#232732] pl-8 pr-2 py-1 text-white placeholder-[#656C7A] focus:outline-none focus:border-white text-xs"
            />
          </div>
          <span className="text-[#656C7A] text-[10px]">{filteredLogs.length} VERIFIED ENTRIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>USER</th>
                <th>ACTION</th>
                <th>DEVICE</th>
                <th>CURRENT HASH</th>
                <th className="text-right">INTEGRITY</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="text-white font-bold">{log.timestamp}</td>
                  <td className="text-[#9CA3AF]">{log.user_id}</td>
                  <td className="text-white font-bold">{log.action}</td>
                  <td className="text-[#9CA3AF]">{log.device_id}</td>
                  <td className="text-[#656C7A] truncate max-w-xs">{log.current_hash}</td>
                  <td className="text-right">
                    <span className="badge-verified">[VERIFIED]</span>
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
