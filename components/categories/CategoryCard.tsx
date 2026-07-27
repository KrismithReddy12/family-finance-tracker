import Link from "next/link";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";

type CategoryData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  archivedAt: Date | null;
};

export function CategoryCard({ category }: { category: CategoryData }) {
  const archived = Boolean(category.archivedAt);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{category.name}</p>
          <p className="truncate text-xs text-ink-muted">
            {category.isDefault ? "Default category" : "Custom category"}
            {archived ? " · Archived" : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {!archived && (
          <Link
            href={`/categories/${category.id}/edit`}
            className="text-xs font-bold text-accent"
          >
            Edit
          </Link>
        )}
        <form action={`/api/categories/${category.id}/${archived ? "unarchive" : "archive"}`} method="POST">
          <Button type="submit" variant="ghost" className="px-3 py-1.5 text-xs">
            {archived ? "Unarchive" : "Archive"}
          </Button>
        </form>
      </div>
    </div>
  );
}
