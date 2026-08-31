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
        <span className="inline-flex items-center px-1.5 py-0.5 bg-white text-black font-mono text-[10px] font-bold border border-white">
          ● OPEN
        </span>
      );
    case 'REVIEW':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#1C2029] text-white font-mono text-[10px] font-semibold border border-[#4A5162]">
          REVIEW
        </span>
      );
    case 'INVESTIGATING':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#0C0E12] text-[#D0D4DC] font-mono text-[10px] border border-[#3A4050]">
          INVESTIGATING
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#1C2029] text-white font-mono text-[10px] font-bold border border-[#606778]">
          CONFIRMED
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#0C0E12] text-[#848B98] font-mono text-[10px] border border-[#232732]">
          RESOLVED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 bg-transparent text-[#656C7A] font-mono text-[10px] border border-[#1E222C]">
          {status}
        </span>
      );
  }
};
