import React from 'react';
import Link from 'next/link';
import { Finding } from '@/types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { RiskScore } from './RiskScore';
import { ChevronRight, ShieldAlert, Cpu } from 'lucide-react';

interface FindingRowProps {
  finding: Finding;
}

export const FindingRow: React.FC<FindingRowProps> = ({ finding }) => {
  return (
    <tr className="border-b border-soc-border/60 hover:bg-soc-raised/60 transition-colors group cursor-pointer">
      {/* Severity & ID */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <SeverityBadge severity={finding.severity} size="sm" />
          <span className="font-mono text-xs font-bold text-soc-textPrimary">
            {finding.id}
          </span>
        </div>
      </td>

      {/* Type */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <span className="text-[11px] font-mono uppercase bg-soc-base px-2 py-0.5 rounded border border-soc-border text-soc-textSecondary">
          {finding.type.replace('_', ' ')}
        </span>
      </td>

      {/* Title & Forensic Scope */}
      <td className="py-3.5 px-3 max-w-md">
        <Link href={`/findings/${finding.id}`} className="block">
          <div className="text-xs font-semibold text-soc-textPrimary group-hover:text-soc-accent transition-colors line-clamp-1">
            {finding.title}
          </div>
          <div className="text-[11px] text-soc-textMuted font-mono truncate mt-0.5">
            {finding.where_scope}
          </div>
        </Link>
      </td>

      {/* Risk Score */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <RiskScore score={finding.risk_score} factorsCount={finding.risk_factors?.length} size="sm" />
      </td>

      {/* Confidence */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <ConfidenceIndicator confidence={finding.confidence} />
      </td>

      {/* Status */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <StatusBadge status={finding.status} />
      </td>

      {/* Timestamp & Action */}
      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-xs">
        <Link
          href={`/findings/${finding.id}`}
          className="inline-flex items-center gap-1 text-xs text-soc-textSecondary group-hover:text-soc-accent transition-colors font-mono"
        >
          <span>Examine</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </td>
    </tr>
  );
};
