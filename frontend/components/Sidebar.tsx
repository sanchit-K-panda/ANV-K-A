'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AirGapModal from './AirGapModal';
import {
  SocShieldCheck,
  SocDashboard,
  SocSoar,
  SocAlert,
  SocAnalytics,
  SocShieldAlert,
  SocRefresh,
  SocUsers,
  SocBell,
  SocIncident,
  SocInvestigation,
  SocCase,
  SocSearch,
  SocFile,
  SocLock,
  SocReport,
  SocSliders,
  SocSettings,
} from '@/components/icons';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isAirGapOpen, setIsAirGapOpen] = useState(false);

  const navSections = [
    {
      title: 'Command',
      items: [
        { href: '/', label: 'Command Centre', icon: SocDashboard },
        { href: '/supervision', label: 'Supervisory Ranking', sublabel: 'PS DELIVERABLE', icon: SocSoar },
        { href: '/scenarios', label: 'Simulation Hub', sublabel: 'MĀYĀ', icon: SocSliders, badge: '07' },
      ],
    },
    {
      title: 'Detections',
      items: [
        { href: '/findings', label: 'Findings', sublabel: 'VIVEKA', icon: SocAlert, badge: '07' },
        { href: '/analytics', label: 'Analytics', sublabel: 'MEDHĀ', icon: SocAnalytics },
        { href: '/risk', label: 'Risk Quantification', sublabel: 'MĀN', icon: SocShieldAlert },
        { href: '/threats', label: 'Threat Recurrence', sublabel: 'PUNARĀVṚTTI', icon: SocRefresh },
        { href: '/workload', label: 'Analyst Workload', icon: SocUsers },
      ],
    },
    {
      title: 'Operations',
      items: [
        { href: '/alerts', label: 'Alert Streams', icon: SocBell },
        { href: '/incidents', label: 'Incidents', icon: SocIncident },
        { href: '/investigations', label: 'Investigations', icon: SocInvestigation },
        { href: '/cases', label: 'Supervisory Cases', icon: SocCase },
        { href: '/evidence', label: 'Evidence Vault', sublabel: 'PRATYAYA', icon: SocSearch },
      ],
    },
    {
      title: 'Trust & System',
      items: [
        { href: '/audit', label: 'SAKṢĪ Hash Ledger', sublabel: 'SAKṢĪ', icon: SocFile },
        { href: '/login-sessions', label: 'Session Enclave', sublabel: 'KAVACA', icon: SocLock },
        { href: '/reports', label: 'Reports', icon: SocReport },
        { href: '/icons', label: 'SOC Icon Pack', sublabel: '90 GLYPHS', icon: SocShieldCheck },
        { href: '/admin', label: 'Enclave Settings', icon: SocSettings },
      ],
    },
  ];

  return (
    <aside className="w-60 flex-shrink-0 h-full border-r border-soc-border bg-soc-panel flex flex-col select-none z-30 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-soc-border bg-soc-bg/30">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-soc-accent text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <SocShieldCheck size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-xs font-bold text-soc-text tracking-wider uppercase leading-none">
                ANVĪKṢA
              </div>
              <div className="text-3xs text-soc-textMuted tracking-tight mt-0.5 font-mono">
                Supervisory SOC Intel
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2.5 pb-1 text-3xs font-mono font-semibold uppercase tracking-wider text-soc-textDim">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded transition-colors ${
                      isActive
                        ? 'bg-soc-accent/10 text-soc-accent font-medium'
                        : 'text-soc-textSecondary hover:text-soc-text hover:bg-soc-raised/60'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                          isActive ? 'text-soc-accent' : 'text-soc-textMuted group-hover:text-soc-textSecondary'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.sublabel && !isActive && (
                      <span className="text-3xs font-mono text-soc-textDim">
                        {item.sublabel}
                      </span>
                    )}
                    {item.badge && (
                      <span className="soc-badge badge-critical">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Status */}
        <div className="p-2.5 border-t border-soc-border bg-soc-bg/30">
          <button
            onClick={() => setIsAirGapOpen(true)}
            className="w-full rounded border border-soc-border bg-soc-raised/50 hover:bg-soc-raised hover:border-soc-ok/40 px-2.5 py-1.5 flex items-center justify-between text-3xs font-mono transition-all group"
            title="Click to view Sovereign Air-Gap Verification"
          >
            <span className="flex items-center gap-1.5 text-soc-ok font-medium group-hover:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-soc-ok animate-pulse" />
              Air-Gapped Enclave
            </span>
            <span className="text-soc-textMuted group-hover:text-cyan-300 text-[10px]">0 B/s egress ↗</span>
          </button>
        </div>
      </div>

      <AirGapModal isOpen={isAirGapOpen} onClose={() => setIsAirGapOpen(false)} />
    </aside>
  );
};
