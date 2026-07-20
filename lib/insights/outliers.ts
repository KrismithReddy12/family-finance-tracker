import { toNumber, type CategoryForAgg, type MoneyLike } from "@/lib/charts/aggregations";
import type { Insight } from "@/lib/insights/types";
import { formatCurrency, formatDate } from "@/lib/format";

export type ExpenseForOutlierCheck = {
  id: string;
  categoryId: string;
  amount: MoneyLike;
  date: Date;
  description?: string | null;
};

const MIN_SAMPLE_SIZE = 3;
const MULTIPLIER = 2;
const MAX_OUTLIERS = 3;

/**
 * Flags individual expenses more than 2x a category's trailing average -
 * catches both real overspends and data-entry typos. Requires at least
 * `MIN_SAMPLE_SIZE` historical expenses in the category so a single prior
 * data point can't set an unreliable baseline.
 */
export function outlierInsights(
  currentExpenses: ExpenseForOutlierCheck[],
  historicalExpenses: { categoryId: string; amount: MoneyLike }[],
  categories: CategoryForAgg[]
): Insight[] {
  const historicalByCategory = new Map<string, number[]>();
  for (const expense of historicalExpenses) {
    const amounts = historicalByCategory.get(expense.categoryId) ?? [];
    amounts.push(toNumber(expense.amount));
    historicalByCategory.set(expense.categoryId, amounts);
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const candidates = currentExpenses.flatMap((expense) => {
    const history = historicalByCategory.get(expense.categoryId);
    if (!history || history.length < MIN_SAMPLE_SIZE) return [];
    const average = history.reduce((sum, v) => sum + v, 0) / history.length;
    if (average <= 0) return [];
    const amount = toNumber(expense.amount);
    if (amount <= average * MULTIPLIER) return [];
    const category = categoryById.get(expense.categoryId);
    if (!category) return [];
    return [{ expense, category, amount, average }];
  });

  return candidates
    .sort((a, b) => b.amount / b.average - a.amount / a.average)
    .slice(0, MAX_OUTLIERS)
    .map(
      ({ expense, category, amount, average }) =>
        ({
          id: `outlier-${expense.id}`,
          severity: "warning",
          icon: category.icon,
          title: `Unusually large ${category.name} expense`,
          detail: `${formatCurrency(amount)} on ${formatDate(expense.date)}${
            expense.description ? ` (${expense.description})` : ""
          } is more than ${MULTIPLIER}x your typical ${category.name} expense (~${formatCurrency(average)}). Worth double-checking it was entered correctly.`,
          categoryId: category.id,
        }) satisfies Insight
    );
}
