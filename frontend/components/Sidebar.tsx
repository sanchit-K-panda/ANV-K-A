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
    <aside className="w-60 flex-shrink-0 h-full border-r border-soc-border bg-soc-panel flex flex-col select-none z-30 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-soc-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-soc-accent text-white flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">
              A
            </div>
            <div className="min-w-0">
              <div className="font-mono text-xs font-bold text-soc-text tracking-wider uppercase leading-none">
                ANVĪKṢA
              </div>
              <div className="text-[10px] text-soc-textMuted tracking-tight mt-1 font-mono uppercase">
                SUPERVISORY SOC INTEL
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-soc-textDim">
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
                        ? 'bg-soc-raised text-soc-text font-semibold border-l-2 border-soc-accent'
                        : 'text-soc-textSecondary hover:text-soc-text hover:bg-soc-raised/60'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-soc-accent' : 'text-soc-textMuted group-hover:text-soc-textSecondary'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.sublabel && !isActive && (
                      <span className="hidden 2xl:inline text-[10px] font-mono text-soc-textDim">
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

        {/* Footer Diagnostics */}
        <div className="p-2 border-t border-soc-border">
          <div className="rounded border border-soc-border bg-soc-raised/50 px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono font-semibold text-soc-textSecondary uppercase">Air-Gap Active</span>
              </span>
              <span className="text-[10px] font-mono text-soc-textMuted">0 B/s</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-soc-textDim">
              <span>LOCAL ENCLAVE</span>
              <span>v0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
