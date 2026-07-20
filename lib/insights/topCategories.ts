import type { CategoryBreakdownRow } from "@/lib/charts/aggregations";
import type { Insight } from "@/lib/insights/types";
import { formatCurrency } from "@/lib/format";

/** Summarizes the single highest-spend category for the period, with runner-ups for context. */
export function topCategoriesInsight(breakdown: CategoryBreakdownRow[], totalSpend: number): Insight[] {
  if (breakdown.length === 0 || totalSpend <= 0) return [];

  const [first, second, third] = breakdown;
  const share = Math.round((first.total / totalSpend) * 100);

  const runnerUps = [second, third].filter((row): row is CategoryBreakdownRow => Boolean(row));
  const runnerUpText =
    runnerUps.length > 0
      ? ` Next highest: ${runnerUps.map((row) => `${row.name} (${formatCurrency(row.total)})`).join(", ")}.`
      : "";

  return [
    {
      id: `top-category-${first.categoryId}`,
      severity: "info",
      icon: first.icon,
      title: `${first.name} is your top category`,
      detail: `${formatCurrency(first.total)} spent on ${first.name} - ${share}% of total spend this period.${runnerUpText}`,
      categoryId: first.categoryId,
    },
  ];
}
