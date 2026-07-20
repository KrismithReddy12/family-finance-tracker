import { describe, expect, it } from "vitest";
import { budgetVsActual, categoryBreakdown, monthlyTrend, percentChange } from "./aggregations";

const categories = [
  { id: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)" },
  { id: "cat-dining", name: "Dining Out", icon: "🍽️", color: "var(--series-6)" },
  { id: "cat-transport", name: "Transport", icon: "🚗", color: "var(--series-1)" },
];

describe("categoryBreakdown", () => {
  it("sums amounts per category and sorts highest first", () => {
    const expenses = [
      { categoryId: "cat-groceries", amount: "40.00", date: new Date("2026-07-05") },
      { categoryId: "cat-groceries", amount: "60.00", date: new Date("2026-07-12") },
      { categoryId: "cat-dining", amount: "25.50", date: new Date("2026-07-08") },
    ];

    const result = categoryBreakdown(expenses, categories);

    expect(result).toEqual([
      { categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", total: 100 },
      { categoryId: "cat-dining", name: "Dining Out", icon: "🍽️", color: "var(--series-6)", total: 25.5 },
    ]);
  });

  it("excludes categories with no spend and expenses whose category no longer resolves", () => {
    const expenses = [
      { categoryId: "cat-groceries", amount: "10.00", date: new Date("2026-07-01") },
      { categoryId: "cat-unknown", amount: "999.00", date: new Date("2026-07-01") },
    ];

    const result = categoryBreakdown(expenses, categories);

    expect(result).toEqual([
      { categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", total: 10 },
    ]);
  });

  it("returns an empty array for no expenses", () => {
    expect(categoryBreakdown([], categories)).toEqual([]);
  });
});

describe("monthlyTrend", () => {
  it("buckets totals by month and zero-fills months with no expenses", () => {
    const expenses = [
      { categoryId: "cat-groceries", amount: "100", date: new Date(2026, 4, 10) },
      { categoryId: "cat-groceries", amount: "50", date: new Date(2026, 4, 20) },
      { categoryId: "cat-dining", amount: "30", date: new Date(2026, 6, 3) },
    ];

    const result = monthlyTrend(expenses, 3, new Date(2026, 6, 20));

    expect(result).toEqual([
      { month: "2026-05", label: "May", total: 150 },
      { month: "2026-06", label: "Jun", total: 0 },
      { month: "2026-07", label: "Jul", total: 30 },
    ]);
  });

  it("crosses a year boundary correctly", () => {
    const expenses = [
      { categoryId: "cat-groceries", amount: "20", date: new Date(2025, 11, 15) },
      { categoryId: "cat-groceries", amount: "40", date: new Date(2026, 0, 5) },
    ];

    const result = monthlyTrend(expenses, 2, new Date(2026, 0, 20));

    expect(result).toEqual([
      { month: "2025-12", label: "Dec", total: 20 },
      { month: "2026-01", label: "Jan", total: 40 },
    ]);
  });

  it("excludes expenses outside the trailing window", () => {
    const expenses = [{ categoryId: "cat-groceries", amount: "999", date: new Date(2025, 0, 1) }];

    const result = monthlyTrend(expenses, 2, new Date(2026, 0, 20));

    expect(result.every((m) => m.total === 0)).toBe(true);
  });
});

describe("budgetVsActual", () => {
  it("pairs each budget with actual spend and sorts by percent-of-budget used, highest first", () => {
    const budgets = [
      { categoryId: "cat-groceries", amount: "200.00" },
      { categoryId: "cat-dining", amount: "50.00" },
    ];
    const expenses = [
      { categoryId: "cat-groceries", amount: "150.00", date: new Date("2026-07-05") },
      { categoryId: "cat-dining", amount: "45.00", date: new Date("2026-07-08") },
    ];

    const result = budgetVsActual(categories, budgets, expenses);

    expect(result).toEqual([
      { categoryId: "cat-dining", name: "Dining Out", icon: "🍽️", color: "var(--series-6)", budget: 50, actual: 45 },
      { categoryId: "cat-groceries", name: "Groceries", icon: "🛒", color: "var(--series-2)", budget: 200, actual: 150 },
    ]);
  });

  it("reports zero actual for a budgeted category with no expenses", () => {
    const budgets = [{ categoryId: "cat-transport", amount: "80.00" }];

    const result = budgetVsActual(categories, budgets, []);

    expect(result).toEqual([
      { categoryId: "cat-transport", name: "Transport", icon: "🚗", color: "var(--series-1)", budget: 80, actual: 0 },
    ]);
  });

  it("skips budgets whose category no longer resolves", () => {
    const budgets = [{ categoryId: "cat-deleted", amount: "10.00" }];

    expect(budgetVsActual(categories, budgets, [])).toEqual([]);
  });
});

describe("percentChange", () => {
  it("computes a positive percent change", () => {
    expect(percentChange(150, 100)).toBe(50);
  });

  it("computes a negative percent change", () => {
    expect(percentChange(75, 100)).toBe(-25);
  });

  it("returns 0 when both current and previous are 0", () => {
    expect(percentChange(0, 0)).toBe(0);
  });

  it("returns null when there's no baseline to compare against", () => {
    expect(percentChange(100, 0)).toBeNull();
  });
});
