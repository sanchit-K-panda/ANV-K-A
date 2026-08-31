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
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { href: '/', label: 'Command Centre', icon: LayoutDashboard },
        { href: '/findings', label: 'Findings', sublabel: 'VIVEKA + ABHĀVA', icon: AlertTriangle, badge: '07' },
        { href: '/analytics', label: 'Analytics', sublabel: 'MEDHĀ', icon: BarChart3 },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { href: '/alerts', label: 'Alerts', icon: Bell },
        { href: '/incidents', label: 'Incidents', icon: Flame },
        { href: '/investigations', label: 'Investigations', icon: Briefcase },
        { href: '/cases', label: 'Cases', icon: FolderGit2 },
        { href: '/evidence', label: 'Evidence', sublabel: 'PRATYAYA', icon: Search },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { href: '/risk', label: 'Risk Quantification', sublabel: 'MĀN', icon: ShieldAlert },
        { href: '/threats', label: 'Threat Recurrence', sublabel: 'PUNARĀVṚTTI', icon: Activity },
        { href: '/workload', label: 'Analyst Workload', icon: Users },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { href: '/reports', label: 'Reports', icon: FileText },
        { href: '/audit', label: 'Audit & Trust', sublabel: 'SAKṢĪ', icon: FileCheck },
        { href: '/admin', label: 'Administration', icon: Settings },
        { href: '/scenarios', label: 'Simulation Hub', sublabel: 'MĀYĀ Benchmark', icon: Layers },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 h-screen flex flex-col justify-between select-none z-30 font-sans flex-shrink-0">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-xs shadow-xs flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 tracking-wider font-mono truncate">
                ANVĪKṢA
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Supervisory Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors rounded-md ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <div className="truncate">
                        <span className="truncate">{item.label}</span>
                        {item.sublabel && !isActive && (
                          <span className="ml-1.5 text-[9.5px] font-mono text-slate-400">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.badge && !isActive && (
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Subtle Footer Diagnostics */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 font-mono text-[10.5px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">AIR-GAP ACTIVE</span>
            </span>
            <span className="text-[10px] text-slate-400">LOCAL ENCLAVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
