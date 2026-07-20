"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { CategoryBreakdownRow } from "@/lib/charts/aggregations";

function BreakdownTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryBreakdownRow }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border-2 border-hairline-strong bg-surface px-3 py-2 shadow-[3px_3px_0_var(--shadow-ink)]">
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
        <span className="text-ink-secondary">{row.name}</span>
        <span className="ml-3 font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(row.total)}
        </span>
      </div>
    </div>
  );
}

export function CategoryBreakdownChart({ data }: { data: CategoryBreakdownRow[] }) {
  const height = Math.max(data.length * 36 + 16, 80);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 4 }} barCategoryGap={6}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--ink-secondary)", fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: "var(--surface-page)" }} content={<BreakdownTooltip />} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
          {data.map((row) => (
            <Cell key={row.categoryId} fill={row.color} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value) => formatCurrency(Number(value))}
            style={{ fill: "var(--ink)", fontSize: 12, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
