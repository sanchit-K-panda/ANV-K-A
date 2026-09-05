import React from 'react';
import Link from 'next/link';
import { Finding } from '@/types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { RiskScore } from './RiskScore';
import { ChevronRight } from 'lucide-react';

interface FindingRowProps {
  finding: Finding;
}

export const FindingRow: React.FC<FindingRowProps> = ({ finding }) => {
  return (
    <tr className="group cursor-pointer">
      {/* Severity & ID */}
      <td className="whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <SeverityBadge severity={finding.severity} size="sm" />
          <span className="col-mono text-soc-text">
            {finding.id}
          </span>
        </div>
      </td>

      {/* Engine / Type */}
      <td className="whitespace-nowrap">
        <span className="soc-badge badge-neutral">
          {finding.type.replace(/_/g, ' ')}
        </span>
      </td>

      {/* Title & Forensic Scope */}
      <td className="max-w-md">
        <Link href={`/findings/${finding.id}`} className="block">
          <div className="text-xs font-medium text-soc-text group-hover:text-soc-accent transition-colors line-clamp-1">
            {finding.title}
          </div>
          <div className="col-mono truncate mt-0.5">
            {finding.where_scope}
          </div>
        </Link>
      </td>

      {/* Risk Score */}
      <td className="whitespace-nowrap">
        <RiskScore score={finding.risk_score} factorsCount={finding.risk_factors?.length} size="sm" />
      </td>

      {/* Confidence */}
      <td className="whitespace-nowrap">
        <ConfidenceIndicator confidence={finding.confidence} />
      </td>

      {/* Status */}
      <td className="whitespace-nowrap">
        <StatusBadge status={finding.status} />
      </td>

      {/* Action */}
      <td className="whitespace-nowrap text-right">
        <Link
          href={`/findings/${finding.id}`}
          className="inline-flex items-center gap-1 text-xs text-soc-textMuted group-hover:text-soc-accent transition-colors font-mono"
          aria-label={`Examine finding ${finding.id}`}
        >
          <span>EXAMINE</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </td>
    </tr>
  );
};
