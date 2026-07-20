import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

type ExpenseRowData = {
  id: string;
  amount: { toString(): string };
  date: Date;
  description: string | null;
  category: { name: string; color: string; icon: string };
  profile: { name: string };
};

export function ExpenseRow({ expense }: { expense: ExpenseRowData }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-hairline bg-surface px-4 py-3 shadow-[3px_3px_0_var(--shadow-ink)] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex min-w-0 items-center gap-3">
        <CategoryIcon icon={expense.category.icon} color={expense.category.color} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {expense.description || expense.category.name}
          </p>
          <p className="truncate text-xs text-ink-secondary">
            {expense.category.name} · {formatDate(expense.date)} · {expense.profile.name}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className="font-display text-sm font-semibold text-ink"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatCurrency(expense.amount.toString())}
        </span>
        <Link
          href={`/expenses/${expense.id}/edit`}
          className="text-xs font-bold text-accent transition-colors duration-150 hover:underline"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
