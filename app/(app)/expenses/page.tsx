import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Expenses</h1>
          <p className="text-sm text-ink-secondary">Everything the family has logged.</p>
        </div>
        <LinkButton href="/expenses/new">Add expense</LinkButton>
      </div>

      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={query.categoryId ?? ""}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-44">
            <Label htmlFor="profileId">Profile</Label>
            <Select id="profileId" name="profileId" defaultValue={query.profileId ?? ""}>
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
            className="rounded-lg border border-hairline-strong bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-surface-page"
          >
            Filter
          </button>
          {hasFilters && (
            <Link
              href="/expenses"
              className="px-2 py-2 text-sm text-ink-secondary transition-colors duration-150 hover:text-accent"
            >
              Clear
            </Link>
          )}
        </form>
      </Card>

      <Card>
        {expenses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">
              {hasFilters ? "No expenses match these filters." : "No expenses logged yet."}
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              {hasFilters ? "Try clearing the filters." : "Add your first one to get started."}
            </p>
            {!hasFilters && (
              <LinkButton href="/expenses/new" className="mt-4">
                Add expense
              </LinkButton>
            )}
          </div>
        ) : (
          expenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} />)
        )}
      </Card>
    </div>
  );
}
