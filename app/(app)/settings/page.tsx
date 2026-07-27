import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { Card } from "@/components/ui/Card";
import { Group } from "@/components/ui/Group";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_FAMILY_NAME: "Please enter a family name.",
  INVALID_PASSWORD: "Please check your password details and try again.",
  WRONG_PASSWORD: "Current password is incorrect.",
  LAST_PROFILE: "You can't delete the only profile in the family.",
  PROFILE_HAS_EXPENSES: "This profile has logged expenses and can't be deleted.",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  FAMILY_NAME_UPDATED: "Family name updated.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; familyName?: string }>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session || !session.activeProfileId) redirect("/login");

  const [family, profiles, expenseCounts] = await Promise.all([
    db.family.findUnique({ where: { id: session.familyId } }),
    db.profile.findMany({ where: { familyId: session.familyId }, orderBy: { createdAt: "asc" } }),
    db.expense.groupBy({ by: ["profileId"], where: { familyId: session.familyId }, _count: { _all: true } }),
  ]);
  if (!family) redirect("/login");

  const activeProfile = profiles.find((p) => p.id === session.activeProfileId);
  const expenseCountByProfile = new Map(expenseCounts.map((row) => [row.profileId, row._count._all]));
  const profileError = query.error === "LAST_PROFILE" || query.error === "PROFILE_HAS_EXPENSES" ? query.error : undefined;
  const passwordError = query.error === "INVALID_PASSWORD" || query.error === "WRONG_PASSWORD" ? query.error : undefined;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="font-display text-xl font-bold text-ink">Settings</h1>

      {query.success && (
        <div className="rounded-2xl bg-status-good/10 px-4 py-3 text-sm font-medium text-status-good">
          {SUCCESS_MESSAGES[query.success] ?? "Done."}
        </div>
      )}

      {activeProfile && (
        <Group>
          <div className="flex items-center gap-3 px-4 py-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: activeProfile.avatarColor }}
            >
              {activeProfile.avatarEmoji}
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{activeProfile.name}</p>
              <p className="text-xs text-ink-muted">{family.name}</p>
            </div>
          </div>
        </Group>
      )}

      <Group>
        <Link
          href="/categories"
          className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink"
        >
          Manage categories
          <span className="text-ink-muted">›</span>
        </Link>
        <form action="/api/auth/leave-profile" method="POST">
          <button
            type="submit"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-ink"
          >
            Switch profile
            <span className="text-ink-muted">›</span>
          </button>
        </form>
      </Group>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Family name</h2>
        <form action="/api/settings/family" method="POST" className="space-y-3">
          {query.error === "INVALID_FAMILY_NAME" && <FormError>{ERROR_MESSAGES.INVALID_FAMILY_NAME}</FormError>}
          <div>
            <Label htmlFor="familyName">Name</Label>
            <Input
              id="familyName"
              name="familyName"
              defaultValue={query.familyName ?? family.name}
              maxLength={80}
              required
            />
          </div>
          <Button type="submit">Save name</Button>
        </form>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Change password</h2>
        <p className="text-xs text-ink-secondary">Shared by everyone in the family. Changing it signs everyone out.</p>
        <form action="/api/settings/password" method="POST" className="space-y-3">
          {passwordError && <FormError>{ERROR_MESSAGES[passwordError]}</FormError>}
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
          </div>
          <Button type="submit">Change password</Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="font-display px-1 text-sm font-semibold text-ink">Profiles</h2>
        {profileError && <FormError>{ERROR_MESSAGES[profileError]}</FormError>}
        <Group>
          {profiles.map((profile) => {
            const expenseCount = expenseCountByProfile.get(profile.id) ?? 0;
            return (
              <div key={profile.id} className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: profile.avatarColor }}
                  >
                    {profile.avatarEmoji}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{profile.name}</p>
                    <p className="text-xs text-ink-secondary">
                      {expenseCount} expense{expenseCount === 1 ? "" : "s"} logged
                    </p>
                  </div>
                </div>
                <form action={`/api/settings/profiles/${profile.id}/delete`} method="POST">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="px-3 py-1.5 text-xs text-status-critical hover:bg-status-critical/10"
                  >
                    Delete
                  </Button>
                </form>
              </div>
            );
          })}
        </Group>
      </div>

      <Group>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="w-full px-4 py-3 text-left text-sm font-semibold text-status-critical">
            Log out
          </button>
        </form>
      </Group>
    </div>
  );
}
