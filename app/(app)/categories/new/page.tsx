import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Add category 🏷️</h1>
        <p className="text-sm text-ink-secondary">Create a new way to group expenses.</p>
      </div>
      <Card className="p-6">
        <CategoryForm
          action="/api/categories"
          submitLabel="Add category"
          error={query.error}
          defaultValues={{ name: query.name, icon: query.icon, color: query.color }}
        />
      </Card>
    </div>
  );
}
