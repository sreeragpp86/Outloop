"use client";

import React, { useState } from "react";

interface MonthlyDataPoint {
  month: string;
  invoiced: number;
  collected: number;
  mrr: number;
}

const DEFAULT_TREND_DATA: MonthlyDataPoint[] = [
  { month: "May 2026", invoiced: 1820, collected: 1650, mrr: 1250 },
  { month: "Jun 2026", invoiced: 2150, collected: 2150, mrr: 1420 },
  { month: "Jul 2026", invoiced: 2480, collected: 2300, mrr: 1680 },
  { month: "Aug 2026", invoiced: 3100, collected: 2950, mrr: 1890 },
  { month: "Sep 2026", invoiced: 3650, collected: 3420, mrr: 2100 },
  { month: "Oct 2026", invoiced: 4425, collected: 3950, mrr: 2485 },
];

export function RevenueTrendChart({ data = DEFAULT_TREND_DATA }: { data?: MonthlyDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => Math.max(d.invoiced, d.collected))) * 1.15;
  const chartHeight = 180;
  const chartWidth = 540;
  const paddingX = 40;
  const paddingBottom = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingBottom;

  const barGroupWidth = usableWidth / data.length;
  const singleBarWidth = Math.max(14, barGroupWidth * 0.28);

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Revenue & Invoicing Velocity
          </h3>
          <p className="text-[11px] text-zinc-400">
            6-Month Trajectory: Invoiced vs. Collected Settlements
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-zinc-700 dark:text-zinc-300">Collected Cash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-zinc-500 dark:text-zinc-400">Invoiced Receivables</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = usableHeight * (1 - pct) + 5;
            const val = Math.round(maxValue * pct);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - 10}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="2 3"
                  className="text-zinc-100 dark:text-zinc-800"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-zinc-400 font-mono text-[9px]"
                >
                  ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Bars and Month Labels */}
          {data.map((d, idx) => {
            const groupCenterX = paddingX + idx * barGroupWidth + barGroupWidth / 2;
            const invoicedBarHeight = (d.invoiced / maxValue) * usableHeight;
            const collectedBarHeight = (d.collected / maxValue) * usableHeight;

            const invoicedY = usableHeight - invoicedBarHeight + 5;
            const collectedY = usableHeight - collectedBarHeight + 5;

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Background hover column */}
                <rect
                  x={paddingX + idx * barGroupWidth}
                  y={5}
                  width={barGroupWidth}
                  height={usableHeight}
                  fill={isHovered ? "currentColor" : "transparent"}
                  className="text-zinc-500/5 dark:text-zinc-100/5 transition-colors"
                />

                {/* Invoiced Bar (Grey) */}
                <rect
                  x={groupCenterX - singleBarWidth - 2}
                  y={invoicedY}
                  width={singleBarWidth}
                  height={invoicedBarHeight}
                  rx={2}
                  className={`transition-all ${
                    isHovered
                      ? "fill-zinc-400 dark:fill-zinc-600"
                      : "fill-zinc-300 dark:fill-zinc-700"
                  }`}
                />

                {/* Collected Bar (Dark Zinc / White) */}
                <rect
                  x={groupCenterX + 2}
                  y={collectedY}
                  width={singleBarWidth}
                  height={collectedBarHeight}
                  rx={2}
                  className={`transition-all ${
                    isHovered
                      ? "fill-zinc-950 dark:fill-white"
                      : "fill-zinc-900 dark:fill-zinc-100"
                  }`}
                />

                {/* Month label on X Axis */}
                <text
                  x={groupCenterX}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered
                      ? "fill-zinc-900 dark:fill-zinc-100 font-semibold"
                      : "fill-zinc-500 dark:fill-zinc-400"
                  }`}
                >
                  {d.month.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tactile Tooltip */}
        {hoveredData && (
          <div className="absolute top-2 right-4 rounded-md border border-zinc-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-950/95 pointer-events-none transition-all text-xs">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              {hoveredData.month}
            </div>
            <div className="mt-1 space-y-0.5 text-[11px] font-mono">
              <div className="flex items-center justify-between gap-4 text-zinc-900 dark:text-zinc-100">
                <span className="flex items-center gap-1.5 font-sans text-zinc-500">
                  <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  Collected:
                </span>
                <span className="font-medium">${hoveredData.collected.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 font-sans text-zinc-500">
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  Invoiced:
                </span>
                <span>${hoveredData.invoiced.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-1 text-emerald-600 dark:text-emerald-400">
                <span className="font-sans text-[10px] text-zinc-500">MRR Benchmark:</span>
                <span>${hoveredData.mrr.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
