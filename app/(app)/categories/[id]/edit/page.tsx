import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default async function EditCategoryPage({
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

  const category = await db.category.findFirst({ where: { id, familyId: session.familyId } });
  if (!category) notFound();

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Edit category ✏️</h1>
        <p className="text-sm text-ink-secondary">Update the name, icon, or color.</p>
      </div>
      <Card className="p-6">
        <CategoryForm
          action={`/api/categories/${id}/update`}
          submitLabel="Save changes"
          error={query.error}
          defaultValues={{
            name: query.name ?? category.name,
            icon: query.icon ?? category.icon,
            color: query.color ?? category.color,
          }}
        />
      </Card>
      <form action={`/api/categories/${id}/${category.archivedAt ? "unarchive" : "archive"}`} method="POST">
        <Button type="submit" variant="ghost" className="w-full text-status-critical hover:bg-status-critical/10">
          {category.archivedAt ? "Unarchive category" : "Archive category"}
        </Button>
      </form>
    </div>
  );
}
