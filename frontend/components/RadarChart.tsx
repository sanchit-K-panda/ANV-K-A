'use client';

import React, { useMemo } from 'react';

export interface RadarSeries {
  id: string;
  name: string;
  color: string; // hex or rgb (e.g. '#10b981', '#ef4444')
  data: number[]; // values [0..100] corresponding to axes
}

export interface RadarAxis {
  key: string;
  label: string;
  shortLabel?: string;
  max?: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  series: RadarSeries[];
  size?: number;
  className?: string;
  showLegend?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  axes,
  series,
  size = 360,
  className = '',
  showLegend = true,
}) => {
  const numAxes = axes.length;
  const radius = size * 0.36;
  const center = size / 2;

  // Compute angles for each axis (0 degrees at top)
  const axisAngles = useMemo(() => {
    return axes.map((_, i) => (i * 2 * Math.PI) / numAxes - Math.PI / 2);
  }, [axes, numAxes]);

  // Compute point for a given axis index and normalized value (0..1)
  const getPoint = (axisIdx: number, valueRatio: number) => {
    const angle = axisAngles[axisIdx];
    const r = radius * Math.max(0, Math.min(1, valueRatio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric grid rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background glow circle */}
        <circle cx={center} cy={center} r={radius} fill="rgba(15, 23, 42, 0.4)" />

        {/* Concentric grid webs */}
        {rings.map((ring, rIdx) => {
          const points = axes.map((_, aIdx) => {
            const pt = getPoint(aIdx, ring);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          return (
            <g key={`ring-${rIdx}`}>
              <polygon
                points={points}
                fill="none"
                stroke={rIdx === rings.length - 1 ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.1)'}
                strokeWidth={rIdx === rings.length - 1 ? '1.5' : '1'}
                strokeDasharray={rIdx === rings.length - 1 ? undefined : '3,3'}
              />
              {/* Ring percentage label on the top vertical axis */}
              <text
                x={center + 4}
                y={center - radius * ring + 10}
                fill="rgba(148, 163, 184, 0.45)"
                fontSize="9"
                fontFamily="monospace"
              >
                {Math.round(ring * 100)}%
              </text>
            </g>
          );
        })}

        {/* Axis radial spokes */}
        {axes.map((axis, aIdx) => {
          const endPt = getPoint(aIdx, 1.0);
          const labelPt = getPoint(aIdx, 1.18);
          const isRight = labelPt.x > center + 10;
          const isLeft = labelPt.x < center - 10;
          const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

          return (
            <g key={`axis-${axis.key}`}>
              <line
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="1"
              />
              <text
                x={labelPt.x}
                y={labelPt.y + (labelPt.y < center ? -2 : 4)}
                textAnchor={textAnchor}
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
                className="transition-colors hover:fill-slate-200"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Polygons for each Series */}
        {series.map((s) => {
          const polyPoints = s.data.map((val, aIdx) => {
            const maxVal = axes[aIdx]?.max || 100;
            const ratio = maxVal > 0 ? val / maxVal : 0;
            const pt = getPoint(aIdx, ratio);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          return (
            <g key={`series-${s.id}`}>
              {/* Semi-transparent filled area */}
              <polygon
                points={polyPoints}
                fill={s.color}
                fillOpacity="0.22"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
              {/* Data points */}
              {s.data.map((val, aIdx) => {
                const maxVal = axes[aIdx]?.max || 100;
                const ratio = maxVal > 0 ? val / maxVal : 0;
                const pt = getPoint(aIdx, ratio);
                return (
                  <circle
                    key={`pt-${s.id}-${aIdx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill={s.color}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="transition-all duration-200 hover:r-6"
                  >
                    <title>{`${s.name} · ${axes[aIdx].label}: ${val}%`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && series.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-3 pt-2 border-t border-slate-800/80 w-full">
          {series.map((s) => (
            <div key={`legend-${s.id}`} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block w-3 h-3 rounded-full border border-slate-900"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-300 font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
