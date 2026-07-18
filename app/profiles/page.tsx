import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { ProfileTile } from "@/components/profiles/ProfileTile";
import { AddProfileTile } from "@/components/profiles/AddProfileTile";
import { FormError } from "@/components/ui/FormError";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PROFILE: "Please enter a name for the new profile.",
};

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();
  const profiles = session
    ? await db.profile.findMany({
        where: { familyId: session.familyId },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-4 py-12">
      <div className="animate-fade-in w-full max-w-2xl text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Who&apos;s logging expenses? 👀</h1>
        <p className="mt-1 text-sm text-ink-secondary">Pick a profile to continue.</p>

        {error && (
          <div className="mx-auto mt-4 max-w-sm">
            <FormError>{ERROR_MESSAGES[error] ?? "Something went wrong."}</FormError>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-4">
          {profiles.map((profile) => (
            <ProfileTile key={profile.id} profile={profile} />
          ))}
          <AddProfileTile />
        </div>
      </div>
    </main>
  );
}
