'use client';

import React from 'react';
import { FindingSeverity } from '@/types';

interface SeverityBadgeProps {
  severity: FindingSeverity | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const norm = String(severity).toUpperCase();
  switch (norm) {
    case 'CRITICAL':
      return (
        <span className="badge-critical">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="badge-high">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          HIGH
        </span>
      );
    case 'MEDIUM':
    case 'WARNING':
      return (
        <span className="badge-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
          MEDIUM
        </span>
      );
    case 'LOW':
    case 'INFO':
      return (
        <span className="badge-low">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          LOW
        </span>
      );
    default:
      return (
        <span className="badge-verified">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          {norm}
        </span>
      );
  }
};
