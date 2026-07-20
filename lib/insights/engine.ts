import { budgetVsActual, categoryBreakdown, type BudgetForAgg, type CategoryForAgg, type ExpenseForAgg } from "@/lib/charts/aggregations";
import { topCategoriesInsight } from "@/lib/insights/topCategories";
import { categoryMomChanges, momTrendInsights } from "@/lib/insights/momTrend";
import { budgetOverageInsights, familyBudgetOverageInsight } from "@/lib/insights/budgetOverage";
import { savingsSuggestions } from "@/lib/insights/suggestions";
import { outlierInsights, type ExpenseForOutlierCheck } from "@/lib/insights/outliers";
import { staleCategoryInsights } from "@/lib/insights/staleCategories";
import type { Insight } from "@/lib/insights/types";

export type { Insight, InsightSeverity } from "@/lib/insights/types";

export type InsightsInput = {
  categories: CategoryForAgg[];
  /** Expenses for the period being reviewed. */
  currentExpenses: ExpenseForOutlierCheck[];
  /** Expenses for the immediately preceding period, for month-over-month comparison. */
  previousExpenses: ExpenseForAgg[];
  /** Expenses from before `previousExpenses`' start, used only to build each category's trailing average for outlier detection. */
  historicalExpenses: ExpenseForAgg[];
  /** Budgets for the period being reviewed. */
  budgets: BudgetForAgg[];
};

const SEVERITY_ORDER: Record<Insight["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
  positive: 3,
};

/** Runs every heuristic against caller-scoped data and returns insight cards, most urgent first. No DB access, no LLM calls - every insight is arithmetic traceable back to the inputs. */
export function buildInsights(input: InsightsInput): Insight[] {
  const currentBreakdown = categoryBreakdown(input.currentExpenses, input.categories);
  const previousBreakdown = categoryBreakdown(input.previousExpenses, input.categories);
  const totalSpend = currentBreakdown.reduce((sum, row) => sum + row.total, 0);
  const momChanges = categoryMomChanges(currentBreakdown, previousBreakdown);
  const budgetRows = budgetVsActual(input.categories, input.budgets, input.currentExpenses);

  const insights: Insight[] = [
    ...budgetOverageInsights(budgetRows),
    ...familyBudgetOverageInsight(budgetRows, input.budgets),
    ...momTrendInsights(momChanges),
    ...savingsSuggestions(currentBreakdown, momChanges),
    ...outlierInsights(input.currentExpenses, input.historicalExpenses, input.categories),
    ...topCategoriesInsight(currentBreakdown, totalSpend),
    ...staleCategoryInsights(budgetRows),
  ];

  return insights.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
