'use client';

import React from 'react';
import { FindingSeverity } from '@/types';

interface SeverityBadgeProps {
  severity: FindingSeverity;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 bg-rose-50 text-rose-700 font-bold font-mono text-[10px] tracking-wider border border-rose-200 rounded-full">
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 bg-amber-50 text-amber-700 font-semibold font-mono text-[10px] tracking-wider border border-amber-200 rounded-full">
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 bg-yellow-50 text-yellow-800 font-mono text-[10px] tracking-wider border border-yellow-200 rounded-full">
          MEDIUM
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] tracking-wider border border-slate-200 rounded-full">
          LOW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] tracking-wider border border-emerald-200 rounded-full">
          VERIFIED
        </span>
      );
  }
};
