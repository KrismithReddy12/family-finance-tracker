"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ExpensesIcon, BudgetsIcon, InsightsIcon, MoreIcon } from "@/components/icons/NavIcons";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/expenses", label: "Expenses", Icon: ExpensesIcon },
  { href: "/budgets", label: "Budgets", Icon: BudgetsIcon },
  { href: "/insights", label: "Insights", Icon: InsightsIcon },
  { href: "/settings", label: "More", Icon: MoreIcon },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors duration-150 ${
                active ? "text-accent" : "text-ink-muted"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
