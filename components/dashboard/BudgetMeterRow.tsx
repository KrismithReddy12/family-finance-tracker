import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatCurrency } from "@/lib/format";
import { budgetStatusColor } from "@/lib/budgetStatus";
import type { BudgetVsActualRow } from "@/lib/charts/aggregations";

export function BudgetMeterRow({ row }: { row: BudgetVsActualRow }) {
  const pct = row.budget > 0 ? (row.actual / row.budget) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <CategoryIcon icon={row.icon} color={row.color} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-ink">{row.name}</p>
          <p className="shrink-0 text-xs text-ink-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(row.actual)} / {formatCurrency(row.budget)}
          </p>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-page">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: budgetStatusColor(pct) }}
          />
        </div>
      </div>
    </div>
  );
}
