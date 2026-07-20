"use client";

import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { MonthlyTrendPoint } from "@/lib/charts/aggregations";

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: MonthlyTrendPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border-2 border-hairline-strong bg-surface px-3 py-2 shadow-[3px_3px_0_var(--hairline-strong)]">
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
      <LineChart data={data} margin={{ top: 20, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--hairline)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} />
        <YAxis hide />
        <Tooltip cursor={{ stroke: "var(--hairline-strong)" }} content={<TrendTooltip />} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        >
          <LabelList dataKey="total" content={(props) => <EndPointLabel {...props} lastIndex={lastIndex} />} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}
