import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { toDateInputValue } from "@/lib/format";

export default async function EditExpensePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const expense = await db.expense.findFirst({ where: { id, familyId: session.familyId } });
  if (!expense) notFound();

  const [categories, profiles] = await Promise.all([
    db.category.findMany({
      where: { familyId: session.familyId, OR: [{ archivedAt: null }, { id: expense.categoryId }] },
      orderBy: { name: "asc" },
    }),
    db.profile.findMany({ where: { familyId: session.familyId }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Edit expense ✏️</h1>
        <p className="text-sm text-ink-secondary">Update the details below.</p>
      </div>
      <Card className="p-6">
        <ExpenseForm
          action={`/api/expenses/${id}/update`}
          categories={categories}
          profiles={profiles}
          submitLabel="Save changes"
          error={query.error}
          defaultValues={{
            amount: query.amount ?? expense.amount.toString(),
            categoryId: query.categoryId ?? expense.categoryId,
            profileId: query.profileId ?? expense.profileId,
            date: query.date ?? toDateInputValue(expense.date),
            description: query.description ?? expense.description ?? undefined,
            notes: query.notes ?? expense.notes ?? undefined,
            paymentMethod: query.paymentMethod ?? expense.paymentMethod ?? undefined,
          }}
        />
      </Card>
      <form action={`/api/expenses/${id}/delete`} method="POST">
        <Button type="submit" variant="ghost" className="w-full text-status-critical hover:bg-status-critical/10">
          Delete expense
        </Button>
      </form>
    </div>
  );
}
