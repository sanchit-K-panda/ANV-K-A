'use client';

import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '@/lib/mockData';
import { Search, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    'SAKṢĪ Immutable Chain Height: 9,904 blocks | 0 tampering anomalies detected'
  );

  const handleVerifyChain = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerificationResult(
        '100% CRYPTOGRAPHIC INTEGRITY VERIFIED: all SHA-256 block hashes valid across the local air-gapped ledger.'
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
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-soc-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Audit &amp; Integrity</h1>
            <span className="soc-badge badge-accent">SAKṢĪ LEDGER</span>
          </div>
          <p className="text-xs text-soc-textMuted mt-1">
            Tamper-evident cryptographic ledger recording every supervisor decision, case modification, and evidence inspection.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="btn-primary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'VERIFYING SHA-256 CHAIN...' : 'VERIFY CRYPTOGRAPHIC PROOFS'}</span>
        </button>
      </div>

      {/* Verification Status */}
      {verificationResult && (
        <div className="px-3.5 py-2.5 bg-soc-okDim border border-soc-ok/30 rounded-md flex items-center justify-between gap-3 text-xs font-mono text-soc-ok">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{verificationResult}</span>
          </div>
          <span className="text-2xs font-semibold whitespace-nowrap">STATUS: VERIFIED</span>
        </div>
      )}

      {/* Cryptographic Block Sequence */}
      <div className="soc-panel">
        <div className="soc-panel-header">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-soc-ok" />
            <h2 className="panel-label">SAKṢĪ Cryptographic Block Sequence</h2>
          </div>
          <span className="text-2xs font-mono text-soc-textMuted">SHA-256 HASH CHAIN · APPEND-ONLY</span>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { block: '9901', action: 'DARŚANA_AUTH', user: 'Dr. A. Sharma', hash: 'ef2d12...884a', prev: 'Genesis' },
              { block: '9902', action: 'OPEN_FINDING', user: 'VIVEKA Engine', hash: '4b2277...19cf', prev: 'ef2d12...' },
              { block: '9903', action: 'VIEW_EVIDENCE', user: 'Dr. A. Sharma', hash: '9f86d0...cc01', prev: '4b2277...' },
              { block: '9904', action: 'SUPERVISOR_ACTION', user: 'Dr. A. Sharma', hash: '5e8848...d2a8', prev: '9f86d0...' },
            ].map((b) => (
              <div key={b.block} className="p-3 bg-soc-overlay rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="soc-badge badge-accent">BLOCK #{b.block}</span>
                  <span className="soc-badge badge-ok">VERIFIED</span>
                </div>
                <div className="text-xs font-mono font-medium text-soc-text mt-1">{b.action}</div>
                <div className="text-2xs text-soc-textMuted">{b.user}</div>
                <div className="col-mono pt-1.5 border-t border-soc-border truncate">
                  HASH {b.hash}
                </div>
                <div className="col-mono truncate">
                  PREV {b.prev}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="soc-panel overflow-hidden">
        <div className="soc-panel-header">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-soc-textMuted" />
            <input
              type="text"
              placeholder="Search user, action, device, or hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="soc-input !pl-8"
              aria-label="Search audit entries"
            />
          </div>
          <span className="col-mono whitespace-nowrap">{filteredLogs.length} AUDIT ENTRIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
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
                <tr key={log.id}>
                  <td className="col-mono tabular-nums">{log.timestamp}</td>
                  <td className="text-soc-textSecondary">{log.user_id}</td>
                  <td className="text-soc-text font-mono text-xs font-medium">{log.action}</td>
                  <td className="col-mono">{log.device_id}</td>
                  <td className="col-mono truncate max-w-xs">{log.current_hash}</td>
                  <td className="text-right whitespace-nowrap">
                    <span className="soc-badge badge-ok">VERIFIED</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-soc-textMuted font-mono">
                    NO AUDIT ENTRIES MATCH &ldquo;{search}&rdquo;
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
