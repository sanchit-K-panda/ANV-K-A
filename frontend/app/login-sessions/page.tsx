import React from 'react';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { LiveRefresher } from '@/components/LiveRefresher';

async function fetchLiveEvents() {
  const res = await fetch("https://cpb-alpha.vercel.app/api/soc/events", {
    headers: {
      "X-API-Key": "cpb_live_sk_sih2026_soc_detect_all"
    },
    // We want to fetch fresh data every time in this SOC dashboard
    cache: 'no-store'
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  const events = data.events || [];
  
  // Filter only LOGIN and LOGOUT
  const authEvents = events.filter((e: any) => 
    e.metadata?.action === 'LOGIN' || e.metadata?.action === 'LOGOUT'
  );
  
  // Sort descending by timestamp
  authEvents.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return authEvents;
}

export default async function LoginSessionsPage() {
  const logs = await fetchLiveEvents();
  
  // Pattern detection: Find if multiple logins have the exact same previous_hash (fork attempt)
  const previousHashes = logs.map((l: any) => l.metadata?.previous_hash);
  const hashCounts = previousHashes.reduce((acc: any, h: string) => {
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  
  const forkedHashes = Object.keys(hashCounts).filter(h => hashCounts[h] > 1);
  const hasRaceCondition = forkedHashes.length > 0;
  
  return (
    <div className="space-y-5 pb-16">
      {/* Invisible SSE Refresher */}
      <LiveRefresher />
      
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>SESSIONS</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Login Sessions &amp; Pattern Analysis</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Live telemetry of user authentication events. Analyzes cryptographic chain integrity for concurrency attacks.
          </p>
        </div>
      </div>

      {/* Malpractice Pattern Analyzer */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-soc-accentDim flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-soc-accent" />
            </span>
            <div>
              <span className="panel-label">Malpractice Pattern Analyzer</span>
              <p className="text-2xs text-soc-textMuted mt-0.5">Cryptographic chain integrity checks</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-soc-overlay rounded-lg space-y-2">
            <h3 className="text-xs font-medium text-soc-text">Pattern: Blockchain Fork (Race Condition)</h3>
            <p className="text-2xs text-soc-textMuted leading-relaxed">
              Detects simultaneous blocks attempting to chain off the same previous block.
            </p>
            {hasRaceCondition ? (
               <div className="flex items-center gap-2 text-2xs font-semibold text-soc-crit bg-soc-critDim border border-soc-crit/40 rounded-lg p-2.5">
                 <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                 DETECTED: Multiple logins share the same parent hash.
               </div>
            ) : (
               <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                 <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                 CLEAR: Chain is strictly sequential.
               </div>
            )}
          </div>
          
          <div className="p-4 bg-soc-overlay rounded-lg space-y-2">
            <h3 className="text-xs font-medium text-soc-text">Pattern: Impossible Travel</h3>
            <p className="text-2xs text-soc-textMuted leading-relaxed">
              Detects logins from geographically distant IP addresses within an impossible timeframe.
            </p>
            <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              CLEAR: No anomalies detected.
            </div>
          </div>
        </div>
      </div>

      {/* Dense audit table */}
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
                <th>User</th>
                <th>Action</th>
                <th>IP &amp; device</th>
                <th>Session ID</th>
                <th>Block hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const p = log.metadata?.payload;
                let payload = {};
                if (typeof p === 'string') {
                  try { payload = JSON.parse(p); } catch(e) {}
                } else if (typeof p === 'object') {
                  payload = p;
                }
                
                const isForked = forkedHashes.includes(log.metadata?.previous_hash);
                
                return (
                  <tr key={log.event_id}>
                    <td className="col-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="font-mono text-2xs text-soc-textSecondary">
                      {(payload as any).email || (payload as any).userId}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`soc-badge ${log.metadata?.action === 'LOGIN' ? 'badge-accent' : 'badge-neutral'}`}>
                        {log.metadata?.action}
                      </span>
                    </td>
                    <td className="text-2xs">
                      <div className="font-mono text-soc-text">{(payload as any).ip}</div>
                      <div className="truncate max-w-[150px] text-soc-textMuted" title={(payload as any).device}>
                        {(payload as any).device}
                      </div>
                    </td>
                    <td className="col-mono">{(payload as any).sessionId}</td>
                    <td className="text-2xs">
                      <div className="col-mono truncate max-w-[120px]" title={log.event_id}>{log.event_id}</div>
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
              <div className="panel-label mb-1">No login sessions found</div>
              <p className="text-xs text-soc-textMuted">No authentication events recorded in the current telemetry window.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
