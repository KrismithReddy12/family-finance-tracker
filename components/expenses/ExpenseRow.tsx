import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

type ExpenseRowData = {
  id: string;
  amount: { toString(): string };
  date: Date;
  description: string | null;
  category: { name: string; color: string };
  profile: { name: string };
};

export function ExpenseRow({ expense }: { expense: ExpenseRowData }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-surface-page">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: expense.category.color }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {expense.description || expense.category.name}
          </p>
          <p className="truncate text-xs text-ink-secondary">
            {expense.category.name} · {formatDate(expense.date)} · {expense.profile.name}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(expense.amount.toString())}
        </span>
        <Link
          href={`/expenses/${expense.id}/edit`}
          className="text-xs font-medium text-accent transition-colors duration-150 hover:underline"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
