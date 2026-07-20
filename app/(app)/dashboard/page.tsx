import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { StatTile } from "@/components/dashboard/StatTile";
import { BudgetMeterRow } from "@/components/dashboard/BudgetMeterRow";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { categoryBreakdown, monthlyTrend, budgetVsActual, percentChange } from "@/lib/charts/aggregations";
import { formatCurrency, formatMonthLabel, fromMonthInputValue, toMonthInputValue } from "@/lib/format";

const TREND_MONTHS = 6;
const MAX_BUDGET_METERS = 6;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; profileId?: string }>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const month = query.month && /^\d{4}-\d{2}$/.test(query.month) ? query.month : toMonthInputValue(new Date());
  const profileId = query.profileId || undefined;
  const isCurrentMonth = month === toMonthInputValue(new Date());
  const hasFilters = Boolean(query.month || query.profileId);

  const periodStart = fromMonthInputValue(month);
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1);
  const prevMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, 1));
  const nextMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1));
  const trendStart = new Date(periodStart.getFullYear(), periodStart.getMonth() - (TREND_MONTHS - 1), 1);

  const profileFilter = profileId ? { profileId } : {};

  const [profiles, categories, budgets, monthExpenses, trendExpenses] = await Promise.all([
    db.profile.findMany({ where: { familyId: session.familyId }, orderBy: { createdAt: "asc" } }),
    db.category.findMany({ where: { familyId: session.familyId }, orderBy: { name: "asc" } }),
    db.budget.findMany({ where: { familyId: session.familyId, periodStart } }),
    db.expense.findMany({
      where: { familyId: session.familyId, date: { gte: periodStart, lt: periodEnd }, ...profileFilter },
      include: { category: true, profile: true },
      orderBy: { date: "desc" },
    }),
    db.expense.findMany({
      where: { familyId: session.familyId, date: { gte: trendStart, lt: periodEnd }, ...profileFilter },
      select: { categoryId: true, amount: true, date: true },
    }),
  ]);

  const trend = monthlyTrend(trendExpenses, TREND_MONTHS, periodStart);
  const monthTotal = trend[trend.length - 1]?.total ?? 0;
  const prevMonthTotal = trend[trend.length - 2]?.total ?? 0;
  const delta = percentChange(monthTotal, prevMonthTotal);

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const breakdown = categoryBreakdown(monthExpenses, categories);
  const budgetRows = budgetVsActual(categories, budgets, monthExpenses);
  const budgetedActual = budgetRows.reduce((sum, row) => sum + row.actual, 0);
  const recentExpenses = monthExpenses.slice(0, 5);

  const monthLabel = formatMonthLabel(periodStart);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Dashboard ✨</h1>
          <p className="text-sm text-ink-secondary">
            {isCurrentMonth ? "Your family's spending at a glance." : `Spending for ${monthLabel}.`}
          </p>
        </div>
        <LinkButton href="/expenses/new">➕ Add expense</LinkButton>
      </div>

      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1">
            <LinkButton
              href={`/dashboard?month=${prevMonth}${profileId ? `&profileId=${profileId}` : ""}`}
              variant="secondary"
              className="px-3 py-2.5 text-sm"
            >
              ←
            </LinkButton>
            <div className="w-40">
              <Label htmlFor="month">Month</Label>
              <Input id="month" name="month" type="month" defaultValue={month} />
            </div>
            <LinkButton
              href={`/dashboard?month=${nextMonth}${profileId ? `&profileId=${profileId}` : ""}`}
              variant="secondary"
              className="px-3 py-2.5 text-sm"
            >
              →
            </LinkButton>
          </div>
          <div className="w-44">
            <Label htmlFor="profileId">Profile</Label>
            <Select id="profileId" name="profileId" defaultValue={profileId ?? ""}>
              <option value="">Everyone</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters && (
            <Link
              href="/dashboard"
              className="px-2 py-2 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:text-accent"
            >
              Clear
            </Link>
          )}
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label={`Spent in ${monthLabel}`} value={formatCurrency(monthTotal)} />
        <StatTile
          label="Budget remaining"
          value={totalBudgeted > 0 ? formatCurrency(totalBudgeted - budgetedActual) : "—"}
          hint={totalBudgeted > 0 ? `of ${formatCurrency(totalBudgeted)} budgeted` : "No budgets set for this month"}
        />
        <StatTile
          label="Vs last month"
          value={delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(0)}%`}
          delta={
            delta === null
              ? null
              : { text: delta === 0 ? "No change" : delta > 0 ? "More than last month" : "Less than last month", isGood: delta <= 0 }
          }
          hint={delta === null ? "No spend last month to compare" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-sm font-semibold text-ink">Where it went</h2>
          <p className="mb-4 text-xs text-ink-secondary">By category, {monthLabel}.</p>
          {breakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-secondary">No expenses logged for this month yet.</p>
          ) : (
            <CategoryBreakdownChart data={breakdown} />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-sm font-semibold text-ink">Spending trend</h2>
          <p className="mb-4 text-xs text-ink-secondary">Trailing {TREND_MONTHS} months.</p>
          {trendExpenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-secondary">No expenses in this window yet.</p>
          ) : (
            <MonthlyTrendChart data={trend} />
          )}
        </Card>
      </div>

      {budgetRows.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-ink">Budgets this month</h2>
              <p className="text-xs text-ink-secondary">Spend against what you set aside.</p>
            </div>
            <Link href="/budgets" className="text-xs font-bold text-accent transition-colors duration-150 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {budgetRows.slice(0, MAX_BUDGET_METERS).map((row) => (
              <BudgetMeterRow key={row.categoryId} row={row} />
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-sm font-semibold text-ink">Recent expenses</h2>
          <Link
            href="/expenses"
            className="text-xs font-bold text-accent transition-colors duration-150 hover:underline"
          >
            View all
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm font-semibold text-ink">No expenses logged yet.</p>
            <p className="mt-1 text-sm text-ink-secondary">Add your first one to get started.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
