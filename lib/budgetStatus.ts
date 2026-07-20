/** Shared spend-vs-budget severity thresholds, used by the budgets page and the dashboard meter summary. */
export function budgetStatusColor(pct: number): string {
  if (pct >= 100) return "var(--status-critical)";
  if (pct >= 90) return "var(--status-warning)";
  return "var(--status-good)";
}
