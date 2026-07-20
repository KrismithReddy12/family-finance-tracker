import { describe, expect, it } from "vitest";
import { categoryBreakdown } from "@/lib/charts/aggregations";
import { topCategoriesInsight } from "./topCategories";
import { categoryMomChanges, momTrendInsights } from "./momTrend";
import { budgetOverageInsights, familyBudgetOverageInsight } from "./budgetOverage";
import { savingsSuggestions } from "./suggestions";
import { outlierInsights } from "./outliers";
import { staleCategoryInsights } from "./staleCategories";
import { buildInsights } from "./engine";

const categories = [
  { id: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)" },
  { id: "cat-dining", name: "Dining Out", icon: "🍽️", color: "var(--series-6)" },
  { id: "cat-transport", name: "Transport", icon: "🚗", color: "var(--series-1)" },
  { id: "cat-entertainment", name: "Entertainment", icon: "🎬", color: "var(--series-7)" },
];

describe("topCategoriesInsight", () => {
  it("summarizes the top category with its share of total spend and runner-ups", () => {
    const breakdown = categoryBreakdown(
      [
        { categoryId: "cat-groceries", amount: "300", date: new Date() },
        { categoryId: "cat-dining", amount: "100", date: new Date() },
        { categoryId: "cat-transport", amount: "100", date: new Date() },
      ],
      categories
    );

    const result = topCategoriesInsight(breakdown, 500);

    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe("cat-groceries");
    expect(result[0].detail).toContain("60%");
    expect(result[0].detail).toContain("Dining Out");
    expect(result[0].detail).toContain("Transport");
  });

  it("omits runner-up text with only one category", () => {
    const breakdown = categoryBreakdown([{ categoryId: "cat-groceries", amount: "50", date: new Date() }], categories);
    const result = topCategoriesInsight(breakdown, 50);
    expect(result[0].detail).not.toContain("Next highest");
  });

  it("returns nothing when there's no spend", () => {
    expect(topCategoriesInsight([], 0)).toEqual([]);
  });
});

describe("momTrend", () => {
  it("does not flag a move at exactly the 20% threshold", () => {
    const current = categoryBreakdown([{ categoryId: "cat-groceries", amount: "120", date: new Date() }], categories);
    const previous = categoryBreakdown([{ categoryId: "cat-groceries", amount: "100", date: new Date() }], categories);
    const changes = categoryMomChanges(current, previous);
    expect(changes[0].change).toBe(20);
    expect(momTrendInsights(changes)).toEqual([]);
  });

  it("flags a move just over the 20% threshold as a warning (up)", () => {
    const current = categoryBreakdown([{ categoryId: "cat-groceries", amount: "121", date: new Date() }], categories);
    const previous = categoryBreakdown([{ categoryId: "cat-groceries", amount: "100", date: new Date() }], categories);
    const changes = categoryMomChanges(current, previous);
    const insights = momTrendInsights(changes);
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("warning");
    expect(insights[0].title).toContain("up");
    expect(insights[0].title).toContain("21%");
  });

  it("flags a decrease of more than 20% as positive framing", () => {
    const current = categoryBreakdown([{ categoryId: "cat-groceries", amount: "70", date: new Date() }], categories);
    const previous = categoryBreakdown([{ categoryId: "cat-groceries", amount: "100", date: new Date() }], categories);
    const changes = categoryMomChanges(current, previous);
    const insights = momTrendInsights(changes);
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("positive");
    expect(insights[0].title).toContain("down");
    expect(insights[0].title).toContain("30%");
  });

  it("does not flag a category with no prior-period baseline (null change), even with real spend now", () => {
    const current = categoryBreakdown([{ categoryId: "cat-groceries", amount: "500", date: new Date() }], categories);
    const previous = categoryBreakdown([], categories);
    const changes = categoryMomChanges(current, previous);
    expect(changes[0].change).toBeNull();
    expect(momTrendInsights(changes)).toEqual([]);
  });
});

describe("budgetOverageInsights", () => {
  const buildRow = (actual: number, budget: number) => [
    { categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", budget, actual },
  ];

  it("does not flag just under the 90% warning threshold", () => {
    expect(budgetOverageInsights(buildRow(89.99, 100))).toEqual([]);
  });

  it("flags exactly 90% as a warning", () => {
    const insights = budgetOverageInsights(buildRow(90, 100));
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("warning");
  });

  it("flags just under 100% as a warning, not critical", () => {
    const insights = budgetOverageInsights(buildRow(99, 100));
    expect(insights[0].severity).toBe("warning");
  });

  it("flags exactly 100% as critical", () => {
    const insights = budgetOverageInsights(buildRow(100, 100));
    expect(insights[0].severity).toBe("critical");
  });

  it("flags over 100% as critical with the correct percentage", () => {
    const insights = budgetOverageInsights(buildRow(150, 100));
    expect(insights[0].severity).toBe("critical");
    expect(insights[0].detail).toContain("150%");
  });
});

describe("familyBudgetOverageInsight", () => {
  it("sums actual and budgeted across categories and applies the same thresholds", () => {
    const rows = [
      { categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", budget: 100, actual: 60 },
      { categoryId: "cat-dining", name: "Dining Out", icon: "🍽️", color: "var(--series-6)", budget: 100, actual: 45 },
    ];
    const budgets = [
      { categoryId: "cat-groceries", amount: "100" },
      { categoryId: "cat-dining", amount: "100" },
    ];

    // 105 / 200 = 52.5%, under the 90% threshold - no insight
    expect(familyBudgetOverageInsight(rows, budgets)).toEqual([]);
  });

  it("flags the family total once it crosses 90%", () => {
    const rows = [{ categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", budget: 100, actual: 95 }];
    const budgets = [{ categoryId: "cat-groceries", amount: "100" }];

    const insights = familyBudgetOverageInsight(rows, budgets);
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("warning");
    expect(insights[0].detail).toContain("95%");
  });

  it("returns nothing when no budgets are set", () => {
    expect(familyBudgetOverageInsight([], [])).toEqual([]);
  });
});

describe("savingsSuggestions", () => {
  it("suggests reviewing a top-3 category trending up more than 20%", () => {
    const breakdown = categoryBreakdown(
      [
        { categoryId: "cat-groceries", amount: "300", date: new Date() },
        { categoryId: "cat-dining", amount: "100", date: new Date() },
      ],
      categories
    );
    const changes = categoryMomChanges(
      breakdown,
      categoryBreakdown([{ categoryId: "cat-groceries", amount: "200", date: new Date() }], categories)
    );

    const suggestions = savingsSuggestions(breakdown, changes);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].categoryId).toBe("cat-groceries");
    expect(suggestions[0].detail).toContain("50%");
  });

  it("does not suggest a top-3 category trending up at exactly the 20% threshold", () => {
    const breakdown = categoryBreakdown([{ categoryId: "cat-groceries", amount: "120", date: new Date() }], categories);
    const changes = categoryMomChanges(
      breakdown,
      categoryBreakdown([{ categoryId: "cat-groceries", amount: "100", date: new Date() }], categories)
    );
    expect(savingsSuggestions(breakdown, changes)).toEqual([]);
  });

  it("does not suggest a category outside the top 3 by spend, even if trending up sharply", () => {
    const breakdown = categoryBreakdown(
      [
        { categoryId: "cat-groceries", amount: "400", date: new Date() },
        { categoryId: "cat-dining", amount: "300", date: new Date() },
        { categoryId: "cat-transport", amount: "200", date: new Date() },
        { categoryId: "cat-entertainment", amount: "10", date: new Date() },
      ],
      categories
    );
    const changes = categoryMomChanges(
      breakdown,
      categoryBreakdown([{ categoryId: "cat-entertainment", amount: "1", date: new Date() }], categories)
    );
    const suggestions = savingsSuggestions(breakdown, changes);
    expect(suggestions.some((s) => s.categoryId === "cat-entertainment")).toBe(false);
  });
});

describe("outlierInsights", () => {
  it("does not flag an expense at exactly 2x the trailing average", () => {
    const historical = [
      { categoryId: "cat-groceries", amount: "100" },
      { categoryId: "cat-groceries", amount: "100" },
      { categoryId: "cat-groceries", amount: "100" },
    ];
    const current = [{ id: "e1", categoryId: "cat-groceries", amount: "200", date: new Date() }];
    expect(outlierInsights(current, historical, categories)).toEqual([]);
  });

  it("flags an expense just over 2x the trailing average", () => {
    const historical = [
      { categoryId: "cat-groceries", amount: "100" },
      { categoryId: "cat-groceries", amount: "100" },
      { categoryId: "cat-groceries", amount: "100" },
    ];
    const current = [{ id: "e1", categoryId: "cat-groceries", amount: "201", date: new Date(), description: "Big shop" }];
    const insights = outlierInsights(current, historical, categories);
    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe("outlier-e1");
    expect(insights[0].detail).toContain("Big shop");
  });

  it("does not flag when the category has fewer than 3 historical expenses", () => {
    const historical = [
      { categoryId: "cat-groceries", amount: "10" },
      { categoryId: "cat-groceries", amount: "10" },
    ];
    const current = [{ id: "e1", categoryId: "cat-groceries", amount: "500", date: new Date() }];
    expect(outlierInsights(current, historical, categories)).toEqual([]);
  });

  it("caps the number of outliers reported and prioritizes the most extreme", () => {
    const historical = Array.from({ length: 3 }, () => ({ categoryId: "cat-groceries", amount: "10" }));
    const current = [
      { id: "e1", categoryId: "cat-groceries", amount: "25", date: new Date() }, // 2.5x
      { id: "e2", categoryId: "cat-groceries", amount: "100", date: new Date() }, // 10x
      { id: "e3", categoryId: "cat-groceries", amount: "50", date: new Date() }, // 5x
      { id: "e4", categoryId: "cat-groceries", amount: "30", date: new Date() }, // 3x
    ];
    const insights = outlierInsights(current, historical, categories);
    expect(insights.map((i) => i.id)).toEqual(["outlier-e2", "outlier-e3", "outlier-e4"]);
  });
});

describe("staleCategoryInsights", () => {
  it("flags a budgeted category with zero spend", () => {
    const rows = [{ categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", budget: 50, actual: 0 }];
    const insights = staleCategoryInsights(rows);
    expect(insights).toHaveLength(1);
    expect(insights[0].detail).toContain("$50.00");
  });

  it("does not flag a budgeted category with any spend logged", () => {
    const rows = [{ categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", budget: 50, actual: 0.01 }];
    expect(staleCategoryInsights(rows)).toEqual([]);
  });
});

describe("buildInsights (engine composition)", () => {
  it("composes a hand-verifiable multi-insight scenario and sorts by severity", () => {
    // Groceries: budget $100, spent $150 -> 150% -> critical overage.
    // Dining: budget $50, spent $45 -> 90% -> warning overage.
    // Dining also up from $20 last period ($45 vs $20 = +125%) -> warning mom + suggestion (top category).
    // Transport: no budget, $10 this period vs $100 last period -> -90% -> positive mom.
    // Entertainment: budgeted $30, zero spend this period -> stale info.
    const result = buildInsights({
      categories,
      currentExpenses: [
        { id: "e1", categoryId: "cat-groceries", amount: "150", date: new Date("2026-07-05") },
        { id: "e2", categoryId: "cat-dining", amount: "45", date: new Date("2026-07-06") },
        { id: "e3", categoryId: "cat-transport", amount: "10", date: new Date("2026-07-07") },
      ],
      previousExpenses: [
        { categoryId: "cat-dining", amount: "20", date: new Date("2026-06-06") },
        { categoryId: "cat-transport", amount: "100", date: new Date("2026-06-07") },
      ],
      historicalExpenses: [],
      budgets: [
        { categoryId: "cat-groceries", amount: "100" },
        { categoryId: "cat-dining", amount: "50" },
        { categoryId: "cat-entertainment", amount: "30" },
      ],
    });

    const byId = new Map(result.map((i) => [i.id, i]));

    expect(byId.get("budget-overage-cat-groceries")?.severity).toBe("critical");
    expect(byId.get("budget-overage-cat-dining")?.severity).toBe("warning");
    expect(byId.get("mom-cat-dining")?.severity).toBe("warning");
    expect(byId.get("mom-cat-transport")?.severity).toBe("positive");
    expect(byId.get("suggestion-cat-dining")).toBeDefined();
    expect(byId.get("stale-cat-entertainment")?.severity).toBe("info");

    // Severity order: critical, warning, info, positive.
    const severityIndexes = result.map((i) => ["critical", "warning", "info", "positive"].indexOf(i.severity));
    expect(severityIndexes).toEqual([...severityIndexes].sort((a, b) => a - b));
  });

  it("returns no insights for a family with no expenses, budgets, or history", () => {
    expect(
      buildInsights({
        categories,
        currentExpenses: [],
        previousExpenses: [],
        historicalExpenses: [],
        budgets: [],
      })
    ).toEqual([]);
  });
});
