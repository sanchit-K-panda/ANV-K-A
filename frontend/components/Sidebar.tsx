'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Search,
  ShieldAlert,
  FileCheck,
  Layers,
  FileText,
  Briefcase,
  FolderGit2,
  Bell,
  Activity,
  Flame,
  Settings,
  Users,
  Shield,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'Main',
      items: [
        { href: '/', label: 'Command Centre', sublabel: 'NETRA', icon: LayoutDashboard },
        { href: '/findings', label: 'Findings', sublabel: 'VIVEKA + ABHĀVA', icon: AlertTriangle, badge: '07' },
        { href: '/analytics', label: 'Analytics', sublabel: 'MEDHĀ', icon: BarChart3 },
      ],
    },
    {
      title: 'Operations',
      items: [
        { href: '/alerts', label: 'Alerts', sublabel: 'Sensors', icon: Bell },
        { href: '/incidents', label: 'Incidents', sublabel: 'Lifecycle', icon: Flame },
        { href: '/investigations', label: 'Investigations', sublabel: 'Queue Audit', icon: Briefcase },
        { href: '/cases', label: 'Cases', sublabel: 'Management', icon: FolderGit2 },
        { href: '/evidence', label: 'Evidence', sublabel: 'PRATYAYA', icon: Search },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { href: '/risk', label: 'Risk Quantification', sublabel: 'MĀN', icon: ShieldAlert },
        { href: '/threats', label: 'Threat Recurrence', sublabel: 'PUNARĀVṚTTI', icon: Activity },
        { href: '/workload', label: 'Analyst Workload', sublabel: 'Capacity', icon: Users },
      ],
    },
    {
      title: 'System',
      items: [
        { href: '/reports', label: 'Reports', sublabel: 'Assessments', icon: FileText },
        { href: '/audit', label: 'Audit & Trust', sublabel: 'SAKṢĪ + AKṢARA', icon: FileCheck },
        { href: '/admin', label: 'Administration', sublabel: 'Policy', icon: Settings },
        { href: '/scenarios', label: 'Simulation Hub', sublabel: 'MĀYĀ Benchmark', icon: Layers },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 h-screen flex flex-col justify-between select-none z-30 font-sans p-4 shadow-sm">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="px-2 pt-1 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm">
              A
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 tracking-wider font-mono">
                ANVĪKṢA
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Supervisory Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Grouped Navigation List */}
        <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-170px)] pr-1">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 text-xs transition-all rounded-xl ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <div className="truncate">
                        <div className="truncate leading-tight">{item.label}</div>
                        {item.sublabel && !isActive && (
                          <div className="text-[9px] font-mono text-slate-400">
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.badge && !isActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Diagnostics & Air-gap indicator */}
      <div className="pt-3 border-t border-slate-100 font-mono text-[10px] space-y-1.5 text-slate-500">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">AIR-GAP ACTIVE</span>
          </span>
          <span className="text-slate-400 font-mono">100% LOCAL</span>
        </div>
      </div>
    </aside>
  );
};
