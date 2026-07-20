import type { BudgetVsActualRow } from "@/lib/charts/aggregations";
import type { Insight } from "@/lib/insights/types";
import { formatCurrency } from "@/lib/format";

/** A category has a budget this period but zero logged expenses - possibly a missed entry. */
export function staleCategoryInsights(rows: BudgetVsActualRow[]): Insight[] {
  return rows
    .filter((row) => row.budget > 0 && row.actual === 0)
    .map(
      (row) =>
        ({
          id: `stale-${row.categoryId}`,
          severity: "info",
          icon: row.icon,
          title: `No ${row.name} expenses logged yet`,
          detail: `You budgeted ${formatCurrency(row.budget)} for ${row.name} this period but haven't logged anything yet - worth checking nothing was missed.`,
          categoryId: row.categoryId,
        }) satisfies Insight
    );
}
