import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

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
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold tracking-tight text-ink">Family Finance</span>
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
                className="text-sm text-ink-secondary transition-colors duration-150 hover:text-accent"
              >
                Switch profile
              </button>
            </form>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-ink-secondary transition-colors duration-150 hover:text-status-critical"
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
