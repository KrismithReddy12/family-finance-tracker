import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Group } from "@/components/ui/Group";
import { LinkButton } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; profileId?: string }>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const [expenses, categories, profiles] = await Promise.all([
    db.expense.findMany({
      where: {
        familyId: session.familyId,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.profileId ? { profileId: query.profileId } : {}),
      },
      include: { category: true, profile: true },
      orderBy: { date: "desc" },
      take: 200,
    }),
    db.category.findMany({ where: { familyId: session.familyId }, orderBy: { name: "asc" } }),
    db.profile.findMany({ where: { familyId: session.familyId }, orderBy: { createdAt: "asc" } }),
  ]);

  const hasFilters = Boolean(query.categoryId || query.profileId);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-bold text-ink">Expenses</h1>
        <LinkButton href="/expenses/new" className="px-4 py-2 text-sm">
          ➕ Add
        </LinkButton>
      </div>

      <form method="GET" className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
        <div className="w-40 shrink-0">
          <Select
            name="categoryId"
            defaultValue={query.categoryId ?? ""}
            className="rounded-full bg-surface py-2 text-xs font-semibold text-ink-secondary"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-36 shrink-0">
          <Select
            name="profileId"
            defaultValue={query.profileId ?? ""}
            className="rounded-full bg-surface py-2 text-xs font-semibold text-ink-secondary"
          >
            <option value="">Everyone</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold text-ink-secondary transition-colors duration-150 hover:text-ink"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/expenses"
            className="shrink-0 px-1 py-2 text-xs font-medium text-ink-secondary transition-colors duration-150 hover:text-accent"
          >
            Clear
          </Link>
        )}
      </form>

      {expenses.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm font-semibold text-ink">
            {hasFilters ? "No expenses match these filters." : "No expenses logged yet."}
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            {hasFilters ? "Try clearing the filters." : "Add your first one to get started."}
          </p>
          {!hasFilters && (
            <LinkButton href="/expenses/new" className="mt-4">
              ➕ Add expense
            </LinkButton>
          )}
        </Card>
      ) : (
        <Group>
          {expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </Group>
      )}
    </div>
  );
}
