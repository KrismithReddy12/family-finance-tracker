export type InsightSeverity = "positive" | "info" | "warning" | "critical";

/**
 * Every field here is meant to be traceable back to a real number the caller
 * computed - no black-box scoring, nothing an insight module invents on its
 * own. `detail` always states the arithmetic behind the claim.
 */
export type Insight = {
  id: string;
  severity: InsightSeverity;
  icon: string;
  title: string;
  detail: string;
  categoryId?: string;
};
