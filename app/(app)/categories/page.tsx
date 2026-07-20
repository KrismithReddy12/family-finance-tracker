import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { CategoryCard } from "@/components/categories/CategoryCard";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const categories = await db.category.findMany({
    where: { familyId: session.familyId },
    orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
  });

  const active = categories.filter((c) => !c.archivedAt);
  const archived = categories.filter((c) => c.archivedAt);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Categories 🏷️</h1>
          <p className="text-sm text-ink-secondary">Organize how the family&apos;s spending is grouped.</p>
        </div>
        <LinkButton href="/categories/new">➕ Add category</LinkButton>
      </div>

      {active.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm font-semibold text-ink">No active categories.</p>
          <p className="mt-1 text-sm text-ink-secondary">Add one to start organizing expenses.</p>
          <LinkButton href="/categories/new" className="mt-4">
            ➕ Add category
          </LinkButton>
        </Card>
      ) : (
        <div className="space-y-3">
          {active.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display px-1 text-sm font-semibold text-ink-secondary">Archived</h2>
          <div className="space-y-3">
            {archived.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
