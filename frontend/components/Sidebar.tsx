'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Bell,
  Flame,
  Briefcase,
  FolderGit2,
  Search,
  ShieldAlert,
  Activity,
  Users,
  FileText,
  FileCheck,
  Settings,
  Layers,
  MonitorDot,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'Command',
      items: [
        { href: '/', label: 'Command Centre', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Detections',
      items: [
        { href: '/findings', label: 'Findings', sublabel: 'VIVEKA', icon: AlertTriangle, badge: '07' },
        { href: '/analytics', label: 'Analytics', sublabel: 'MEDHĀ', icon: BarChart3 },
        { href: '/risk', label: 'Risk Quantification', sublabel: 'MĀN', icon: ShieldAlert },
        { href: '/threats', label: 'Threat Recurrence', sublabel: 'PUNARĀVṚTTI', icon: Activity },
        { href: '/workload', label: 'Analyst Workload', icon: Users },
      ],
    },
    {
      title: 'Operations',
      items: [
        { href: '/alerts', label: 'Alerts', icon: Bell },
        { href: '/incidents', label: 'Incidents', icon: Flame },
        { href: '/investigations', label: 'Investigations', icon: Briefcase },
        { href: '/cases', label: 'Cases', icon: FolderGit2 },
        { href: '/evidence', label: 'Evidence', sublabel: 'PRATYAYA', icon: Search },
      ],
    },
    {
      title: 'Trust & System',
      items: [
        { href: '/audit', label: 'Audit & Integrity', sublabel: 'SAKṢĪ', icon: FileCheck },
        { href: '/login-sessions', label: 'Session Ledger', icon: MonitorDot },
        { href: '/reports', label: 'Reports', icon: FileText },
        { href: '/scenarios', label: 'Simulation Hub', sublabel: 'MĀYĀ', icon: Layers },
        { href: '/admin', label: 'Administration', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-60 flex-shrink-0 h-full rounded-2xl border border-soc-border bg-soc-panel shadow-card flex flex-col select-none z-30 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="px-4 pt-4 pb-3.5 border-b border-soc-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgb(var(--soc-accent)) 0%, rgb(var(--soc-accentBright)) 100%)' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" fill="#fff" />
                <circle cx="12" cy="12" r="7.5" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="2.5 2.2" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-display text-[15px] font-bold text-soc-text tracking-tight leading-none">
                ANVĪKṢA
              </div>
              <div className="text-[10px] text-soc-textMuted mt-1">
                Examine Beyond the Obvious
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-soc-textDim">
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
                    className={`group flex items-center justify-between gap-2 px-2.5 py-2 text-[13px] rounded-xl transition-all ${
                      isActive
                        ? 'bg-soc-accentInk text-soc-accent font-semibold'
                        : 'text-soc-textSecondary hover:text-soc-text hover:bg-soc-raised'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive
                            ? 'bg-soc-accent/15 text-soc-accent'
                            : 'bg-soc-raised text-soc-textMuted group-hover:text-soc-textSecondary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.sublabel && !isActive && (
                      <span className="hidden 2xl:inline text-[9px] font-mono text-soc-textDim tracking-wide">
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

        {/* Footer Diagnostics — air-gap stays persistent and visible */}
        <div className="p-2.5">
          <div className="tex-grid rounded-xl border border-soc-border bg-soc-overlay px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soc-ok opacity-40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-soc-ok" />
                </span>
                <span className="text-[11px] font-semibold text-soc-textSecondary">Air-Gap Active</span>
              </span>
              <span className="text-[9.5px] font-mono text-soc-textMuted">0 B/s</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[9.5px] text-soc-textDim">
              <span className="font-mono">LOCAL ENCLAVE</span>
              <span className="font-mono">v0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
