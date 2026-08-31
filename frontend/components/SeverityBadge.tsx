'use client';

import React from 'react';
import { FindingSeverity } from '@/types';

interface SeverityBadgeProps {
  severity: FindingSeverity;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-white text-black font-bold font-mono text-[10px] tracking-wider border border-white">
          [CRITICAL]
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#1C2029] text-white font-semibold font-mono text-[10px] tracking-wider border border-[#4A5162]">
          [HIGH]
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#0C0E12] text-[#C0C5D0] font-mono text-[10px] tracking-wider border border-[#282D3A]">
          [MEDIUM]
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-transparent text-[#7A8290] font-mono text-[10px] tracking-wider border border-[#1E222C]">
          [LOW]
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#0C0E12] text-white font-mono text-[10px] tracking-wider border border-[#4A5162]">
          [VERIFIED]
        </span>
      );
  }
};
