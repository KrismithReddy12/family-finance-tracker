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
    <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-hairline bg-surface px-4 py-3 shadow-[3px_3px_0_var(--shadow-ink)] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex min-w-0 items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{category.name}</p>
          <p className="truncate text-xs text-ink-secondary">
            {category.isDefault ? "Default category" : "Custom category"}
            {archived ? " · Archived" : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {!archived && (
          <Link
            href={`/categories/${category.id}/edit`}
            className="text-xs font-bold text-accent transition-colors duration-150 hover:underline"
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
