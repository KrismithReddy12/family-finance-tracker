import { percentChange, type CategoryBreakdownRow } from "@/lib/charts/aggregations";
import type { Insight } from "@/lib/insights/types";
import { formatCurrency } from "@/lib/format";

export type MomChange = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  current: number;
  previous: number;
  change: number | null;
};

/** Per-category current-vs-previous-period totals and percent change (null when there's no baseline). */
export function categoryMomChanges(
  currentBreakdown: CategoryBreakdownRow[],
  previousBreakdown: CategoryBreakdownRow[]
): MomChange[] {
  const currentByCategory = new Map(currentBreakdown.map((row) => [row.categoryId, row]));
  const previousByCategory = new Map(previousBreakdown.map((row) => [row.categoryId, row]));
  const categoryIds = new Set([...currentByCategory.keys(), ...previousByCategory.keys()]);

  return [...categoryIds].flatMap((categoryId) => {
    const currentRow = currentByCategory.get(categoryId);
    const previousRow = previousByCategory.get(categoryId);
    const row = currentRow ?? previousRow;
    if (!row) return [];
    const current = currentRow?.total ?? 0;
    const previous = previousRow?.total ?? 0;
    return [
      {
        categoryId,
        name: row.name,
        icon: row.icon,
        color: row.color,
        current,
        previous,
        change: percentChange(current, previous),
      },
    ];
  });
}

const MOM_THRESHOLD = 20;

/** Flags category moves of more than 20% either direction - up gets a warning framing, down a positive one. */
export function momTrendInsights(changes: MomChange[]): Insight[] {
  return changes
    .filter((change) => change.change !== null && Math.abs(change.change) > MOM_THRESHOLD)
    .sort((a, b) => Math.abs(b.change as number) - Math.abs(a.change as number))
    .map((change) => {
      const pct = change.change as number;
      const up = pct > 0;
      return {
        id: `mom-${change.categoryId}`,
        severity: up ? "warning" : "positive",
        icon: change.icon,
        title: `${change.name} is ${up ? "up" : "down"} ${Math.abs(Math.round(pct))}% from last period`,
        detail: `${change.name} went from ${formatCurrency(change.previous)} to ${formatCurrency(change.current)}.`,
        categoryId: change.categoryId,
      } satisfies Insight;
    });
}
