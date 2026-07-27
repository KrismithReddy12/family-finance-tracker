import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Group } from "@/components/ui/Group";
import { LinkButton } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { BudgetRow } from "@/components/budgets/BudgetRow";
import { formatCurrency, formatMonthLabel, fromMonthInputValue, toMonthInputValue } from "@/lib/format";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "Please enter a valid budget amount and try again.",
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; error?: string; categoryId?: string; amount?: string }>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const month = query.month && /^\d{4}-\d{2}$/.test(query.month) ? query.month : toMonthInputValue(new Date());
  const periodStart = fromMonthInputValue(month);
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1);
  const prevMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, 1));
  const nextMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1));

  const [activeCategories, budgets, spentRows] = await Promise.all([
    db.category.findMany({ where: { familyId: session.familyId, archivedAt: null }, orderBy: { name: "asc" } }),
    db.budget.findMany({
      where: { familyId: session.familyId, periodStart },
      include: { category: true },
    }),
    db.expense.groupBy({
      by: ["categoryId"],
      where: { familyId: session.familyId, date: { gte: periodStart, lt: periodEnd } },
      _sum: { amount: true },
    }),
  ]);

  const budgetByCategory = new Map(budgets.map((b) => [b.categoryId, b]));
  const spentByCategory = new Map(spentRows.map((r) => [r.categoryId, r._sum.amount?.toString() ?? "0"]));

  const activeIds = new Set(activeCategories.map((c) => c.id));
  const archivedWithBudget = budgets.filter((b) => !activeIds.has(b.categoryId)).map((b) => b.category);
  const categories = [...activeCategories, ...archivedWithBudget].sort((a, b) => a.name.localeCompare(b.name));

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = spentRows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);

  const rows = categories.map((category) => {
    const budget = budgetByCategory.get(category.id);
    return {
      category,
      spent: spentByCategory.get(category.id) ?? "0",
      budget: budget ? { id: budget.id, amount: budget.amount.toString() } : null,
      amountOverride: query.error && query.categoryId === category.id ? query.amount : undefined,
    };
  });

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="font-display text-xl font-bold text-ink">Budgets</h1>

      <FormError>{query.error ? (ERROR_MESSAGES[query.error] ?? "Something went wrong.") : null}</FormError>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <LinkButton href={`/budgets?month=${prevMonth}`} variant="ghost" className="px-2.5 py-1.5 text-base">
            ‹
          </LinkButton>
          <span className="font-display min-w-32 text-center text-sm font-bold text-ink">
            {formatMonthLabel(periodStart)}
          </span>
          <LinkButton href={`/budgets?month=${nextMonth}`} variant="ghost" className="px-2.5 py-1.5 text-base">
            ›
          </LinkButton>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-ink-secondary">Spent vs budgeted</p>
          <p
            className="font-display text-lg font-semibold text-ink"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatCurrency(totalSpent)} <span className="text-ink-muted">/ {formatCurrency(totalBudget)}</span>
          </p>
        </div>
      </Card>

      {rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm font-semibold text-ink">No categories yet.</p>
          <p className="mt-1 text-sm text-ink-secondary">Add a category first, then set a budget for it.</p>
          <LinkButton href="/categories/new" className="mt-4">
            ➕ Add category
          </LinkButton>
        </Card>
      ) : (
        <Group>
          {rows.map((row) => (
            <BudgetRow
              key={row.category.id}
              category={row.category}
              spent={row.spent}
              budget={row.budget}
              periodStart={month}
              amountOverride={row.amountOverride}
            />
          ))}
        </Group>
      )}
    </div>
  );
}
