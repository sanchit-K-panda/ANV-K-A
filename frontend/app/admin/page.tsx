'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, KeyRound, Database, Sliders, Users, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  const sections = [
    { title: 'Users & RBAC Roles', desc: 'Manage supervisor and analyst clearance permissions', icon: Users },
    { title: 'Device & TPM Binding (BANDHA)', desc: 'Configure hardware-bound public key enclaves', icon: Shield },
    {
      title: 'Biometric Security (DARŚANA)',
      desc: 'Tune facial liveness confidence thresholds & enroll personnel',
      icon: Lock,
      href: '/admin/darsana',
      badge: 'ACTIVE ENGINE',
    },
    { title: 'KṢAṆA Ephemeral Token Policy', desc: 'Set credential rotation dwell periods (current: 900s)', icon: KeyRound },
    { title: 'SOC Ingestion Connectors (SAṄGRAHA)', desc: 'Local air-gapped syslog, JSON, and PCAP parsers', icon: Database },
    { title: 'Supervisory Detection Rules (PARĪKṢA)', desc: 'Configure statistical baseline standard deviations', icon: Sliders },
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
          return (
            <div
              key={sec.title}
              onClick={() => sec.href && router.push(sec.href)}
              className={`soc-panel card-hover p-4 cursor-pointer space-y-3 transition-all ${
                sec.href ? 'hover:border-soc-accent/50 group' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-soc-accentDim flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-soc-accent" />
                </span>
                {sec.badge && (
                  <span className="soc-badge badge-accent text-[10px]">{sec.badge}</span>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-medium text-soc-text group-hover:text-soc-accent transition-colors">
                    {sec.title}
                  </h2>
                  {sec.href && (
                    <ArrowRight className="w-3 h-3 text-soc-textMuted group-hover:text-soc-accent transition-colors" />
                  )}
                </div>
                <p className="text-xs text-soc-textMuted mt-1 leading-relaxed">{sec.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
