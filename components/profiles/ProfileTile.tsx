export function ProfileTile({
  profile,
}: {
  profile: { id: string; name: string; avatarEmoji: string; avatarColor: string };
}) {
  return (
    <form action="/api/auth/switch-profile" method="POST">
      <input type="hidden" name="profileId" value={profile.id} />
      <button
        type="submit"
        className="group flex flex-col items-center gap-3 rounded-3xl p-4 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-surface text-3xl text-accent-ink shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-3"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {profile.avatarEmoji}
        </span>
        <span className="font-display text-sm font-semibold text-ink">{profile.name}</span>
      </button>
    </form>
  );
}
