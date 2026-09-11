'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import * as SocIcons from '@/components/icons';
import { SocIconProps } from '@/components/icons';

// Mapping from anviksa-icon-map.json
const SOC_FEATURE_MAP: Record<string, string> = {
  commandCentre: 'dashboard',
  supervisory: 'soar',
  findings: 'alert',
  analytics: 'analytics',
  riskQuantification: 'shield-alert',
  threatRecurrence: 'refresh',
  analystWorkload: 'users',
  alertStreams: 'bell',
  incidents: 'incident',
  investigations: 'search',
  supervisoryCases: 'case',
  evidenceVault: 'search',
  hashLedger: 'file',
  sessionEnclave: 'lock',
  reports: 'report',
  simulationHub: 'sliders',
  enclaveSettings: 'settings',
  liveActivity: 'activity',
  realTimeTelemetry: 'pulse',
  criticalFinding: 'alert',
  anomaly: 'activity',
  threat: 'threat',
  threatIntelligence: 'chart-line',
  hunting: 'hunting',
  playbooks: 'playbook',
  response: 'response',
  siem: 'siem',
  soar: 'soar',
  network: 'network',
  endpoint: 'endpoint',
  server: 'server',
  logs: 'logs',
  vulnerability: 'vulnerability',
  malware: 'malware',
  accessControl: 'access',
  identity: 'user',
  cloud: 'cloud',
  apiKey: 'key',
  dataSource: 'data-source',
  integration: 'integration',
  timeline: 'timeline',
  priority: 'target',
  filter: 'filter',
  search: 'search',
  refresh: 'refresh',
  history: 'history',
  calendar: 'calendar',
  clock: 'clock',
  bookmark: 'bookmark',
  settings: 'settings',
  help: 'help',
  info: 'info',
  download: 'download',
  upload: 'upload',
  copy: 'copy',
  edit: 'edit',
  delete: 'trash',
  logout: 'logout',
  login: 'login',
  success: 'check',
  warning: 'alert',
  critical: 'shield-alert',
  approve: 'check',
  deny: 'close',
};

interface IconMeta {
  id: string;
  name: string;
  pascalName: string;
  category: string;
  description: string;
  tags: string[];
}

const ICON_LIST: IconMeta[] = [
  // Command & Navigation
  { id: 'dashboard', name: 'dashboard', pascalName: 'SocDashboard', category: 'Command', description: 'Command Centre main telemetry matrix', tags: ['home', 'grid', 'overview', 'centre'] },
  { id: 'monitoring', name: 'monitoring', pascalName: 'SocMonitoring', category: 'Command', description: 'Real-time telemetry monitor screen', tags: ['display', 'screen', 'surveillance'] },
  { id: 'activity', name: 'activity', pascalName: 'SocActivity', category: 'Command', description: 'Live event stream & heartbeats', tags: ['pulse', 'live', 'status'] },
  { id: 'pulse', name: 'pulse', pascalName: 'SocPulse', category: 'Command', description: 'High-frequency telemetry oscillations', tags: ['signal', 'heartbeat', 'stream'] },
  { id: 'timeline', name: 'timeline', pascalName: 'SocTimeline', category: 'Command', description: 'Incident chronological event sequence', tags: ['history', 'time', 'milestones'] },
  { id: 'history', name: 'history', pascalName: 'SocHistory', category: 'Command', description: 'Historical audit log rollback', tags: ['rewind', 'past', 'time'] },
  { id: 'calendar', name: 'calendar', pascalName: 'SocCalendar', category: 'Command', description: 'Shift rosters and audit dates', tags: ['schedule', 'date', 'planning'] },
  { id: 'clock', name: 'clock', pascalName: 'SocClock', category: 'Command', description: 'Session timer and latency meter', tags: ['time', 'session', 'duration'] },
  { id: 'bookmark', name: 'bookmark', pascalName: 'SocBookmark', category: 'Command', description: 'Pinned findings & examiner bookmarks', tags: ['saved', 'flag', 'pin'] },
  { id: 'star', name: 'star', pascalName: 'SocStar', category: 'Command', description: 'High-priority starred investigations', tags: ['favorite', 'priority', 'important'] },
  { id: 'analytics', name: 'analytics', pascalName: 'SocAnalytics', category: 'Command', description: 'MEDHĀ analytics & statistical trends', tags: ['charts', 'bars', 'metrics'] },
  { id: 'chart-line', name: 'chart-line', pascalName: 'SocChartLine', category: 'Command', description: 'Threat trend velocity trajectory', tags: ['line', 'trend', 'analytics'] },

  // Threats & Detection
  { id: 'alert', name: 'alert', pascalName: 'SocAlert', category: 'Detections', description: 'VIVEKA execution gap alert bell', tags: ['warning', 'finding', 'alarm'] },
  { id: 'incident', name: 'incident', pascalName: 'SocIncident', category: 'Detections', description: 'Escalated security incident badge', tags: ['breach', 'ticket', 'security'] },
  { id: 'investigation', name: 'investigation', pascalName: 'SocInvestigation', category: 'Detections', description: 'Deep forensic case investigation', tags: ['inspect', 'forensics', 'zoom'] },
  { id: 'threat', name: 'threat', pascalName: 'SocThreat', category: 'Detections', description: 'Active adversarial threat vector', tags: ['danger', 'attacker', 'shield'] },
  { id: 'threat-level', name: 'threat-level', pascalName: 'SocThreatLevel', category: 'Detections', description: 'Quantitative threat severity tiers', tags: ['severity', 'level', 'gauge'] },
  { id: 'vulnerability', name: 'vulnerability', pascalName: 'SocVulnerability', category: 'Detections', description: 'Unpatched flaw & weakness exposure', tags: ['cve', 'bug', 'exposure'] },
  { id: 'malware', name: 'malware', pascalName: 'SocMalware', category: 'Detections', description: 'Host payload & malicious binary', tags: ['trojan', 'ransomware', 'binary'] },
  { id: 'virus', name: 'virus', pascalName: 'SocVirus', category: 'Detections', description: 'Spreading organism or worm infection', tags: ['infection', 'biological', 'threat'] },
  { id: 'bug', name: 'bug', pascalName: 'SocBug', category: 'Detections', description: 'Logic defect & script failure', tags: ['defect', 'code', 'error'] },
  { id: 'hunting', name: 'hunting', pascalName: 'SocHunting', category: 'Detections', description: 'Proactive adversary threat hunting', tags: ['search', 'radar', 'pursuit'] },
  { id: 'target', name: 'target', pascalName: 'SocTarget', category: 'Detections', description: 'High-value asset targeting', tags: ['bullseye', 'focus', 'objective'] },
  { id: 'zap', name: 'zap', pascalName: 'SocZap', category: 'Detections', description: 'VIVEKA automated execution gap', tags: ['flash', 'quick', 'energy'] },
  { id: 'shield-alert', name: 'shield-alert', pascalName: 'SocShieldAlert', category: 'Detections', description: 'Critical supervisory defense alert', tags: ['shield', 'warning', 'breach'] },

  // Trust & Security Enclave
  { id: 'shield', name: 'shield', pascalName: 'SocShield', category: 'Trust & Enclave', description: 'Sovereign protection boundary', tags: ['defense', 'armor', 'safe'] },
  { id: 'shield-check', name: 'shield-check', pascalName: 'SocShieldCheck', category: 'Trust & Enclave', description: 'Air-gap verified & cryptographically attested', tags: ['ok', 'valid', 'verified'] },
  { id: 'lock', name: 'lock', pascalName: 'SocLock', category: 'Trust & Enclave', description: 'KAVACA secure session enclave lock', tags: ['secure', 'vault', 'crypto'] },
  { id: 'key', name: 'key', pascalName: 'SocKey', category: 'Trust & Enclave', description: 'KṢAṆA ephemeral session private key', tags: ['token', 'auth', 'crypto'] },
  { id: 'access', name: 'access', pascalName: 'SocAccess', category: 'Trust & Enclave', description: 'RBAC clearance authorization grant', tags: ['permission', 'clearance', 'grant'] },
  { id: 'certificate', name: 'certificate', pascalName: 'SocCertificate', category: 'Trust & Enclave', description: 'X.509 PKI attestation certificate', tags: ['pki', 'ssl', 'seal'] },
  { id: 'policy', name: 'policy', pascalName: 'SocPolicy', category: 'Trust & Enclave', description: 'Supervisory enclave security policy', tags: ['rules', 'standards', 'governance'] },
  { id: 'user', name: 'user', pascalName: 'SocUser', category: 'Trust & Enclave', description: 'SOC operator identity record', tags: ['analyst', 'operator', 'account'] },
  { id: 'users', name: 'users', pascalName: 'SocUsers', category: 'Trust & Enclave', description: 'Supervisory team & analyst roster', tags: ['team', 'workforce', 'analysts'] },
  { id: 'team', name: 'team', pascalName: 'SocTeam', category: 'Trust & Enclave', description: 'Multi-tiered defense unit', tags: ['squad', 'cell', 'tier'] },
  { id: 'search-user', name: 'search-user', pascalName: 'SocSearchUser', category: 'Trust & Enclave', description: 'Operator lookup & credential inspection', tags: ['lookup', 'whois', 'analyst'] },
  { id: 'login', name: 'login', pascalName: 'SocLogin', category: 'Trust & Enclave', description: 'Hardware token authentication enter', tags: ['auth', 'signin', 'bandha'] },
  { id: 'logout', name: 'logout', pascalName: 'SocLogout', category: 'Trust & Enclave', description: 'Enclave session termination exit', tags: ['exit', 'signout', 'terminate'] },

  // Infrastructure & Telemetry
  { id: 'network', name: 'network', pascalName: 'SocNetwork', category: 'Infrastructure', description: 'Internal topology & subnet routing', tags: ['nodes', 'lan', 'connectivity'] },
  { id: 'endpoint', name: 'endpoint', pascalName: 'SocEndpoint', category: 'Infrastructure', description: 'Analyst terminal & workstation', tags: ['workstation', 'pc', 'device'] },
  { id: 'server', name: 'server', pascalName: 'SocServer', category: 'Infrastructure', description: 'Core air-gapped processing node', tags: ['host', 'compute', 'rack'] },
  { id: 'database', name: 'database', pascalName: 'SocDatabase', category: 'Infrastructure', description: 'Local PostgreSQL & Redis store', tags: ['storage', 'sql', 'records'] },
  { id: 'logs', name: 'logs', pascalName: 'SocLogs', category: 'Infrastructure', description: 'Immutable raw telemetry stream', tags: ['syslog', 'audit', 'journal'] },
  { id: 'cloud', name: 'cloud', pascalName: 'SocCloud', category: 'Infrastructure', description: 'Protected cloud interconnect', tags: ['hybrid', 'egress', 'infra'] },
  { id: 'cloud-alert', name: 'cloud-alert', pascalName: 'SocCloudAlert', category: 'Infrastructure', description: 'Unapproved cloud egress attempt', tags: ['egress', 'leak', 'violation'] },
  { id: 'firewall', name: 'firewall', pascalName: 'SocFirewall', category: 'Infrastructure', description: 'Perimeter hardware filter barrier', tags: ['filter', 'packet', 'block'] },
  { id: 'api', name: 'api', pascalName: 'SocApi', category: 'Infrastructure', description: 'Internal local REST/gRPC endpoints', tags: ['endpoint', 'connector', 'integration'] },
  { id: 'integration', name: 'integration', pascalName: 'SocIntegration', category: 'Infrastructure', description: 'SOC toolchain data pipeline binding', tags: ['connect', 'siem', 'edr'] },
  { id: 'data-source', name: 'data-source', pascalName: 'SocDataSource', category: 'Infrastructure', description: 'SAṄGRAHA air-gapped ingestion feed', tags: ['feed', 'input', 'collector'] },
  { id: 'wifi', name: 'wifi', pascalName: 'SocWifi', category: 'Infrastructure', description: 'Radio frequency RF air-gap monitor', tags: ['wireless', 'rf', 'signal'] },
  { id: 'terminal', name: 'terminal', pascalName: 'SocTerminal', category: 'Infrastructure', description: 'Cryptographic CLI inspection shell', tags: ['shell', 'console', 'bash'] },
  { id: 'code', name: 'code', pascalName: 'SocCode', category: 'Infrastructure', description: 'Detection rule parser & script', tags: ['syntax', 'rules', 'sigma'] },

  // Operations & Workflow
  { id: 'case', name: 'case', pascalName: 'SocCase', category: 'Operations', description: 'Supervisory case folder container', tags: ['dossier', 'folder', 'matter'] },
  { id: 'task', name: 'task', pascalName: 'SocTask', category: 'Operations', description: 'Assigned examiner action checklist', tags: ['todo', 'action', 'step'] },
  { id: 'playbook', name: 'playbook', pascalName: 'SocPlaybook', category: 'Operations', description: 'UPĀYA standard operating procedure', tags: ['sop', 'runbook', 'workflow'] },
  { id: 'workflow', name: 'workflow', pascalName: 'SocWorkflow', category: 'Operations', description: 'End-to-end incident pipeline flow', tags: ['pipeline', 'process', 'graph'] },
  { id: 'response', name: 'response', pascalName: 'SocResponse', category: 'Operations', description: 'Automated containment action execution', tags: ['remediation', 'containment', 'action'] },
  { id: 'soar', name: 'soar', pascalName: 'SocSoar', category: 'Operations', description: 'Supervisory automation orchestration', tags: ['orchestrator', 'supervision', 'robot'] },
  { id: 'siem', name: 'siem', pascalName: 'SocSiem', category: 'Operations', description: 'Security information event monitor', tags: ['collector', 'correlation', 'engine'] },
  { id: 'report', name: 'report', pascalName: 'SocReport', category: 'Operations', description: 'NTRO examiner compliance audit report', tags: ['pdf', 'dossier', 'document'] },
  { id: 'file', name: 'file', pascalName: 'SocFile', category: 'Operations', description: 'SAKṢĪ cryptographic audit record', tags: ['document', 'hash', 'evidence'] },
  { id: 'folder', name: 'folder', pascalName: 'SocFolder', category: 'Operations', description: 'Evidence vault storage directory', tags: ['archive', 'directory', 'storage'] },
  { id: 'check', name: 'check', pascalName: 'SocCheck', category: 'Operations', description: 'Rule satisfaction & compliance passed', tags: ['pass', 'ok', 'resolved'] },
  { id: 'close', name: 'close', pascalName: 'SocClose', category: 'Operations', description: 'Case closure & incident dismissal', tags: ['dismiss', 'cancel', 'cross'] },

  // Utilities & Controls
  { id: 'search', name: 'search', pascalName: 'SocSearch', category: 'Controls & Utilities', description: 'PRATYAYA forensic evidence finder', tags: ['find', 'lookup', 'query'] },
  { id: 'filter', name: 'filter', pascalName: 'SocFilter', category: 'Controls & Utilities', description: 'Telemetry facet reduction funnel', tags: ['narrow', 'scope', 'triage'] },
  { id: 'sort', name: 'sort', pascalName: 'SocSort', category: 'Controls & Utilities', description: 'Priority ordering asc/desc', tags: ['order', 'rank', 'arrange'] },
  { id: 'refresh', name: 'refresh', pascalName: 'SocRefresh', category: 'Controls & Utilities', description: 'PUNARĀVṚTTI recurrence sync', tags: ['reload', 'sync', 'cycle'] },
  { id: 'sliders', name: 'sliders', pascalName: 'SocSliders', category: 'Controls & Utilities', description: 'MĀYĀ scenario tuning parameters', tags: ['tune', 'threshold', 'controls'] },
  { id: 'settings', name: 'settings', pascalName: 'SocSettings', category: 'Controls & Utilities', description: 'Enclave administration configuration', tags: ['gear', 'config', 'admin'] },
  { id: 'bell', name: 'bell', pascalName: 'SocBell', category: 'Controls & Utilities', description: 'Notification chime for critical queues', tags: ['notify', 'alert', 'chime'] },
  { id: 'mail', name: 'mail', pascalName: 'SocMail', category: 'Controls & Utilities', description: 'Local encrypted dispatch message', tags: ['envelope', 'dispatch', 'inbox'] },
  { id: 'message', name: 'message', pascalName: 'SocMessage', category: 'Controls & Utilities', description: 'Analyst shift collaboration note', tags: ['chat', 'note', 'comment'] },
  { id: 'send', name: 'send', pascalName: 'SocSend', category: 'Controls & Utilities', description: 'Dispatch finding to supervisor review', tags: ['transmit', 'forward', 'paperplane'] },
  { id: 'download', name: 'download', pascalName: 'SocDownload', category: 'Controls & Utilities', description: 'Export examiner dossier markdown/pdf', tags: ['export', 'save', 'get'] },
  { id: 'upload', name: 'upload', pascalName: 'SocUpload', category: 'Controls & Utilities', description: 'Import air-gapped PCAP or JSON dump', tags: ['ingest', 'load', 'import'] },
  { id: 'copy', name: 'copy', pascalName: 'SocCopy', category: 'Controls & Utilities', description: 'Copy SHA-256 ledger hash to clipboard', tags: ['clipboard', 'duplicate', 'hash'] },
  { id: 'edit', name: 'edit', pascalName: 'SocEdit', category: 'Controls & Utilities', description: 'Annotate forensic observation note', tags: ['pencil', 'write', 'modify'] },
  { id: 'trash', name: 'trash', pascalName: 'SocTrash', category: 'Controls & Utilities', description: 'Purge ephemeral telemetry artifact', tags: ['delete', 'remove', 'clean'] },
  { id: 'link', name: 'link', pascalName: 'SocLink', category: 'Controls & Utilities', description: 'Associate alert with incident record', tags: ['chain', 'relation', 'bind'] },
  { id: 'pin', name: 'pin', pascalName: 'SocPin', category: 'Controls & Utilities', description: 'Pin finding to supervisor war room', tags: ['fasten', 'anchor', 'stick'] },
  { id: 'globe', name: 'globe', pascalName: 'SocGlobe', category: 'Controls & Utilities', description: 'National cyber jurisdiction scope', tags: ['world', 'ntro', 'national'] },
  { id: 'eye', name: 'eye', pascalName: 'SocEye', category: 'Controls & Utilities', description: 'Supervisory visibility mode active', tags: ['inspect', 'view', 'watch'] },
  { id: 'eye-off', name: 'eye-off', pascalName: 'SocEyeOff', category: 'Controls & Utilities', description: 'Blindspot & unmonitored asset segment', tags: ['hidden', 'blindspot', 'dark'] },
  { id: 'plus', name: 'plus', pascalName: 'SocPlus', category: 'Controls & Utilities', description: 'Add new supervisory test rule', tags: ['add', 'create', 'new'] },
  { id: 'minus', name: 'minus', pascalName: 'SocMinus', category: 'Controls & Utilities', description: 'Reduce sensitivity threshold', tags: ['subtract', 'remove', 'less'] },
  { id: 'help', name: 'help', pascalName: 'SocHelp', category: 'Controls & Utilities', description: 'SAT-SA operator documentation', tags: ['question', 'faq', 'support'] },
  { id: 'info', name: 'info', pascalName: 'SocInfo', category: 'Controls & Utilities', description: 'Methodological context tooltip', tags: ['information', 'about', 'guide'] },
  { id: 'pause', name: 'pause', pascalName: 'SocPause', category: 'Controls & Utilities', description: 'Pause simulation event stream', tags: ['hold', 'suspend', 'freeze'] },
  { id: 'play', name: 'play', pascalName: 'SocPlay', category: 'Controls & Utilities', description: 'Resume simulation attack scenario', tags: ['start', 'run', 'execute'] },
];

const CATEGORIES = ['All', 'Command', 'Detections', 'Trust & Enclave', 'Infrastructure', 'Operations', 'Controls & Utilities'] as const;

type IconSize = 16 | 20 | 24 | 32 | 48;
type ColorState = 'muted' | 'cyan' | 'ok' | 'crit' | 'warn' | 'intel';

export default function IconPackExplorerPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedIcon, setSelectedIcon] = useState<IconMeta | null>(ICON_LIST[0]);
  const [previewSize, setPreviewSize] = useState<IconSize>(24);
  const [colorState, setColorState] = useState<ColorState>('cyan');
  const [activeTab, setActiveTab] = useState<'catalog' | 'mapping' | 'guide'>('catalog');
  const [copiedState, setCopiedState] = useState<string | null>(null);

  const filteredIcons = useMemo(() => {
    return ICON_LIST.filter((icon) => {
      const matchesCat = activeCategory === 'All' || icon.category === activeCategory;
      if (!matchesCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        icon.id.toLowerCase().includes(q) ||
        icon.name.toLowerCase().includes(q) ||
        icon.pascalName.toLowerCase().includes(q) ||
        icon.description.toLowerCase().includes(q) ||
        icon.tags.some((t) => t.toLowerCase().includes(q)) ||
        Object.entries(SOC_FEATURE_MAP).some(
          ([feat, id]) => id === icon.id && feat.toLowerCase().includes(q)
        )
      );
    });
  }, [activeCategory, search]);

  const getColorClass = (state: ColorState) => {
    switch (state) {
      case 'cyan':
        return 'text-soc-accent';
      case 'ok':
        return 'text-soc-ok';
      case 'crit':
        return 'text-soc-crit';
      case 'warn':
        return 'text-soc-med';
      case 'intel':
        return 'text-indigo-400';
      default:
        return 'text-soc-textMuted';
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 1800);
  };

  const handleDownloadSvg = async (iconId: string) => {
    try {
      const res = await fetch(`/icons/${iconId}.svg`);
      if (!res.ok) throw new Error('SVG not found');
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soc-${iconId}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      handleCopy(`<svg ...>${iconId}</svg>`, 'Downloaded');
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <Link href="/" className="hover:text-soc-text transition-colors">ANVĪKṢA</Link>
            <span className="text-soc-textDim">/</span>
            <Link href="/admin" className="hover:text-soc-text transition-colors">DESIGN_SYSTEM</Link>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent font-semibold">SOC_ICON_PACK</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-soc-text flex items-center gap-2.5">
            <span>ANVĪKṢA SOC Lucide-Inspired Icon Family</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-soc-accentDim text-soc-accent border border-soc-accent/30">
              90 ICONS
            </span>
          </h1>
          <p className="text-xs text-soc-textMuted mt-1 max-w-3xl">
            Complete sovereign, air-gapped 2.2px outline vector icon family engineered specifically for supervisory SOC analytics,
            investigations, evidence ledgers, and operator consoles. Zero external CDN dependencies.
          </p>
        </div>

        {/* Header Stats */}
        <div className="flex flex-wrap items-center gap-2 text-3xs font-mono">
          <span className="px-2.5 py-1 rounded bg-soc-raised border border-soc-border text-soc-textSecondary">
            Stroke: <strong className="text-soc-text">2.2px Round</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-soc-raised border border-soc-border text-soc-textSecondary">
            Grid: <strong className="text-soc-text">24×24 (20px UI)</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold">
            ● 100% Offline Air-Gapped
          </span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between border-b border-soc-border pb-2 gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-soc-raised/60 p-1 rounded-lg border border-soc-border">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'catalog'
                ? 'bg-soc-panel text-soc-text shadow-sm border border-soc-borderStrong'
                : 'text-soc-textMuted hover:text-soc-text'
            }`}
          >
            Icon Catalog ({filteredIcons.length})
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'mapping'
                ? 'bg-soc-panel text-soc-text shadow-sm border border-soc-borderStrong'
                : 'text-soc-textMuted hover:text-soc-text'
            }`}
          >
            SOC Feature Mapping ({Object.keys(SOC_FEATURE_MAP).length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'guide'
                ? 'bg-soc-panel text-soc-text shadow-sm border border-soc-borderStrong'
                : 'text-soc-textMuted hover:text-soc-text'
            }`}
          >
            Usage &amp; Integration Guide
          </button>
        </div>

        {/* Global Controls: Size & Color */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-3xs font-mono text-soc-textMuted">
            <span>Size:</span>
            {([16, 20, 24, 32, 48] as IconSize[]).map((sz) => (
              <button
                key={sz}
                onClick={() => setPreviewSize(sz)}
                className={`px-1.5 py-0.5 rounded border text-3xs tabular-nums transition-all ${
                  previewSize === sz
                    ? 'bg-soc-accent text-white border-soc-accent font-bold'
                    : 'bg-soc-raised border-soc-border text-soc-textMuted hover:text-soc-text'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-3xs font-mono text-soc-textMuted">
            <span>State:</span>
            {(['muted', 'cyan', 'ok', 'crit', 'warn', 'intel'] as ColorState[]).map((st) => (
              <button
                key={st}
                onClick={() => setColorState(st)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  colorState === st ? 'scale-125 ring-2 ring-soc-accent/40' : 'opacity-70 hover:opacity-100'
                } ${
                  st === 'cyan'
                    ? 'bg-sky-400 border-sky-500'
                    : st === 'ok'
                    ? 'bg-emerald-500 border-emerald-600'
                    : st === 'crit'
                    ? 'bg-rose-500 border-rose-600'
                    : st === 'warn'
                    ? 'bg-amber-500 border-amber-600'
                    : st === 'intel'
                    ? 'bg-indigo-400 border-indigo-500'
                    : 'bg-slate-400 border-slate-500'
                }`}
                title={`Theme state: ${st}`}
              />
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Categories */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 90 icons by name, category, or feature (e.g. alert, evidence, viveka, malware)..."
                className="w-full px-3 py-2 pl-9 rounded-lg border border-soc-border bg-soc-panel text-xs text-soc-text placeholder:text-soc-textDim focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition-all"
              />
              <span className="absolute left-3 top-2.5 text-soc-textDim">
                <SocIcons.SocSearch size={14} />
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-soc-textDim hover:text-soc-text"
                >
                  <SocIcons.SocClose size={12} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-2xs font-medium">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-soc-accent/10 border-soc-accent text-soc-accent font-semibold'
                      : 'bg-soc-panel border-soc-border text-soc-textSecondary hover:text-soc-text hover:bg-soc-raised'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Grid + Selected Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 90 Icons Grid (8 cols on large) */}
            <div className="lg:col-span-8 space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {filteredIcons.map((icon) => {
                  const IconComp = (SocIcons as any)[icon.pascalName] || SocIcons.SocShield;
                  const isSelected = selectedIcon?.id === icon.id;

                  return (
                    <button
                      key={icon.id}
                      onClick={() => setSelectedIcon(icon)}
                      className={`group flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-soc-accentDim border-soc-accent ring-1 ring-soc-accent shadow-sm'
                          : 'bg-soc-panel border-soc-border hover:border-soc-borderStrong hover:bg-soc-raised/80'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center transition-transform group-hover:scale-110 mb-2 ${getColorClass(
                          colorState
                        )}`}
                        style={{ height: Math.max(32, previewSize), width: Math.max(32, previewSize) }}
                      >
                        <IconComp size={previewSize} />
                      </div>
                      <span className="text-2xs font-mono font-medium text-soc-text truncate w-full">
                        {icon.id}
                      </span>
                      <span className="text-3xs font-mono text-soc-textDim truncate w-full mt-0.5">
                        {icon.pascalName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="soc-panel p-10 text-center text-xs font-mono text-soc-textMuted">
                  NO ICONS FOUND MATCHING "{search.toUpperCase()}"
                </div>
              )}
            </div>

            {/* Selected Icon Inspector Card (4 cols on large) */}
            <div className="lg:col-span-4">
              {selectedIcon ? (
                <div className="sticky top-16 soc-panel p-5 space-y-4 rounded-xl border border-soc-borderStrong shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-3xs font-mono uppercase tracking-wider text-soc-accent font-semibold">
                        {selectedIcon.category}
                      </span>
                      <h3 className="text-base font-bold text-soc-text font-mono mt-0.5">
                        {selectedIcon.pascalName}
                      </h3>
                      <p className="text-3xs font-mono text-soc-textMuted">
                        /icons/{selectedIcon.id}.svg
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-soc-raised border border-soc-border text-3xs font-mono text-soc-textSecondary">
                      24×24 v2.2
                    </span>
                  </div>

                  {/* Large Icon Preview Showcase */}
                  <div className="w-full h-36 rounded-lg bg-soc-raised/80 border border-soc-border flex items-center justify-center relative overflow-hidden">
                    <div className={`transition-all ${getColorClass(colorState)}`}>
                      {(() => {
                        const Comp = (SocIcons as any)[selectedIcon.pascalName] || SocIcons.SocShield;
                        return <Comp size={56} />;
                      })()}
                    </div>
                    <span className="absolute bottom-2 right-2 text-3xs font-mono text-soc-textDim">
                      56px preview
                    </span>
                  </div>

                  <p className="text-xs text-soc-textSecondary leading-relaxed">
                    {selectedIcon.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {selectedIcon.tags.map((t) => (
                      <span
                        key={t}
                        className="text-3xs font-mono px-2 py-0.5 rounded bg-soc-raised border border-soc-border text-soc-textMuted"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Mapped Feature */}
                  {Object.entries(SOC_FEATURE_MAP).find(([, id]) => id === selectedIcon.id) && (
                    <div className="p-2.5 rounded-lg bg-soc-accentDim/60 border border-soc-accent/30 text-xs">
                      <div className="text-3xs font-mono text-soc-accent font-semibold uppercase">
                        ANVĪKṢA Assigned Feature
                      </div>
                      <div className="font-mono text-xs font-bold text-soc-text mt-0.5">
                        {Object.entries(SOC_FEATURE_MAP).find(([, id]) => id === selectedIcon.id)?.[0]}
                      </div>
                    </div>
                  )}

                  {/* Copy Actions */}
                  <div className="space-y-2 pt-2 border-t border-soc-border">
                    {/* Copy TSX Component */}
                    <button
                      onClick={() =>
                        handleCopy(
                          `import { ${selectedIcon.pascalName} } from '@/components/icons';\n\n<${selectedIcon.pascalName} size={${previewSize}} className="${getColorClass(colorState)}" />`,
                          'Component'
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-soc-raised hover:bg-soc-raised/80 border border-soc-border text-xs font-mono text-soc-text transition-all group"
                    >
                      <span className="truncate">Copy React Component</span>
                      <span className="text-3xs text-soc-accent font-semibold">
                        {copiedState === 'Component' ? 'COPIED!' : 'COPY TSX'}
                      </span>
                    </button>

                    {/* Copy SVG File Path */}
                    <button
                      onClick={() => handleCopy(`/icons/${selectedIcon.id}.svg`, 'Path')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-soc-raised hover:bg-soc-raised/80 border border-soc-border text-xs font-mono text-soc-text transition-all"
                    >
                      <span className="truncate">Copy SVG Path</span>
                      <span className="text-3xs text-soc-accent font-semibold">
                        {copiedState === 'Path' ? 'COPIED!' : 'COPY PATH'}
                      </span>
                    </button>

                    {/* Download SVG */}
                    <button
                      onClick={() => handleDownloadSvg(selectedIcon.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-soc-accent text-white hover:bg-soc-accentBright text-xs font-medium shadow-sm transition-all"
                    >
                      <SocIcons.SocDownload size={14} />
                      <span>Download {selectedIcon.id}.svg</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Feature Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <div className="soc-panel p-4 border border-soc-border">
            <h2 className="text-sm font-bold text-soc-text mb-1">
              ANVĪKṢA SOC Product Feature Icon Map
            </h2>
            <p className="text-xs text-soc-textMuted">
              This dictionary defines the standard visual metaphor used across each module of the supervisory platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(SOC_FEATURE_MAP).map(([featureName, iconId]) => {
              const iconMeta = ICON_LIST.find((i) => i.id === iconId);
              const Comp = iconMeta ? (SocIcons as any)[iconMeta.pascalName] : SocIcons.SocShield;

              return (
                <div
                  key={featureName}
                  className="soc-panel p-3.5 border border-soc-border hover:border-soc-accent/40 rounded-xl transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold text-soc-text truncate">
                      {featureName}
                    </div>
                    <div className="text-3xs font-mono text-soc-textMuted mt-0.5">
                      Glyph: <span className="text-soc-accent font-semibold">{iconId}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-soc-raised border border-soc-border flex items-center justify-center text-soc-accent flex-shrink-0">
                    {Comp && <Comp size={20} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integration Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-5 max-w-4xl">
          <div className="soc-panel p-5 space-y-4 border border-soc-border">
            <h2 className="text-base font-bold text-soc-text font-mono">
              1. React / Next.js Component Import
            </h2>
            <p className="text-xs text-soc-textSecondary">
              All 90 icons are packaged as zero-dependency TypeScript components in <code className="text-soc-accent">@/components/icons</code>.
            </p>
            <pre className="p-3 rounded-lg bg-soc-raised border border-soc-border font-mono text-xs text-soc-text overflow-x-auto">
{`// Import individual icons or families
import {
  SocShieldCheck,
  SocDashboard,
  SocAlert,
  SocIncident,
  SocInvestigation,
  SocCase,
  SocLock,
} from '@/components/icons';

export function MyComponent() {
  return (
    <div className="flex items-center gap-2">
      <SocShieldCheck size={20} className="text-soc-ok" />
      <span>Air-Gap Attestation Verified</span>
    </div>
  );
}`}
            </pre>
          </div>

          <div className="soc-panel p-5 space-y-4 border border-soc-border">
            <h2 className="text-base font-bold text-soc-text font-mono">
              2. Static SVG Vectors &amp; Public Assets
            </h2>
            <p className="text-xs text-soc-textSecondary">
              Static SVGs are hosted locally under <code className="text-soc-accent">/public/icons/</code>. You can reference them directly with standard <code className="text-soc-accent">&lt;img&gt;</code> tags or CSS backgrounds:
            </p>
            <pre className="p-3 rounded-lg bg-soc-raised border border-soc-border font-mono text-xs text-soc-text overflow-x-auto">
{`<!-- Direct static HTML or Image reference -->
<img src="/icons/shield-check.svg" width="20" height="20" alt="Verified Shield" />
<img src="/icons/dashboard.svg" width="20" height="20" alt="Dashboard" />`}
            </pre>
          </div>

          <div className="soc-panel p-5 space-y-4 border border-soc-border">
            <h2 className="text-base font-bold text-soc-text font-mono">
              3. Semantic Color Tokens
            </h2>
            <p className="text-xs text-soc-textSecondary">
              The ANViKSa design system reserves specific colors for distinct operational states:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-soc-border bg-soc-raised">
                <div className="flex items-center gap-2 font-mono font-bold text-soc-accent">
                  <SocIcons.SocPulse size={16} />
                  <span>Signal Cyan</span>
                </div>
                <p className="text-3xs text-soc-textMuted mt-1">Active telemetry paths, focus states, command centre routes.</p>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-raised">
                <div className="flex items-center gap-2 font-mono font-bold text-soc-ok">
                  <SocIcons.SocShieldCheck size={16} />
                  <span>Emerald Verified</span>
                </div>
                <p className="text-3xs text-soc-textMuted mt-1">Air-gap attestation, clean hash ledger, healthy SOC grade.</p>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-raised">
                <div className="flex items-center gap-2 font-mono font-bold text-soc-crit">
                  <SocIcons.SocAlert size={16} />
                  <span>Kinetic Rose</span>
                </div>
                <p className="text-3xs text-soc-textMuted mt-1">Critical findings, SOP omissions, active compromised hosts.</p>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-raised">
                <div className="flex items-center gap-2 font-mono font-bold text-soc-med">
                  <SocIcons.SocShieldAlert size={16} />
                  <span>Amber Warning</span>
                </div>
                <p className="text-3xs text-soc-textMuted mt-1">Backlog fatigue, investigation gaps, moderate risk score.</p>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-raised">
                <div className="flex items-center gap-2 font-mono font-bold text-indigo-400">
                  <SocIcons.SocActivity size={16} />
                  <span>Violet Intelligence</span>
                </div>
                <p className="text-3xs text-soc-textMuted mt-1">MEDHĀ ML inference, supervisory anomaly scoring, DeepSeek reasoning.</p>
              </div>

              <div className="p-3 rounded-lg border border-soc-border bg-soc-raised">
                <div className="flex items-center gap-2 font-mono font-bold text-soc-textMuted">
                  <SocIcons.SocLock size={16} />
                  <span>Muted Slate</span>
                </div>
                <p className="text-3xs text-soc-textMuted mt-1">Default idle icons, secondary navigation, neutral borders.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
