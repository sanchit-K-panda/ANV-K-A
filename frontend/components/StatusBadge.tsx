'use client';

import React from 'react';
import { FindingStatus } from '@/types';

interface StatusBadgeProps {
  status: FindingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          OPEN
        </span>
      );
    case 'REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 font-mono text-[10px] font-semibold border border-amber-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          REVIEW
        </span>
      );
    case 'INVESTIGATING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          INVESTIGATING
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded-full">
          CONFIRMED
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          RESOLVED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200 rounded-full">
          {status}
        </span>
      );
  }
};
