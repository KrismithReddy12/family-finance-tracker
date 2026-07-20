import type { BudgetForAgg, BudgetVsActualRow } from "@/lib/charts/aggregations";
import type { Insight } from "@/lib/insights/types";
import { formatCurrency } from "@/lib/format";

const WARNING_THRESHOLD = 90;
const CRITICAL_THRESHOLD = 100;

function overageSeverity(pct: number): "warning" | "critical" | null {
  if (pct >= CRITICAL_THRESHOLD) return "critical";
  if (pct >= WARNING_THRESHOLD) return "warning";
  return null;
}

/** Per-category budget overage: >=90% of budget warns, >=100% alerts. */
export function budgetOverageInsights(rows: BudgetVsActualRow[]): Insight[] {
  return rows.flatMap((row) => {
    if (row.budget <= 0) return [];
    const pct = (row.actual / row.budget) * 100;
    const severity = overageSeverity(pct);
    if (!severity) return [];
    return [
      {
        id: `budget-overage-${row.categoryId}`,
        severity,
        icon: row.icon,
        title: severity === "critical" ? `${row.name} is over budget` : `${row.name} is close to its budget`,
        detail: `${formatCurrency(row.actual)} spent of ${formatCurrency(row.budget)} budgeted (${Math.round(pct)}%).`,
        categoryId: row.categoryId,
      } satisfies Insight,
    ];
  });
}

/** The same overage check, applied to the family's total spend across only its budgeted categories. */
export function familyBudgetOverageInsight(rows: BudgetVsActualRow[], budgets: BudgetForAgg[]): Insight[] {
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  if (totalBudgeted <= 0) return [];

  const totalActual = rows.reduce((sum, row) => sum + row.actual, 0);
  const pct = (totalActual / totalBudgeted) * 100;
  const severity = overageSeverity(pct);
  if (!severity) return [];

  return [
    {
      id: "budget-overage-family",
      severity,
      icon: "🎯",
      title: severity === "critical" ? "Over budget overall" : "Close to your overall budget",
      detail: `${formatCurrency(totalActual)} spent of ${formatCurrency(totalBudgeted)} budgeted across all budgeted categories (${Math.round(pct)}%).`,
    },
  ];
}
