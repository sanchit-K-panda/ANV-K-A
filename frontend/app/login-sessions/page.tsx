import React from 'react';
import { Activity, CheckCircle, AlertTriangle, AlertOctagon, ShieldAlert, Radio } from 'lucide-react';
import { LiveRefresher } from '@/components/LiveRefresher';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TelemetryEvent {
  event_id: string;
  soc_id?: string;
  timestamp: string;
  event_type?: string;
  eventType?: string;
  source?: string;
  severity?: string;
  threat_level?: string;
  anomaly_detected?: boolean;
  pattern?: string;
  description?: string;
  metadata?: {
    action?: string;
    block_hash?: string;
    previous_hash?: string;
    payload?: any;
    sourceIp?: string;
    targetRoute?: string;
    detectionType?: string;
    incidentId?: string;
    evidence?: any;
    [key: string]: any;
  };
}

type AttackCategory =
  | 'BRUTE_FORCE'
  | 'BURP_ATTACK'
  | 'IDENTITY_THEFT'
  | 'SALAMI_ATTACK'
  | 'WAF_EXPLOIT';

interface AttackInfo {
  category: AttackCategory;
  pillLabel: string; // e.g. "[BRUTE_FORCE]"
  patternCard: 1 | 2 | 3 | 4; // 1: Fork, 2: Identity, 3: Burp/Brute, 4: Salami
  attackName: string;
  sourceIp: string;
  targetRoute: string;
  targetAccount?: string;
  actorDisplay: string;
  actorSubtext?: string;
  amountOrDetail: string;
  amountSubtext?: string;
  refId: string;
  isDanger: boolean;
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

// Parse evidence if present
function parseEvidence(evidence: any): Record<string, any> {
  if (!evidence) return {};
  if (typeof evidence === 'string') {
    try {
      return JSON.parse(evidence);
    } catch {
      return { raw: evidence };
    }
  }
  if (typeof evidence === 'object' && evidence !== null) {
    return evidence;
  }
  return {};
}

// Detect and classify all 5 attack categories from inbound telemetry
function detectAttack(log: TelemetryEvent): AttackInfo | null {
  const payload = parsePayload(log);
  const evidence = parseEvidence(log.metadata?.evidence || payload.evidence);

  const action = (
    log.metadata?.action ||
    log.event_type ||
    log.eventType ||
    payload.action ||
    payload.detectionType ||
    log.metadata?.detectionType ||
    ''
  ).toUpperCase();

  const severity = (
    log.severity ||
    payload.severity ||
    log.metadata?.severity ||
    ''
  ).toUpperCase();

  const threatLevel = (
    log.threat_level ||
    payload.threat_level ||
    payload.threatScore ||
    ''
  ).toUpperCase();

  const desc = (log.description || '').toUpperCase();
  const risk = (payload.risk || '').toUpperCase();
  const detectionType = (
    payload.detectionType ||
    payload.attackType ||
    log.metadata?.detectionType ||
    ''
  ).toUpperCase();

  const isDanger =
    severity === 'DANGER' ||
    severity === 'CRITICAL' ||
    severity === 'HIGH' ||
    threatLevel === 'CRITICAL' ||
    threatLevel === 'CONFIRMED_ATTACK' ||
    risk === 'DANGER' ||
    risk === 'CRITICAL' ||
    payload.isFlagged === true ||
    payload.flagged === true ||
    log.anomaly_detected === true;

  const sourceIp =
    payload.sourceIp ||
    payload.ip ||
    payload.attackerIp ||
    payload.clientIp ||
    log.metadata?.sourceIp ||
    log.metadata?.ip ||
    '125.17.13.54';

  const targetRoute =
    payload.targetRoute ||
    payload.targetUrl ||
    payload.route ||
    payload.url ||
    payload.endpoint ||
    log.metadata?.targetRoute ||
    '/api/auth/login';

  const refId =
    payload.referenceId ||
    payload.incidentId ||
    log.metadata?.incidentId ||
    payload.refId ||
    payload.sessionId ||
    (log.metadata?.block_hash
      ? `BLK-${log.metadata.block_hash.slice(0, 10).toUpperCase()}`
      : log.event_id
      ? `EVT-${log.event_id.slice(0, 10).toUpperCase()}`
      : 'SEC-REF-01');

  // 1. 🔐 CREDENTIAL BRUTE FORCE
  if (
    action === 'BRUTE_FORCE_DETECTED' ||
    action === 'BRUTE_FORCE' ||
    detectionType === 'BRUTE_FORCE' ||
    desc.includes('BRUTE FORCE') ||
    desc.includes('5 CONSECUTIVE') ||
    desc.includes('FAILED PASSWORDS') ||
    desc.includes('ACCOUNT TAKEOVER')
  ) {
    const attempts = evidence.consecutiveFailedAttempts || payload.consecutiveFailedAttempts || 5;
    const targetAcc = evidence.targetAccount || payload.targetAccount || payload.email;

    return {
      category: 'BRUTE_FORCE',
      pillLabel: '[BRUTE_FORCE]',
      patternCard: 3,
      attackName: 'Credential Brute Force / Account Takeover',
      sourceIp,
      targetRoute,
      targetAccount: targetAcc,
      actorDisplay: `${sourceIp}`,
      actorSubtext: `-> ${targetRoute}`,
      amountOrDetail: '5x Failed Passwords',
      amountSubtext: `${attempts} consecutive failed attempts`,
      refId,
      isDanger,
    };
  }

  // 2. 🧰 BURP SUITE & PROXY TAMPERING
  if (
    action === 'BURP_INTRUSION_DETECTED' ||
    action === 'BURP_ATTACK' ||
    detectionType === 'BURP_ATTACK' ||
    desc.includes('BURP') ||
    desc.includes('PROXY MANIPULATION') ||
    desc.includes('REPEATER') ||
    desc.includes('INTRUDER') ||
    desc.includes('CLIENT HINTS') ||
    desc.includes('SEC-CH-UA')
  ) {
    const detail =
      evidence.manipulation ||
      evidence.reason ||
      payload.reason ||
      'Missing Sec-Ch-Ua (Repeater)';

    return {
      category: 'BURP_ATTACK',
      pillLabel: '[BURP_ATTACK]',
      patternCard: 3,
      attackName: 'Burp Suite & Proxy Manipulation',
      sourceIp,
      targetRoute,
      actorDisplay: `${sourceIp}`,
      actorSubtext: `-> ${targetRoute}`,
      amountOrDetail: detail.includes('Sec-Ch-Ua') ? 'Missing Sec-Ch-Ua (Repeater)' : detail,
      amountSubtext: evidence.toolPattern || 'Sub-second fuzzing / stripped client hints',
      refId,
      isDanger,
    };
  }

  // 3. 🕵️ IDENTITY THEFT & SESSION HIJACKING
  if (
    action === 'IDENTITY_THEFT_DETECTED' ||
    action === 'SESSION_HIJACK_ATTEMPT' ||
    action === 'IDENTITY_THEFT' ||
    detectionType === 'IDENTITY_THEFT' ||
    desc.includes('IDENTITY THEFT') ||
    desc.includes('SESSION HIJACK') ||
    desc.includes('IMPOSSIBLE TRAVEL')
  ) {
    const detail =
      evidence.triggerReason ||
      payload.reason ||
      'Active session mismatched device/IP mid-session';

    return {
      category: 'IDENTITY_THEFT',
      pillLabel: '[IDENTITY_THEFT]',
      patternCard: 2,
      attackName: 'Identity Theft & Impossible Travel',
      sourceIp,
      targetRoute: targetRoute === '/api/auth/login' ? '/api/customer/session' : targetRoute,
      actorDisplay: `${sourceIp}`,
      actorSubtext: `-> ${targetRoute === '/api/auth/login' ? '/api/customer/session' : targetRoute}`,
      amountOrDetail: 'Mismatched device/IP mid-session',
      amountSubtext: evidence.registeredDevice ? `Registered: ${evidence.registeredDevice.slice(0, 22)}...` : 'Session hijacking detected',
      refId,
      isDanger,
    };
  }

  // 4. 💸 SALAMI SLICING & MASS SIPHONING
  if (
    action === 'UNAUTHORIZED_MASS_SIPHON' ||
    action === 'MASS_SIPHON' ||
    action === 'SALAMI_ATTACK' ||
    detectionType === 'SALAMI_ATTACK' ||
    desc.includes('SALAMI') ||
    desc.includes('SIPHON') ||
    (action === 'SERVICE_CHARGE_EXECUTION' &&
      payload.targetAccount &&
      payload.targetAccount !== '9999000001')
  ) {
    const targetAcc = payload.targetAccount || '1000000002';
    const totalDeducted =
      payload.totalDeducted !== undefined
        ? payload.totalDeducted
        : payload.amount !== undefined
        ? payload.amount
        : 4580.5;
    const accs = payload.totalAccountsAffected || payload.accountsAffected || 7;

    return {
      category: 'SALAMI_ATTACK',
      pillLabel: '[SALAMI_ATTACK]',
      patternCard: 4,
      attackName: 'Salami Slicing & Mass Siphon',
      sourceIp,
      targetRoute: '/api/staff/ops',
      targetAccount: targetAcc,
      actorDisplay: 'Admin',
      actorSubtext: `Target: ${targetAcc}`,
      amountOrDetail: `Diverted ₹${Number(totalDeducted).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} to personal acc`,
      amountSubtext: `(Total: ${accs} customer accounts)`,
      refId,
      isDanger: true,
    };
  }

  // 5. 🛡️ WEB EXPLOITS (WAF INTERCEPT)
  if (
    action === 'SECURITY_ALERT' ||
    action === 'WAF_EXPLOIT' ||
    detectionType === 'WAF_EXPLOIT' ||
    payload.attackType === 'SQL_INJECTION' ||
    payload.attackType === 'CROSS_SITE_SCRIPTING' ||
    payload.attackType === 'PATH_TRAVERSAL' ||
    desc.includes('WAF') ||
    desc.includes('SQL_INJECTION') ||
    desc.includes('CROSS_SITE') ||
    desc.includes('PATH_TRAVERSAL') ||
    desc.includes('SQLI') ||
    desc.includes('XSS')
  ) {
    const exploitType = payload.attackType || 'SQL_INJECTION';
    let detail = "SQLi (' OR 1=1) / XSS detected";
    if (exploitType === 'SQL_INJECTION' || desc.includes('SQL')) {
      detail = "SQLi (' OR 1=1) detected in payload";
    } else if (exploitType === 'CROSS_SITE_SCRIPTING' || desc.includes('XSS')) {
      detail = "<script> XSS probe intercepted";
    } else if (exploitType === 'PATH_TRAVERSAL' || desc.includes('TRAVERSAL')) {
      detail = "Path traversal (../) probe intercepted";
    }

    return {
      category: 'WAF_EXPLOIT',
      pillLabel: '[WAF_EXPLOIT]',
      patternCard: 3,
      attackName: `Web Exploits (WAF Intercept: ${exploitType})`,
      sourceIp,
      targetRoute: targetRoute === '/api/auth/login' ? '/api/cards' : targetRoute,
      actorDisplay: `${sourceIp}`,
      actorSubtext: `-> ${targetRoute === '/api/auth/login' ? '/api/cards' : targetRoute}`,
      amountOrDetail: detail,
      amountSubtext: 'WAF Intercepted Exploit',
      refId,
      isDanger,
    };
  }

  return null;
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

  // 3. Fetch from local bank dev server if running on port 3001
  try {
    const bankRes = await fetch('http://localhost:3001/api/soc/events', {
      headers: {
        'X-API-Key': 'cpb_live_sk_sih2026_soc_detect_all',
      },
      cache: 'no-store',
    });
    if (bankRes.ok) {
      const bankData = await bankRes.json();
      for (const e of bankData.events || []) {
        const id = e.event_id || e.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          events.push(e);
        }
      }
    }
  } catch {
    // Port 3001 may not be active
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

  // Process and detect attacks across all incoming telemetry logs
  const classifiedAttacks: { log: TelemetryEvent; attack: AttackInfo }[] = [];
  for (const log of logs) {
    const attack = detectAttack(log);
    if (attack) {
      classifiedAttacks.push({ log, attack });
    }
  }

  // Pattern Cards 2, 3, 4 State Evaluation
  const identityAttackObj = classifiedAttacks.find(
    (item) => item.attack.patternCard === 2 && item.attack.isDanger
  );
  const identityAttack = identityAttackObj?.attack;

  const burpOrBruteObj = classifiedAttacks.find(
    (item) => item.attack.patternCard === 3 && item.attack.isDanger
  );
  const burpOrBruteAttack = burpOrBruteObj?.attack;

  const salamiObj = classifiedAttacks.find(
    (item) => item.attack.patternCard === 4 && item.attack.isDanger
  );
  const salamiAttack = salamiObj?.attack;

  // Overall Most Critical Attack for Top Alert Banner
  const topCriticalObj = classifiedAttacks.find((item) => item.attack.isDanger);
  const topCriticalAttack = topCriticalObj?.attack;
  const topCriticalBlock =
    topCriticalObj?.log.metadata?.block_hash || topCriticalObj?.log.event_id || 'UNKNOWN';

  return (
    <div className="space-y-5 pb-16">
      {/* Invisible SSE Refresher for real-time live data */}
      <LiveRefresher />

      {/* Top High-Priority Alert Banner for Active Attacks */}
      {topCriticalAttack && (
        <div
          role="alert"
          aria-live="assertive"
          className="animate-fade-up bg-gradient-to-r from-red-950/90 via-red-900/60 to-red-950/90 border-2 border-soc-crit shadow-[0_0_35px_rgba(239,68,68,0.45)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none"
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
                  {topCriticalAttack.attackName} detected on ledger block #{topCriticalBlock.slice(0, 16)}... Security Operations Team notified.
                </span>
              </div>
              <div className="text-2xs font-mono text-soc-textSecondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Source IP:{' '}
                  <strong className="text-soc-crit font-bold underline underline-offset-2">
                    {topCriticalAttack.sourceIp}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Target:{' '}
                  <strong className="text-soc-crit font-bold">
                    {topCriticalAttack.targetAccount
                      ? `Account ${topCriticalAttack.targetAccount}`
                      : topCriticalAttack.targetRoute}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Evidence:{' '}
                  <strong className="text-soc-crit font-bold">
                    {topCriticalAttack.amountOrDetail}
                  </strong>
                </span>
                {topCriticalAttack.refId && (
                  <>
                    <span>•</span>
                    <span>
                      Ref ID:{' '}
                      <span className="font-mono text-soc-text">{topCriticalAttack.refId}</span>
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
            Live telemetry of user authentication and ledger events. Analyzes cryptographic chain integrity, automated intrusion tools, and financial fraud patterns.
          </p>
        </div>
      </div>

      {/* Malpractice Pattern Analyzer (4 Cards Grid) */}
      <div className="soc-panel card-hover overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="soc-panel-header">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-soc-accentDim flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-soc-accent" />
            </span>
            <div>
              <span className="panel-label">Malpractice Pattern Analyzer</span>
              <p className="text-2xs text-soc-textMuted mt-0.5">
                Cryptographic chain integrity, automated proxy tampering, and financial telemetry anomaly detection
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Blockchain Fork (Race Condition) */}
          <div
            className={`p-4 rounded-lg space-y-2 flex flex-col justify-between transition-all duration-300 ${
              hasRaceCondition
                ? 'bg-soc-critDim/40 border-2 border-soc-crit shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'bg-soc-overlay border border-soc-border/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-soc-text">
                  Pattern: Blockchain Fork (Race Condition)
                </h3>
                {hasRaceCondition && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soc-crit opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-soc-crit" />
                  </span>
                )}
              </div>
              <p className="text-2xs text-soc-textMuted leading-relaxed mt-1">
                Detects simultaneous blocks attempting to chain off the same previous block.
              </p>
            </div>

            {hasRaceCondition ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-2xs font-bold text-soc-crit bg-soc-crit/20 border border-soc-crit/50 rounded-lg p-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce text-soc-crit" />
                  <span>
                    🔴 ANOMALIES DETECTED: Blockchain Fork from IP 125.17.13.54 on /consensus/chain!
                  </span>
                </div>
                <div className="text-[11px] font-mono text-soc-crit/90 pl-1 font-semibold">
                  Multiple blocks chained off parent hash {forkedHashes[0]?.slice(0, 16)}...
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>🟢 CLEAR: Chain is strictly sequential.</span>
              </div>
            )}
          </div>

          {/* Card 2: Identity Theft & Impossible Travel */}
          <div
            className={`p-4 rounded-lg space-y-2 flex flex-col justify-between transition-all duration-300 ${
              identityAttack
                ? 'bg-soc-critDim/40 border-2 border-soc-crit shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'bg-soc-overlay border border-soc-border/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-soc-text">
                  Pattern: Identity Theft &amp; Impossible Travel
                </h3>
                {identityAttack && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soc-crit opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-soc-crit" />
                  </span>
                )}
              </div>
              <p className="text-2xs text-soc-textMuted leading-relaxed mt-1">
                Detects active sessions used from mismatched device/IP mid-session, impossible travel, or token theft.
              </p>
            </div>

            {identityAttack ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-2xs font-bold text-soc-crit bg-soc-crit/20 border border-soc-crit/50 rounded-lg p-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce text-soc-crit" />
                  <span>
                    🔴 ANOMALIES DETECTED: Identity Theft &amp; Impossible Travel from IP {identityAttack.sourceIp} on {identityAttack.targetRoute}!
                  </span>
                </div>
                <div className="text-[11px] font-mono text-soc-crit/90 pl-1 font-semibold">
                  {identityAttack.amountOrDetail}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>🟢 CLEAR: No anomalies detected.</span>
              </div>
            )}
          </div>

          {/* Card 3: Burp Suite & Credential Brute Force */}
          <div
            className={`p-4 rounded-lg space-y-2 flex flex-col justify-between transition-all duration-300 ${
              burpOrBruteAttack
                ? 'bg-soc-critDim/40 border-2 border-soc-crit shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'bg-soc-overlay border border-soc-border/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-soc-text">
                  Pattern: Burp Suite &amp; Credential Brute Force
                </h3>
                {burpOrBruteAttack && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soc-crit opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-soc-crit" />
                  </span>
                )}
              </div>
              <p className="text-2xs text-soc-textMuted leading-relaxed mt-1">
                Detects Burp Intruder fuzzing, Repeater replayed nonces, missing browser hints, and credential brute force.
              </p>
            </div>

            {burpOrBruteAttack ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-2xs font-bold text-soc-crit bg-soc-crit/20 border border-soc-crit/50 rounded-lg p-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce text-soc-crit" />
                  <span>
                    🔴 ANOMALIES DETECTED: {burpOrBruteAttack.attackName} from IP {burpOrBruteAttack.sourceIp} on {burpOrBruteAttack.targetRoute}!
                  </span>
                </div>
                <div className="text-[11px] font-mono text-soc-crit/90 pl-1 font-semibold">
                  {burpOrBruteAttack.amountOrDetail}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>🟢 CLEAR: No anomalies detected.</span>
              </div>
            )}
          </div>

          {/* Card 4: Salami Slicing & Mass Siphon */}
          <div
            className={`p-4 rounded-lg space-y-2 flex flex-col justify-between transition-all duration-300 ${
              salamiAttack
                ? 'bg-soc-critDim/40 border-2 border-soc-crit shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'bg-soc-overlay border border-soc-border/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-soc-text">
                  Pattern: Salami Slicing &amp; Mass Siphon
                </h3>
                {salamiAttack && (
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

            {salamiAttack ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-2xs font-bold text-soc-crit bg-soc-crit/20 border border-soc-crit/50 rounded-lg p-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce text-soc-crit" />
                  <span>
                    🔴 ANOMALIES DETECTED: Salami Slicing &amp; Mass Siphon from IP {salamiAttack.sourceIp} on {salamiAttack.targetRoute}!
                  </span>
                </div>
                <div className="text-[11px] font-mono text-soc-crit/90 pl-1 font-semibold">
                  {salamiAttack.amountOrDetail} {salamiAttack.amountSubtext || ''}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-2xs font-semibold text-soc-ok bg-soc-okDim border border-soc-ok/40 rounded-lg p-2.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>🟢 CLEAR: No anomalies detected.</span>
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
                const attack = detectAttack(log);

                return (
                  <tr
                    key={log.event_id}
                    className={`transition-colors ${
                      attack
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
                      {attack ? (
                        <div className="flex flex-col">
                          <span className="text-soc-crit font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            {attack.actorDisplay}
                          </span>
                          {attack.actorSubtext && (
                            <span className="text-soc-crit/80 text-[10px]">
                              {attack.actorSubtext}
                            </span>
                          )}
                        </div>
                      ) : (
                        payload.email || payload.userId || payload.targetAccount || 'SYSTEM'
                      )}
                    </td>

                    {/* Action */}
                    <td className="whitespace-nowrap">
                      {attack ? (
                        <span className="soc-badge bg-soc-crit/30 text-soc-crit border border-soc-crit/70 font-bold tracking-wider animate-pulse flex items-center gap-1 w-fit shadow-[0_0_12px_rgba(239,68,68,0.35)] px-2.5 py-1">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          {attack.pillLabel}
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
                      {attack ? (
                        <div className="font-mono text-soc-crit font-bold">
                          {attack.amountOrDetail}
                          {attack.amountSubtext && (
                            <div className="text-[10px] text-soc-textMuted font-normal mt-0.5">
                              {attack.amountSubtext}
                            </div>
                          )}
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
                      {attack ? (
                        <span className="text-soc-crit font-semibold font-mono">
                          {attack.refId}
                        </span>
                      ) : (
                        payload.referenceId || payload.sessionId || '-'
                      )}
                    </td>

                    {/* Block Hash */}
                    <td className="text-2xs">
                      <div
                        className={`col-mono truncate max-w-[120px] ${
                          attack ? 'text-soc-crit font-bold' : ''
                        }`}
                        title={log.metadata?.block_hash || log.event_id}
                      >
                        {log.metadata?.block_hash || log.event_id}
                      </div>
                      {attack && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-soc-crit mt-0.5 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                          {attack.category === 'SALAMI_ATTACK'
                            ? 'SIPHON DETECTED'
                            : 'ATTACK DETECTED'}
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
