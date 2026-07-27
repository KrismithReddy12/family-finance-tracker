"use client";

import { Area, AreaChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { MonthlyTrendPoint } from "@/lib/charts/aggregations";

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: MonthlyTrendPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-ink-secondary">{point.label}</p>
      <p className="font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatCurrency(point.total)}
      </p>
    </div>
  );
}

/**
 * Recharts' LabelList `content` prop type is a large union we don't need to
 * fully reconstruct here - narrow to the handful of fields this render
 * actually reads, with runtime guards instead of fighting the library's types.
 */
function EndPointLabel({ x, y, index, value, lastIndex }: Record<string, unknown> & { lastIndex: number }) {
  if (index !== lastIndex || typeof x !== "number" || typeof y !== "number" || typeof value !== "number") {
    return null;
  }
  return (
    <text x={x} y={y - 12} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ink)">
      {formatCurrency(value)}
    </text>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const lastIndex = data.length - 1;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 20, right: 24, bottom: 4, left: 8 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} />
        <YAxis hide />
        <Tooltip cursor={{ stroke: "var(--hairline)" }} content={<TrendTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--accent)"
          strokeWidth={2.5}
          fill="url(#trendGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
          isAnimationActive={false}
        >
          <LabelList dataKey="total" content={(props) => <EndPointLabel {...props} lastIndex={lastIndex} />} />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}
