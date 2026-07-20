import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/categories", label: "Categories" },
  { href: "/budgets", label: "Budgets" },
  { href: "/insights", label: "Insights" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    redirect("/login");
  }

  const profile = await db.profile.findUnique({ where: { id: session.activeProfileId } });
  if (!profile) {
    redirect("/profiles");
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b-[3px] border-hairline bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display flex items-center gap-1.5 text-base font-semibold tracking-tight text-ink">
              <span aria-hidden>🐷</span>
              Family Finance
            </span>
            <nav className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:bg-accent/10 hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-base text-accent-ink"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {profile.avatarEmoji}
              </span>
              <span className="text-sm font-medium text-ink">{profile.name}</span>
            </div>
            <form action="/api/auth/leave-profile" method="POST">
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:bg-accent/10 hover:text-accent"
              >
                Switch profile
              </button>
            </form>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:bg-status-critical/10 hover:text-status-critical"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
