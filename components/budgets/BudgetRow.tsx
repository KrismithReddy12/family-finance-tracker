import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { budgetStatusColor } from "@/lib/budgetStatus";

type BudgetRowData = {
  category: { id: string; name: string; icon: string; color: string };
  spent: string;
  budget: { id: string; amount: string } | null;
  periodStart: string;
  amountOverride?: string;
};

export function BudgetRow({ category, spent, budget, periodStart, amountOverride }: BudgetRowData) {
  const pct = budget ? (Number(spent) / Number(budget.amount)) * 100 : null;

  return (
    <div className="space-y-3 border-b border-hairline px-4 py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CategoryIcon icon={category.icon} color={category.color} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{category.name}</p>
            <p className="text-xs text-ink-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(spent)} spent{budget ? ` of ${formatCurrency(budget.amount)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <form action="/api/budgets" method="POST" className="flex items-center gap-2">
            <input type="hidden" name="categoryId" value={category.id} />
            <input type="hidden" name="periodStart" value={periodStart} />
            <Input
              name="amount"
              inputMode="decimal"
              pattern="^\d{1,9}(\.\d{1,2})?$"
              placeholder="0.00"
              defaultValue={amountOverride ?? budget?.amount}
              className="w-24 py-1.5 text-sm"
              aria-label={`Budget for ${category.name}`}
              required
            />
            <Button type="submit" variant="secondary" className="px-3 py-1.5 text-xs">
              Save
            </Button>
          </form>
          {budget && (
            <form action={`/api/budgets/${budget.id}/delete`} method="POST">
              <Button
                type="submit"
                variant="ghost"
                className="px-2 py-1.5 text-xs text-ink-muted hover:text-status-critical"
              >
                Clear
              </Button>
            </form>
          )}
        </div>
      </div>

      {pct !== null ? (
        <div className="space-y-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-page">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: budgetStatusColor(pct) }}
            />
          </div>
          <p className="text-xs font-medium" style={{ color: budgetStatusColor(pct) }}>
            {pct.toFixed(0)}% of budget{pct >= 100 ? " · over budget" : ""}
          </p>
        </div>
      ) : (
        <p className="text-xs text-ink-muted">No budget set for this month.</p>
      )}
    </div>
  );
}
