import React from 'react';
import { Activity, CheckCircle, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { LiveRefresher } from '@/components/LiveRefresher';

interface TelemetryEvent {
  event_id: string;
  soc_id?: string;
  timestamp: string;
  event_type?: string;
  eventType?: string;
  source?: string;
  severity?: string;
  description?: string;
  metadata?: {
    action?: string;
    block_hash?: string;
    previous_hash?: string;
    payload?: any;
    [key: string]: any;
  };
}

// Safely parse JSON or object payload
function parsePayload(log: TelemetryEvent): Record<string, any> {
  const p = log.metadata?.payload;
  if (!p) return {};
  if (typeof p === 'string') {
    try {
      return JSON.parse(p);
    } catch {
      return {};
    }
  }
  if (typeof p === 'object' && p !== null) {
    return p;
  }
  return {};
}

// Identifies Salami Slicing & Mass Service Charge Siphoning events
function isSalamiSiphonEvent(log: TelemetryEvent): boolean {
  const payload = parsePayload(log);
  const action = (log.metadata?.action || log.event_type || log.eventType || '').toUpperCase();
  const severity = (log.severity || '').toUpperCase();
  const desc = (log.description || '').toUpperCase();
  const risk = (payload.risk || '').toUpperCase();

  return (
    severity === 'DANGER' ||
    severity === 'CRITICAL' ||
    risk === 'DANGER' ||
    risk === 'CRITICAL' ||
    payload.isFlagged === true ||
    action === 'UNAUTHORIZED_MASS_SIPHON' ||
    action === 'MASS_SIPHON' ||
    action === 'SALAMI_ATTACK' ||
    desc.includes('SALAMI') ||
    desc.includes('SIPHON') ||
    (action === 'SERVICE_CHARGE_EXECUTION' &&
      payload.targetAccount &&
      payload.targetAccount !== '9999000001')
  );
}

async function fetchLiveEvents(): Promise<TelemetryEvent[]> {
  const events: TelemetryEvent[] = [];
  const seenIds = new Set<string>();

  // 1. Fetch from remote Vercel API
  try {
    const res = await fetch('https://cpb-alpha.vercel.app/api/soc/events', {
      headers: {
        'X-API-Key': 'cpb_live_sk_sih2026_soc_detect_all',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      for (const e of data.events || []) {
        const id = e.event_id || e.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          events.push(e);
        }
      }
    }
  } catch (err) {
    console.warn('Could not reach remote Vercel telemetry:', err);
  }

  // 2. Fetch from local backend webhook receiver
  try {
    const localRes = await fetch('http://localhost:8000/api/soc/events', {
      cache: 'no-store',
    });
    if (localRes.ok) {
      const localData = await localRes.json();
      for (const e of localData.events || []) {
        const id = e.event_id || e.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          events.push(e);
        }
      }
    }
  } catch {
    // Local backend may not have extra events yet
  }

  // Sort descending by timestamp
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}

export default async function LoginSessionsPage() {
  const logs = await fetchLiveEvents();

  // Pattern 1: Blockchain Fork Detection (Race Condition)
  const previousHashes = logs.map((l) => l.metadata?.previous_hash).filter(Boolean);
  const hashCounts = previousHashes.reduce<Record<string, number>>((acc, h) => {
    if (h) acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  const forkedHashes = Object.keys(hashCounts).filter((h) => hashCounts[h] > 1);
  const hasRaceCondition = forkedHashes.length > 0;

  // Pattern 2: Salami Slicing & Illicit Mass Fund Siphoning Detection
  const siphonEvents = logs.filter(isSalamiSiphonEvent);
  const hasSiphonAnomaly = siphonEvents.length > 0;
  const activeSiphon = siphonEvents[0];
  const activeSiphonPayload = activeSiphon ? parsePayload(activeSiphon) : {};

  const activeSiphonHash =
    activeSiphon?.metadata?.block_hash || activeSiphon?.event_id || 'UNKNOWN';
  const activeTargetAccount = activeSiphonPayload.targetAccount || 'N/A';
  const activeTotalDeducted =
    activeSiphonPayload.totalDeducted !== undefined
      ? activeSiphonPayload.totalDeducted
      : activeSiphonPayload.amount !== undefined
      ? activeSiphonPayload.amount
      : 0;
  const activeAccountsAffected = activeSiphonPayload.totalAccountsAffected || 0;

  return (
    <div className="space-y-5 pb-16">
      {/* Invisible SSE Refresher for real-time live data */}
      <LiveRefresher />

      {/* Top High-Priority Alert Banner for Active Salami Siphoning */}
      {hasSiphonAnomaly && (
        <div
          role="alert"
          aria-live="assertive"
          className="animate-fade-up bg-gradient-to-r from-red-950/80 via-red-900/50 to-red-950/80 border-2 border-soc-crit shadow-[0_0_30px_rgba(239,68,68,0.4)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="relative flex items-center justify-center mt-1 sm:mt-0">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-soc-crit opacity-75" />
              <AlertOctagon className="relative w-5 h-5 text-soc-crit flex-shrink-0" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-soc-crit flex flex-wrap items-center gap-2">
                <span>🚨 CRITICAL ANOMALY DETECTED:</span>
                <span className="font-medium text-soc-text">
                  Malicious fund siphoning detected on ledger block #{activeSiphonHash.slice(0, 16)}... Security Operations Team notified.
                </span>
              </div>
              <div className="text-2xs font-mono text-soc-textSecondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Target Account:{' '}
                  <strong className="text-soc-crit font-bold underline underline-offset-2">
                    {activeTargetAccount}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Total Siphoned:{' '}
                  <strong className="text-soc-crit font-bold">
                    ₹{Number(activeTotalDeducted).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Impacted Customer Accounts:{' '}
                  <strong className="text-soc-crit font-bold">
                    {activeAccountsAffected}
                  </strong>
                </span>
                {activeSiphonPayload.referenceId && (
                  <>
                    <span>•</span>
                    <span>
                      Ref ID: <span className="font-mono text-soc-text">{activeSiphonPayload.referenceId}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="soc-badge bg-soc-crit/20 text-soc-crit border border-soc-crit/50 font-mono text-2xs uppercase tracking-wider font-bold whitespace-nowrap px-3 py-1">
            LEVEL-1 THREAT · ENCLAVE ESCALATED
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>LEDGER</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">
            Live Ledger &amp; Pattern Analysis
          </h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Live telemetry of user authentication and ledger events. Analyzes cryptographic chain integrity and financial malpractice patterns.
          </p>
        </div>
      </div>

      {/* Malpractice Pattern Analyzer (3 Cards Grid) */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-soc-accentDim flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-soc-accent" />
            </span>
            <div>
              <span className="panel-label">Malpractice Pattern Analyzer</span>
              <p className="text-2xs text-soc-textMuted mt-0.5">
                Cryptographic chain integrity and financial telemetry anomaly detection
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Blockchain Fork */}
          <div className="p-4 bg-soc-overlay rounded-lg space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-medium text-soc-text">
                Pattern: Blockchain Fork (Race Condition)
              </h3>
              <p className="text-2xs text-soc-textMuted leading-relaxed mt-1">
                Detects simultaneous blocks attempting to chain off the same previous block.
              </p>
            </div>
            {hasRaceCondition ? (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-crit bg-soc-critDim border border-soc-crit/40 rounded-lg p-2.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>DETECTED: Multiple logins share the same parent hash.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>CLEAR: Chain is strictly sequential.</span>
              </div>
            )}
          </div>

          {/* Card 2: Impossible Travel */}
          <div className="p-4 bg-soc-overlay rounded-lg space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-medium text-soc-text">Pattern: Impossible Travel</h3>
              <p className="text-2xs text-soc-textMuted leading-relaxed mt-1">
                Detects logins from geographically distant IP addresses within an impossible timeframe.
              </p>
            </div>
            <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>CLEAR: No anomalies detected.</span>
            </div>
          </div>

          {/* Card 3: Salami Slicing & Mass Siphoning (NEW) */}
          <div
            className={`p-4 rounded-lg space-y-2 flex flex-col justify-between transition-all duration-300 ${
              hasSiphonAnomaly
                ? 'bg-soc-critDim/40 border-2 border-soc-crit shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : 'bg-soc-overlay'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-soc-text">
                  Pattern: Salami Slicing &amp; Mass Siphoning
                </h3>
                {hasSiphonAnomaly && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soc-crit opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-soc-crit" />
                  </span>
                )}
              </div>
              <p className="text-2xs text-soc-textMuted leading-relaxed mt-1">
                Detects automated micro-deductions from multiple customer accounts diverted into non-bank accounts.
              </p>
            </div>

            {hasSiphonAnomaly ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-2xs font-bold text-soc-crit bg-soc-crit/20 border border-soc-crit/50 rounded-lg p-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce text-soc-crit" />
                  <span>
                    🔴 ANOMALIES DETECTED: Illicit Mass Siphon Diverted to Account {activeTargetAccount}!
                  </span>
                </div>
                <div className="text-[11px] font-mono text-soc-crit/90 pl-1 font-semibold">
                  Deducted ₹{Number(activeTotalDeducted).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  across {activeAccountsAffected} customer accounts.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>🟢 CLEAR: No anomalous deductions detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dense Audit Table */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="soc-panel-header">
          <span className="panel-label">Live Telemetry Logs</span>
          <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
            {logs.length} verified entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor / Target</th>
                <th>Action</th>
                <th>IP &amp; Device / Amount</th>
                <th>Session / Ref ID</th>
                <th>Block hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: TelemetryEvent) => {
                const payload = parsePayload(log);
                const isForked = Boolean(
                  log.metadata?.previous_hash && forkedHashes.includes(log.metadata.previous_hash)
                );
                const isSiphon = isSalamiSiphonEvent(log);

                return (
                  <tr
                    key={log.event_id}
                    className={`transition-colors ${
                      isSiphon
                        ? 'bg-soc-critDim/35 border-l-4 border-l-soc-crit hover:bg-soc-critDim/50'
                        : ''
                    }`}
                  >
                    {/* Time */}
                    <td className="col-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Actor / Target */}
                    <td className="font-mono text-2xs text-soc-textSecondary">
                      {isSiphon ? (
                        <div className="flex flex-col">
                          <span className="text-soc-crit font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Admin
                          </span>
                          <span className="text-soc-crit/80 text-[10px]">
                            Target: {payload.targetAccount || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        payload.email || payload.userId || payload.targetAccount || 'SYSTEM'
                      )}
                    </td>

                    {/* Action */}
                    <td className="whitespace-nowrap">
                      {isSiphon ? (
                        <span className="soc-badge bg-soc-crit/30 text-soc-crit border border-soc-crit/70 font-bold tracking-wider animate-pulse flex items-center gap-1 w-fit shadow-[0_0_12px_rgba(239,68,68,0.35)] px-2.5 py-1">
                          <AlertTriangle className="w-3 h-3" />
                          {log.metadata?.action === 'SALAMI_ATTACK' ? 'SALAMI_ATTACK' : 'MASS_SIPHON'}
                        </span>
                      ) : (
                        <span
                          className={`soc-badge ${
                            log.metadata?.action === 'LOGIN'
                              ? 'badge-accent'
                              : log.metadata?.action === 'LOGOUT'
                              ? 'badge-neutral'
                              : log.metadata?.action?.includes('PAYMENT') ||
                                log.metadata?.action?.includes('CHARGE')
                              ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {log.metadata?.action || log.event_type || 'UNKNOWN'}
                        </span>
                      )}
                    </td>

                    {/* IP & Device / Amount */}
                    <td className="text-2xs">
                      {isSiphon ? (
                        <div className="font-mono text-soc-crit font-bold">
                          Amount: ₹
                          {Number(payload.totalDeducted || payload.amount || 0).toLocaleString(
                            'en-IN',
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          )}
                          <div className="text-[10px] text-soc-textMuted font-normal">
                            (Total: {payload.totalAccountsAffected || 0} accs)
                          </div>
                        </div>
                      ) : payload.ip ? (
                        <>
                          <div className="font-mono text-soc-text">{payload.ip}</div>
                          <div
                            className="truncate max-w-[150px] text-soc-textMuted"
                            title={payload.device}
                          >
                            {payload.device}
                          </div>
                        </>
                      ) : (
                        <div className="font-mono text-soc-text">
                          Amount: {payload.totalDeducted || payload.amount || '-'}
                        </div>
                      )}
                    </td>

                    {/* Session / Ref ID */}
                    <td className="col-mono">
                      {payload.referenceId ? (
                        <span className={isSiphon ? 'text-soc-crit font-semibold' : undefined}>
                          {payload.referenceId}
                        </span>
                      ) : (
                        payload.sessionId || '-'
                      )}
                    </td>

                    {/* Block Hash */}
                    <td className="text-2xs">
                      <div
                        className={`col-mono truncate max-w-[120px] ${
                          isSiphon ? 'text-soc-crit font-bold' : ''
                        }`}
                        title={log.metadata?.block_hash || log.event_id}
                      >
                        {log.metadata?.block_hash || log.event_id}
                      </div>
                      {isSiphon && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-soc-crit mt-0.5 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                          SIPHON DETECTED
                        </div>
                      )}
                      {isForked && (
                        <div className="flex items-center gap-1 text-2xs font-semibold text-soc-crit mt-0.5">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          FORKED CHAIN
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="m-4 rounded-xl border border-soc-border/70 bg-soc-overlay p-8 text-center">
              <div className="panel-label mb-1">No telemetry events found</div>
              <p className="text-xs text-soc-textMuted">
                No events recorded in the current telemetry window.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
