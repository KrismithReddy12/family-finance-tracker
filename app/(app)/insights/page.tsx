import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { InsightCard } from "@/components/insights/InsightCard";
import { buildInsights } from "@/lib/insights/engine";
import { formatMonthLabel, fromMonthInputValue, toMonthInputValue } from "@/lib/format";

const HISTORICAL_WINDOW_MONTHS = 3;

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const month = query.month && /^\d{4}-\d{2}$/.test(query.month) ? query.month : toMonthInputValue(new Date());
  const periodStart = fromMonthInputValue(month);
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1);
  const prevPeriodStart = new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, 1);
  const historicalStart = new Date(periodStart.getFullYear(), periodStart.getMonth() - HISTORICAL_WINDOW_MONTHS, 1);
  const prevMonth = toMonthInputValue(prevPeriodStart);
  const nextMonth = toMonthInputValue(new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1));

  const [categories, currentExpenses, previousExpenses, historicalExpenses, budgets] = await Promise.all([
    db.category.findMany({ where: { familyId: session.familyId }, orderBy: { name: "asc" } }),
    db.expense.findMany({
      where: { familyId: session.familyId, date: { gte: periodStart, lt: periodEnd } },
      select: { id: true, categoryId: true, amount: true, date: true, description: true },
    }),
    db.expense.findMany({
      where: { familyId: session.familyId, date: { gte: prevPeriodStart, lt: periodStart } },
      select: { categoryId: true, amount: true, date: true },
    }),
    db.expense.findMany({
      where: { familyId: session.familyId, date: { gte: historicalStart, lt: periodStart } },
      select: { categoryId: true, amount: true, date: true },
    }),
    db.budget.findMany({ where: { familyId: session.familyId, periodStart } }),
  ]);

  const insights = buildInsights({ categories, currentExpenses, previousExpenses, historicalExpenses, budgets });
  const monthLabel = formatMonthLabel(periodStart);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Insights 💡</h1>
        <p className="text-sm text-ink-secondary">Where your money&apos;s going, and what&apos;s worth a second look.</p>
      </div>

      <Card className="flex items-center gap-2 p-4">
        <LinkButton href={`/insights?month=${prevMonth}`} variant="secondary" className="px-3 py-2.5 text-sm">
          ←
        </LinkButton>
        <span className="font-display flex-1 text-center text-sm font-semibold text-ink">{monthLabel}</span>
        <LinkButton href={`/insights?month=${nextMonth}`} variant="secondary" className="px-3 py-2.5 text-sm">
          →
        </LinkButton>
      </Card>

      {insights.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm font-semibold text-ink">No insights yet for {monthLabel}.</p>
          <p className="mt-1 text-sm text-ink-secondary">
            Log a few expenses (and maybe a budget or two) and personalized insights will show up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
