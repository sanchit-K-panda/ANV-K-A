'use client';

import React from 'react';
import Link from 'next/link';
import {
  SocShield,
  SocLock,
  SocKey,
  SocDatabase,
  SocSliders,
  SocUsers,
  SocShieldCheck,
} from '@/components/icons';

export default function AdminPage() {
  const sections = [
    { title: 'Users & RBAC Roles', desc: 'Manage supervisor and analyst clearance permissions', icon: SocUsers },
    { title: 'Device & TPM Binding (BANDHA)', desc: 'Configure hardware-bound public key enclaves', icon: SocShield },
    { title: 'Biometric Security (DARŚANA)', desc: 'Tune facial liveness confidence thresholds', icon: SocLock },
    { title: 'KṢAṆA Ephemeral Token Policy', desc: 'Set credential rotation dwell periods (current: 900s)', icon: SocKey },
    { title: 'SOC Ingestion Connectors (SAṄGRAHA)', desc: 'Local air-gapped syslog, JSON, and PCAP parsers', icon: SocDatabase },
    { title: 'Supervisory Detection Rules (PARĪKṢA)', desc: 'Configure statistical baseline standard deviations', icon: SocSliders },
    {
      title: 'ANVĪKṢA SOC Icon Family (90 Glyphs)',
      desc: 'Browse, inspect, and export the official 2.2px sovereign vector icon library and feature mapping',
      icon: SocShieldCheck,
      href: '/icons',
      badge: '90 GLYPHS',
    },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Page header */}
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-2xs font-mono text-soc-textMuted mb-1.5">
            <span>ANVĪKṢA</span>
            <span className="text-soc-textDim">/</span>
            <span>ADMINISTRATION</span>
            <span className="text-soc-textDim">/</span>
            <span className="text-soc-accent">SOC-04</span>
          </div>
          <h1 className="font-display text-[22px] font-bold tracking-tight text-soc-text">Administration &amp; Enclave Policy</h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Local security policies, biometric hardware thresholds, and offline ingestion configurations.
          </p>
        </div>
        <span className="font-mono text-2xs text-soc-textMuted tabular-nums">
          {sections.length} policy domains
        </span>
      </div>

      {/* Policy domain cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {sections.map((sec) => {
          const Icon = sec.icon;
          const CardContent = (
            <div
              className={`soc-panel card-hover p-4 cursor-pointer space-y-3 relative ${
                sec.href ? 'border-soc-accent/40 hover:border-soc-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-soc-accentDim flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-soc-accent" />
                </span>
                {sec.badge && (
                  <span className="text-3xs font-mono font-semibold px-2 py-0.5 rounded-full bg-soc-accent text-white">
                    {sec.badge}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xs font-medium text-soc-text flex items-center gap-1.5">
                  <span>{sec.title}</span>
                  {sec.href && <span className="text-3xs text-soc-accent">↗</span>}
                </h2>
                <p className="text-xs text-soc-textMuted mt-1 leading-relaxed">{sec.desc}</p>
              </div>
            </div>
          );

          return sec.href ? (
            <Link key={sec.title} href={sec.href} className="block">
              {CardContent}
            </Link>
          ) : (
            <div key={sec.title}>{CardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
