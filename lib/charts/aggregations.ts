/**
 * Pure, DB-free data-shaping for dashboard charts. Callers pass in plain
 * objects (already scoped/filtered by the caller) so these stay independently
 * testable and never need to know about Prisma or sessions.
 */

type MoneyLike = string | number | { toString(): string };

function toNumber(value: MoneyLike): number {
  return Number(typeof value === "string" || typeof value === "number" ? value : value.toString());
}

export type ExpenseForAgg = { categoryId: string; amount: MoneyLike; date: Date };
export type CategoryForAgg = { id: string; name: string; icon: string; color: string };
export type BudgetForAgg = { categoryId: string; amount: MoneyLike };

export type CategoryBreakdownRow = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
};

/** Total spend per category for whatever period the caller's `expenses` are already scoped to, sorted highest first. */
export function categoryBreakdown(
  expenses: ExpenseForAgg[],
  categories: CategoryForAgg[]
): CategoryBreakdownRow[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + toNumber(expense.amount));
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return [...totals.entries()]
    .flatMap(([categoryId, total]) => {
      const category = categoryById.get(categoryId);
      if (!category || total <= 0) return [];
      return [{ categoryId, name: category.name, icon: category.icon, color: category.color, total }];
    })
    .sort((a, b) => b.total - a.total);
}

export type MonthlyTrendPoint = { month: string; label: string; total: number };

/** Trailing `monthsBack` months of total spend, ending at (and including) the month containing `referenceDate`. */
export function monthlyTrend(
  expenses: ExpenseForAgg[],
  monthsBack: number,
  referenceDate: Date
): MonthlyTrendPoint[] {
  const months: { key: string; date: Date }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, date });
  }

  const totals = new Map(months.map((m) => [m.key, 0]));
  for (const expense of expenses) {
    const key = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, "0")}`;
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + toNumber(expense.amount));
    }
  }

  return months.map((m) => ({
    month: m.key,
    label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(m.date),
    total: totals.get(m.key) ?? 0,
  }));
}

export type BudgetVsActualRow = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  actual: number;
};

/** Pairs each budget with actual spend in the same (caller-scoped) expenses, sorted by percent-of-budget used, highest first. */
export function budgetVsActual(
  categories: CategoryForAgg[],
  budgets: BudgetForAgg[],
  expenses: ExpenseForAgg[]
): BudgetVsActualRow[] {
  const actualByCategory = new Map<string, number>();
  for (const expense of expenses) {
    actualByCategory.set(expense.categoryId, (actualByCategory.get(expense.categoryId) ?? 0) + toNumber(expense.amount));
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return budgets
    .flatMap((budget) => {
      const category = categoryById.get(budget.categoryId);
      if (!category) return [];
      const budgetAmount = toNumber(budget.amount);
      return [
        {
          categoryId: budget.categoryId,
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: budgetAmount,
          actual: actualByCategory.get(budget.categoryId) ?? 0,
        },
      ];
    })
    .sort((a, b) => b.actual / b.budget - a.actual / a.budget);
}

/** Percent change from `previous` to `current`; null when there's no baseline to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
