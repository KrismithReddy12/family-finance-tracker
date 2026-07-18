import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { toDateInputValue } from "@/lib/format";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const [categories, profiles] = await Promise.all([
    db.category.findMany({
      where: { familyId: session.familyId, archivedAt: null },
      orderBy: { name: "asc" },
    }),
    db.profile.findMany({ where: { familyId: session.familyId }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Add expense</h1>
        <p className="text-sm text-ink-secondary">Log a new purchase for the family.</p>
      </div>
      <Card className="p-6">
        <ExpenseForm
          action="/api/expenses"
          categories={categories}
          profiles={profiles}
          submitLabel="Add expense"
          error={query.error}
          defaultValues={{
            amount: query.amount,
            categoryId: query.categoryId,
            profileId: query.profileId ?? session.activeProfileId,
            date: query.date ?? toDateInputValue(new Date()),
            description: query.description,
            notes: query.notes,
            paymentMethod: query.paymentMethod,
          }}
        />
      </Card>
    </div>
  );
}
