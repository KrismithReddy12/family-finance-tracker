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
        className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full text-3xl text-accent-ink shadow-sm transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {profile.avatarEmoji}
        </span>
        <span className="text-sm font-medium text-ink">{profile.name}</span>
      </button>
    </form>
  );
}
