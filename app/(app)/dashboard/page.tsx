import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Group } from "@/components/ui/Group";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
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
  const hasFilters = Boolean(query.month || query.profileId);

  const periodStart = fromMonthInputValue(month);
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1);
  const prevMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, 1));
  const nextMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1));
  const trendStart = new Date(periodStart.getFullYear(), periodStart.getMonth() - (TREND_MONTHS - 1), 1);

  const profileFilter = profileId ? { profileId } : {};
  const prevHref = `/dashboard?month=${prevMonth}${profileId ? `&profileId=${profileId}` : ""}`;
  const nextHref = `/dashboard?month=${nextMonth}${profileId ? `&profileId=${profileId}` : ""}`;

  const [family, activeProfile, profiles, categories, budgets, monthExpenses, trendExpenses] = await Promise.all([
    db.family.findUnique({ where: { id: session.familyId } }),
    db.profile.findUnique({ where: { id: session.activeProfileId } }),
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
  if (!activeProfile) redirect("/profiles");

  const trend = monthlyTrend(trendExpenses, TREND_MONTHS, periodStart);
  const monthTotal = trend[trend.length - 1]?.total ?? 0;
  const prevMonthTotal = trend[trend.length - 2]?.total ?? 0;
  const delta = percentChange(monthTotal, prevMonthTotal);

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const breakdown = categoryBreakdown(monthExpenses, categories);
  const budgetRows = budgetVsActual(categories, budgets, monthExpenses);
  const budgetedActual = budgetRows.reduce((sum, row) => sum + row.actual, 0);
  const budgetRemaining = totalBudgeted - budgetedActual;
  const recentExpenses = monthExpenses.slice(0, 5);

  const monthLabel = formatMonthLabel(periodStart);
  const isDeltaGood = delta === null ? true : delta <= 0;

  return (
    <div className="animate-fade-in space-y-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: activeProfile.avatarColor }}
          >
            {activeProfile.avatarEmoji}
          </span>
          <div>
            <p className="font-display text-sm font-bold text-ink">Hey, {activeProfile.name}</p>
            {family && <p className="text-xs text-ink-muted">{family.name}</p>}
          </div>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors duration-150 hover:bg-surface hover:text-ink"
        >
          ⚙️
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-center gap-3">
          <LinkButton href={prevHref} variant="ghost" className="px-2.5 py-1.5 text-base">
            ‹
          </LinkButton>
          <span className="font-display text-sm font-bold text-ink-secondary">{monthLabel}</span>
          <LinkButton href={nextHref} variant="ghost" className="px-2.5 py-1.5 text-base">
            ›
          </LinkButton>
        </div>

        <div className="pt-3 text-center">
          <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">Spent this month</p>
          <p
            className="font-display mt-1 text-[40px] leading-none font-bold text-ink"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatCurrency(monthTotal)}
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-2 text-sm">
            {delta !== null ? (
              <>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isDeltaGood ? "bg-success/15 text-success" : "bg-status-critical/15 text-status-critical"
                  }`}
                >
                  {delta > 0 ? "▲" : delta < 0 ? "▼" : "–"} {Math.abs(delta).toFixed(1)}%
                </span>
                <span className="text-ink-muted">vs last month</span>
              </>
            ) : (
              <span className="text-ink-muted">No spend last month to compare</span>
            )}
          </div>
          {totalBudgeted > 0 && (
            <p className="mt-1.5 text-xs font-medium" style={{ color: budgetRemaining < 0 ? "var(--status-critical)" : "var(--ink-muted)" }}>
              {budgetRemaining < 0
                ? `${formatCurrency(Math.abs(budgetRemaining))} over your ${formatCurrency(totalBudgeted)} budget`
                : `${formatCurrency(budgetRemaining)} left of ${formatCurrency(totalBudgeted)} budgeted`}
            </p>
          )}
        </div>
      </div>

      <Card className="p-3">
        <form method="GET" className="flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="month">Jump to month</Label>
            <Input type="month" id="month" name="month" defaultValue={month} className="py-2 text-sm" />
          </div>
          <div className="flex-1">
            <Label htmlFor="profileId">Profile</Label>
            <Select id="profileId" name="profileId" defaultValue={profileId ?? ""} className="py-2 text-sm">
              <option value="">Everyone</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
            Go
          </Button>
          {hasFilters && (
            <Link
              href="/dashboard"
              className="px-1 py-2 text-xs font-medium text-ink-secondary transition-colors duration-150 hover:text-accent"
            >
              Clear
            </Link>
          )}
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold text-ink">Where it went</h2>
          <p className="mb-4 text-xs text-ink-secondary">By category, {monthLabel}.</p>
          {breakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-secondary">No expenses logged for this month yet.</p>
          ) : (
            <CategoryBreakdownChart data={breakdown} />
          )}
        </Card>

        <Card className="p-5">
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
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-sm font-semibold text-ink">Budgets this month</h2>
            <Link href="/budgets" className="text-xs font-bold text-accent">
              See all ›
            </Link>
          </div>
          <Group>
            {budgetRows.slice(0, MAX_BUDGET_METERS).map((row) => (
              <BudgetMeterRow key={row.categoryId} row={row} />
            ))}
          </Group>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-sm font-semibold text-ink">Recent</h2>
          <Link href="/expenses" className="text-xs font-bold text-accent">
            See all ›
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm font-semibold text-ink">No expenses logged yet.</p>
            <p className="mt-1 text-sm text-ink-secondary">Add your first one to get started.</p>
            <LinkButton href="/expenses/new" className="mt-4">
              ➕ Add expense
            </LinkButton>
          </Card>
        ) : (
          <Group>
            {recentExpenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </Group>
        )}
      </div>
    </div>
  );
}
