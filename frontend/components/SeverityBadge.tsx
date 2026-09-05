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
        <span className="soc-badge badge-critical">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-crit" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="soc-badge badge-high">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-high" />
          HIGH
        </span>
      );
    case 'MEDIUM':
    case 'WARNING':
      return (
        <span className="soc-badge badge-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-med" />
          MEDIUM
        </span>
      );
    case 'LOW':
    case 'INFO':
      return (
        <span className="soc-badge badge-low">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-low" />
          LOW
        </span>
      );
    case 'VERIFIED':
    case 'OK':
    case 'TRUSTED':
      return (
        <span className="soc-badge badge-ok">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" />
          {norm}
        </span>
      );
    default:
      return (
        <span className="soc-badge badge-neutral">
          {norm}
        </span>
      );
  }
};
