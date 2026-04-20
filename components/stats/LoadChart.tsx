import React, { useMemo } from 'react';
import {
  LoadPoint,
  computeWeeklyLoad,
  computeACWR,
  addDays,
} from '../../utils/load';
import { Term } from '../Term';

interface LoadChartProps {
  daily: LoadPoint[];
  onDate: string; // today
  weeks?: number;
}

// Dep-free SVG chart: weekly sRPE bars + ACWR line with zone bands.
// Sized via viewBox + a wrapper div for responsive width.
export const LoadChart: React.FC<LoadChartProps> = ({
  daily,
  onDate,
  weeks = 8,
}) => {
  const data = useMemo(() => {
    const points: { weekEnd: string; load: number; acwr: number | null }[] = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = addDays(onDate, -7 * i);
      points.push({
        weekEnd,
        load: computeWeeklyLoad(daily, weekEnd),
        acwr: computeACWR(daily, weekEnd),
      });
    }
    return points;
  }, [daily, onDate, weeks]);

  const W = 480;
  const H = 220;
  const padL = 36;
  const padR = 36;
  const padT = 16;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxLoad = Math.max(100, ...data.map((d) => d.load));
  const yLoad = (v: number) => padT + plotH - (v / maxLoad) * plotH;

  const acwrMax = 2.0;
  const yAcwr = (v: number) =>
    padT + plotH - (Math.min(v, acwrMax) / acwrMax) * plotH;

  const band = (lo: number, hi: number, fill: string) => {
    const y = yAcwr(hi);
    const h = yAcwr(lo) - y;
    return <rect x={padL} y={y} width={plotW} height={h} fill={fill} opacity={0.15} />;
  };

  const barW = (plotW / data.length) * 0.6;
  const slot = plotW / data.length;

  const linePts = data
    .map((d, i) => {
      if (d.acwr === null) return null;
      const x = padL + slot * i + slot / 2;
      const y = yAcwr(d.acwr);
      return `${x},${y}`;
    })
    .filter((p): p is string => p !== null)
    .join(' ');

  const hasAnyLoad = data.some((d) => d.load > 0);

  return (
    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
      <h3 className="text-sm font-bold text-stone-400 mb-2 uppercase">Training load</h3>
      {!hasAnyLoad ? (
        <div className="h-40 flex items-center justify-center text-stone-500 text-sm italic">
          Log sessions with RPE to see your load curve.
        </div>
      ) : (
        <>
          <div className="w-full">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
              preserveAspectRatio="none"
              role="img"
              aria-label="Weekly training load and ACWR over the last 8 weeks"
            >
              {/* Zone bands (ACWR scale) */}
              {band(0.8, 1.3, '#22c55e')}
              {band(1.3, 1.5, '#f59e0b')}
              {band(0.5, 0.8, '#f59e0b')}
              {band(1.5, acwrMax, '#ef4444')}
              {band(0, 0.5, '#ef4444')}

              {/* Load bars */}
              {data.map((d, i) => {
                const x = padL + slot * i + (slot - barW) / 2;
                const y = yLoad(d.load);
                const h = padT + plotH - y;
                return (
                  <rect
                    key={d.weekEnd}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill="#fbbf24"
                    opacity={0.85}
                    rx={2}
                  />
                );
              })}

              {/* ACWR line + points */}
              {linePts && (
                <polyline
                  points={linePts}
                  fill="none"
                  stroke="#e7e5e4"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              )}
              {data.map((d, i) => {
                if (d.acwr === null) return null;
                const x = padL + slot * i + slot / 2;
                const y = yAcwr(d.acwr);
                return <circle key={d.weekEnd} cx={x} cy={y} r={3} fill="#e7e5e4" />;
              })}

              {/* Axes */}
              <line
                x1={padL}
                y1={padT + plotH}
                x2={padL + plotW}
                y2={padT + plotH}
                stroke="#57534e"
              />
              {/* Left axis: load */}
              <text x={4} y={padT + 8} fontSize={10} fill="#a8a29e">
                {Math.round(maxLoad)}
              </text>
              <text x={4} y={padT + plotH} fontSize={10} fill="#a8a29e">
                0
              </text>
              {/* Right axis: ACWR */}
              <text x={W - padR + 4} y={padT + 8} fontSize={10} fill="#a8a29e">
                {acwrMax.toFixed(1)}
              </text>
              <text x={W - padR + 4} y={padT + plotH} fontSize={10} fill="#a8a29e">
                0
              </text>

              {/* X labels (weeks) */}
              {data.map((d, i) => {
                const label = d.weekEnd.slice(5); // MM-DD
                const x = padL + slot * i + slot / 2;
                return (
                  <text
                    key={d.weekEnd}
                    x={x}
                    y={H - 12}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#a8a29e"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400 mt-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-400 rounded-sm" />
              Weekly <Term id="srpe">sRPE</Term>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-stone-200" />
              <Term id="acwr">ACWR</Term>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-500/30" />
              Sweet spot
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-500/30" />
              Caution
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-500/30" />
              Danger
            </span>
          </div>
          <p className="text-[11px] text-stone-500 italic mt-2">
            <Term id="acwr">ACWR</Term> is guidance, not diagnosis (Impellizzeri 2020).
          </p>
        </>
      )}
    </div>
  );
};
