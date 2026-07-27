import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { BottomTabBar } from "@/components/nav/BottomTabBar";

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
      <main className="mx-auto max-w-lg px-4 pt-6 pb-24">{children}</main>
      <BottomTabBar />
    </div>
  );
}
