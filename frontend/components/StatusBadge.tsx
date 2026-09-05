'use client';

import React from 'react';
import { FindingStatus } from '@/types';

interface StatusBadgeProps {
  status: FindingStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = String(status).toUpperCase();
  switch (norm) {
    case 'OPEN':
      return (
        <span className="soc-badge badge-critical">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-crit" />
          OPEN
        </span>
      );
    case 'REVIEW':
      return (
        <span className="soc-badge badge-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-med" />
          REVIEW
        </span>
      );
    case 'INVESTIGATING':
      return (
        <span className="soc-badge badge-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-accent" />
          INVESTIGATING
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="soc-badge badge-neutral !text-soc-text !border-soc-borderStrong">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-textSecondary" />
          CONFIRMED
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="soc-badge badge-ok">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-ok" />
          RESOLVED
        </span>
      );
    default:
      return (
        <span className="soc-badge badge-neutral">{norm}</span>
      );
  }
};
