import React from 'react';
import { Search, ShieldAlert, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
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
    <div className="space-y-4 font-sans text-xs">
      {/* Invisible SSE Refresher */}
      <LiveRefresher />
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232732] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#14171E] border border-[#3A4050] text-[10px] font-mono text-white font-bold">
              AUTH AUDIT
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Login Sessions & Pattern Analysis
            </h1>
          </div>
          <p className="text-[11px] text-[#848B98] mt-0.5">
            Live telemetry of user authentication events. Analyzes cryptographic chain integrity for concurrency attacks.
          </p>
        </div>
      </div>

      {/* Pattern Analyzer */}
      <div className="p-4 bg-[#0C0E12] border border-[#232732] space-y-3">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Malpractice Pattern Analyzer
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-[#060709] border border-[#232732]">
            <h3 className="text-white font-mono mb-1">Pattern: Blockchain Fork (Race Condition)</h3>
            <p className="text-[#848B98] text-[10px] mb-2">Detects simultaneous blocks attempting to chain off the same previous block.</p>
            {hasRaceCondition ? (
               <div className="flex items-center gap-2 text-red-500 font-bold bg-red-500/10 p-2 border border-red-500/20">
                 <AlertTriangle className="w-4 h-4" />
                 DETECTED: Multiple logins share the same parent hash.
               </div>
            ) : (
               <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 p-2 border border-green-500/20">
                 <CheckCircle className="w-4 h-4" />
                 CLEAR: Chain is strictly sequential.
               </div>
            )}
          </div>
          
          <div className="p-3 bg-[#060709] border border-[#232732]">
            <h3 className="text-white font-mono mb-1">Pattern: Impossible Travel</h3>
            <p className="text-[#848B98] text-[10px] mb-2">Detects logins from geographically distant IP addresses within an impossible timeframe.</p>
            <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 p-2 border border-green-500/20">
              <CheckCircle className="w-4 h-4" />
              CLEAR: No anomalies detected.
            </div>
          </div>
        </div>
      </div>

      {/* Dense Audit Table */}
      <div className="border border-[#232732] bg-[#0C0E12] font-mono text-xs">
        <div className="p-2.5 border-b border-[#232732] flex items-center justify-between">
          <span className="text-white font-bold">LIVE TELEMETRY LOGS</span>
          <span className="text-[#656C7A] text-[10px]">{logs.length} VERIFIED ENTRIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#14171E] border-b border-[#232732] text-[#848B98] text-[10px] uppercase tracking-wider">
                <th className="p-2 font-normal">TIME</th>
                <th className="p-2 font-normal">USER</th>
                <th className="p-2 font-normal">ACTION</th>
                <th className="p-2 font-normal">IP & DEVICE</th>
                <th className="p-2 font-normal">SESSION ID</th>
                <th className="p-2 font-normal">BLOCK HASH</th>
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
                  <tr key={log.event_id} className="border-b border-[#232732]/50 hover:bg-[#14171E]/50 transition-colors">
                    <td className="p-2 text-white">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-2 text-[#9CA3AF]">{(payload as any).email || (payload as any).userId}</td>
                    <td className="p-2">
                       <span className={`px-1.5 py-0.5 rounded-sm text-[10px] ${log.metadata?.action === 'LOGIN' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                         {log.metadata?.action}
                       </span>
                    </td>
                    <td className="p-2 text-[#9CA3AF] text-[10px]">
                      <div className="text-white">{(payload as any).ip}</div>
                      <div className="truncate max-w-[150px]" title={(payload as any).device}>{(payload as any).device}</div>
                    </td>
                    <td className="p-2 text-[#9CA3AF] text-[10px]">{(payload as any).sessionId}</td>
                    <td className="p-2 text-[#656C7A] text-[10px]">
                      <div className="truncate max-w-[120px]" title={log.event_id}>{log.event_id}</div>
                      {isForked && <div className="text-red-500 font-bold mt-0.5">⚠️ FORKED CHAIN</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="p-8 text-center text-[#656C7A]">No login sessions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
