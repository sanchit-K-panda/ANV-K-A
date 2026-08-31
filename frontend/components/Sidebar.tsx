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
    <aside className="w-56 bg-[#060709] border-r border-[#1D212B] h-screen flex flex-col justify-between select-none z-30 font-sans p-3">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="px-1.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white text-black flex items-center justify-center font-bold font-mono text-xs border border-white">
              A
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-widest font-mono">
                ANVĪKṢA
              </div>
              <div className="text-[9px] text-[#6B7280] tracking-wider uppercase font-mono">
                Supervisory Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Grouped Navigation List */}
        <nav className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-0.5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2 text-[9px] font-mono font-bold text-[#4B5563] tracking-wider uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2 py-1.5 text-xs transition-colors rounded-sm ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-[#9CA3AF] hover:text-white hover:bg-[#0F1218]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isActive ? 'text-black' : 'text-[#6B7280]'
                        }`}
                      />
                      <div className="truncate">
                        <div className="truncate leading-tight">{item.label}</div>
                        {item.sublabel && !isActive && (
                          <div className="text-[8.5px] font-mono text-[#525B6C] tracking-wide">
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.badge && !isActive && (
                      <span className="text-[9px] font-mono font-bold px-1 py-0.2 bg-[#171A22] text-white border border-[#374151]">
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

      {/* Footer Diagnostics & Simulation Mode Link */}
      <div className="pt-2.5 border-t border-[#1D212B] font-mono text-[9px] space-y-1 text-[#6B7280]">
        <div className="flex justify-between items-center">
          <span>AIR-GAP:</span>
          <span className="text-white font-bold">100% LOCAL</span>
        </div>
        <div className="flex justify-between items-center">
          <span>SIMULATOR:</span>
          <Link href="/scenarios" className="text-white hover:underline">
            7 BENCHMARKS →
          </Link>
        </div>
      </div>
    </aside>
  );
};
