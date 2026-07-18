import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthTotal, recentExpenses] = await Promise.all([
    db.expense.aggregate({
      where: { familyId: session.familyId, date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    db.expense.findMany({
      where: { familyId: session.familyId },
      include: { category: true, profile: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-secondary">Your family&apos;s spending at a glance.</p>
        </div>
        <LinkButton href="/expenses/new">Add expense</LinkButton>
      </div>

      <Card className="p-6">
        <p className="text-sm text-ink-secondary">Spent this month</p>
        <p className="mt-1 text-3xl font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(monthTotal._sum.amount?.toString() ?? "0")}
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Recent expenses</h2>
          <Link href="/expenses" className="text-xs font-medium text-accent transition-colors duration-150 hover:underline">
            View all
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">No expenses logged yet.</p>
            <p className="mt-1 text-sm text-ink-secondary">Add your first one to get started.</p>
          </div>
        ) : (
          recentExpenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} />)
        )}
      </Card>

      <Card className="p-6">
        <p className="text-sm text-ink-secondary">
          Charts and money-saving insights are coming in a future phase.
        </p>
      </Card>
    </div>
  );
}
