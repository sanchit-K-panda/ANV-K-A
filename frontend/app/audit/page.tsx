'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AuditLogRecord {
  id: string;
  user_id: string | null;
  session_id: string | null;
  device_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  timestamp: string;
  identity_status: string;
  previous_hash: string | null;
  current_hash: string;
}

interface AuditLogList {
  total: number;
  records: AuditLogRecord[];
}

interface ChainVerification {
  intact: boolean;
  total_records: number;
  broken_at_index: number | null;
  broken_record_id: string | null;
  reason: string | null;
  verified_at: string;
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<AuditLogList | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<ChainVerification | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLogsError(null);
    try {
      const res = await fetch(`${API_BASE}/audit/logs?limit=200`, { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication required — log in to view the audit ledger.');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLogs(await res.json());
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Backend unreachable');
      setLogs(null);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleVerifyChain = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch(`${API_BASE}/audit/verify`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setVerification(await res.json());
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Verification failed');
      setVerification(null);
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = (logs?.records ?? []).filter((log) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (log.user_id ?? '').toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.device_id ?? '').toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      log.current_hash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-3xs font-mono text-soc-textMuted mb-1">
            <span className="font-bold text-soc-text">ANVĪKṢA</span>
            <span>/</span>
            <span>AUDIT_LEDGER</span>
            <span>/</span>
            <span className="text-soc-accent font-bold">SAKṢĪ MERKLE CHAIN</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-soc-text flex items-center gap-2.5">
            <span>Cryptographic Merkle Audit &amp; Integrity Ledger</span>
          </h1>
          <p className="text-2xs font-mono text-soc-textSecondary mt-0.5">
            Tamper-evident ledger recording every supervisor decision, case modification, and evidence inspection
          </p>
        </div>

        <button onClick={handleVerifyChain} disabled={verifying} className="btn-primary font-mono text-xs !px-3.5">
          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'VERIFYING SHA-256 CHAIN...' : 'VERIFY CRYPTOGRAPHIC PROOFS'}</span>
        </button>
      </div>

      {/* Verification Status — real result only */}
      {verification && (
        <div
          className={`px-4 py-3 border rounded-lg flex items-center justify-between gap-3 text-xs font-mono animate-fade-up ${
            verification.intact
              ? 'bg-soc-ok/10 border-soc-ok/40 text-soc-ok'
              : 'bg-red-500/10 border-red-500/40 text-red-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {verification.intact ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-medium">
              {verification.intact
                ? `Chain intact: ${verification.total_records} records verified (SHA-256 append-only)`
                : `CHAIN BROKEN at record ${verification.broken_record_id ?? verification.broken_at_index}: ${verification.reason ?? 'hash mismatch'}`}
            </span>
          </div>
          <span className="text-3xs font-extrabold whitespace-nowrap px-2 py-0.5 rounded border">
            {verification.intact ? 'STATUS: SEALED' : 'STATUS: COMPROMISED'}
          </span>
        </div>
      )}

      {verifyError && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/40 rounded-lg text-xs font-mono text-red-500">
          VERIFICATION FAILED — {verifyError}
        </div>
      )}

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
          <span className="col-mono whitespace-nowrap">
            {logs ? `${filteredLogs.length} / ${logs.total} AUDIT ENTRIES` : '—'}
          </span>
        </div>

        {logsError && (
          <div className="p-8 text-center">
            <p className="text-xs font-mono text-red-500 mb-2">LEDGER UNREACHABLE — {logsError}</p>
            <p className="text-2xs text-soc-textMuted">
              This screen renders only real audit-chain records; no sample entries are fabricated.
            </p>
          </div>
        )}

        {!logsError && logs === null && (
          <div className="p-8 text-center text-xs font-mono text-soc-textMuted animate-pulse">
            LOADING AUDIT LEDGER…
          </div>
        )}

        {logs && (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>ACTOR / USER</th>
                  <th>ACTION</th>
                  <th>RESOURCE</th>
                  <th>STATION / DEVICE</th>
                  <th>PAYLOAD DIGEST</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="col-mono tabular-nums">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="text-soc-textSecondary col-mono">{log.user_id ? `${log.user_id.slice(0, 8)}…` : 'SYSTEM'}</td>
                    <td className="text-soc-text font-mono text-xs font-medium">{log.action}</td>
                    <td className="text-soc-textSecondary">{log.resource}{log.resource_id ? ` · ${log.resource_id}` : ''}</td>
                    <td className="col-mono">{log.device_id ? `${log.device_id.slice(0, 8)}…` : '—'}</td>
                    <td className="col-mono truncate max-w-xs">{log.current_hash}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-soc-textMuted font-mono">
                      {logs.total === 0
                        ? 'LEDGER EMPTY — no audit records recorded yet.'
                        : `NO AUDIT ENTRIES MATCH “${search}”`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-3xs font-mono text-soc-textDim">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Live ledger — records are written by the backend audit service (app/audit/service.py), never by this UI.</span>
      </div>
    </div>
  );
}
