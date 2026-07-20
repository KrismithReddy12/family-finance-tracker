import type { CategoryBreakdownRow } from "@/lib/charts/aggregations";
import type { MomChange } from "@/lib/insights/momTrend";
import type { Insight } from "@/lib/insights/types";
import { formatCurrency } from "@/lib/format";

const TOP_N = 3;
const TREND_THRESHOLD = 20;

/** Composes top-spend categories with their month-over-month trend: a top-3 category trending up >20% gets a concrete suggestion. */
export function savingsSuggestions(breakdown: CategoryBreakdownRow[], changes: MomChange[]): Insight[] {
  const changeByCategory = new Map(changes.map((change) => [change.categoryId, change]));

  return breakdown.slice(0, TOP_N).flatMap((row) => {
    const change = changeByCategory.get(row.categoryId);
    if (!change || change.change === null || change.change <= TREND_THRESHOLD) return [];
    return [
      {
        id: `suggestion-${row.categoryId}`,
        severity: "warning",
        icon: row.icon,
        title: `Consider reviewing ${row.name}`,
        detail: `${row.name} is one of your top spending categories and is up ${Math.round(change.change)}% from last period (${formatCurrency(change.previous)} to ${formatCurrency(change.current)}). Setting a budget or reviewing recent purchases could help rein it in.`,
        categoryId: row.categoryId,
      } satisfies Insight,
    ];
  });
}
