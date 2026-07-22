# Session log: Vercel + Neon production deploy, Phase 6 complete (2026-07-21)

Every prior session's PWA work (manifest, icons, service worker, offline handling) was
code-complete but paused before deploy, since Phase 6 needed things the dev environment
didn't have: a Vercel account, a real Neon database, and a physical iPhone. This session
did all three, closing out the last open phase of the original 7-phase build plan.

## What was set up

1. **Repo prep.** Added `"postinstall": "prisma generate"` to `package.json` - Vercel
   doesn't auto-run this, and without it the deployed app would ship a stale/missing
   Prisma Client. Verified with `prisma generate`, `npm run lint`, `npm test` (39/39)
   before committing.
2. **GitHub.** User created a private repo
   (`github.com/KrismithReddy12/family-finance-tracker`, empty, no auto-generated files).
   Pushed the existing local history (`master`, 8 commits at the time) as `origin`.
3. **Neon.** User signed up (free tier, no card, "Continue with GitHub"), created a
   project named `financeman` (host `ep-quiet-mud-ave1512r`, us-east-1). Two connection
   strings matter: the **direct/unpooled** one and the **pooled** one (distinguished by
   `-pooler` in the hostname) - user initially pasted only the direct one, had to be asked
   for the pooled one too.
4. **Database wiring.** Ran `prisma migrate dev --name init` with `DATABASE_URL`
   overridden inline to Neon's direct connection string (local `.env` untouched, so local
   dev keeps using the local `prisma dev` daemon as before). This created
   `prisma/migrations/20260722000335_init/` - the first migration history this project has
   ever had, since local dev has only ever used `db push` (the local daemon doesn't
   support `migrate` commands - a P1017-shaped limitation noted back in earlier sessions).
   Committed and pushed the migration.
5. **Vercel.** User signed up (free Hobby tier, "Continue with GitHub"), installed the
   Vercel GitHub App scoped to just this one repo, imported the project. Before first
   deploy: added three env vars (`DATABASE_URL` = Neon direct, `APP_DATABASE_URL` = Neon
   pooled, `SESSION_SECRET` = freshly generated via
   `crypto.randomBytes(32).toString('base64')`, not reused from local `.env`) across all
   three environments (Production/Preview/Development - there's only one Neon DB, so no
   need for per-environment isolation on a personal single-family app). Also overrode the
   **Build Command** to `prisma migrate deploy && next build` - deliberately a Vercel
   setting, not a `package.json` change, since baking `migrate deploy` into the shared
   `build` script would break local `npm run build` (which still targets the
   migrate-incompatible local daemon).
6. Deploy succeeded on the first attempt. Live at
   `family-finance-tracker-chi.vercel.app`.

## Verification (not just "build succeeded")

Per this project's own verification-approach standard, didn't stop at a green build -
drove a real write against the live app:

- POSTed a real onboarding submission via curl against the production URL (throwaway
  family, email `e2e-verify-*@example.local`). First attempt failed validation
  (`INVALID_INPUT`) - two curl-specific mistakes, both consistent with gotchas already
  documented from local testing: `avatarColor` has to be one of the
  `var(--series-N)` enum values from `lib/avatarOptions.ts` (not an arbitrary hex, which
  is what a first guess reached for), and `avatarEmoji` needed manual percent-encoding
  (`-d "avatarEmoji=%F0%9F%99%82"`) since `--data-urlencode` still mangles multibyte UTF-8
  on this Windows/git-bash setup, same as the emoji-over-curl issue from Phase 3.
- Second attempt succeeded: `303` redirect to `/dashboard`, a correctly-signed session
  cookie (confirms the production `SESSION_SECRET` round-trips through `jose` correctly),
  and the underlying DB transaction (family + 10 default categories + profile) committed.
- Followed the session cookie to confirm `/dashboard`, `/categories`, `/budgets`,
  `/insights`, `/settings` all returned real `200`s - genuine reads through the pooled
  Neon connection, not just static shells.
- Cleaned up: connected directly to Neon via a raw `pg` client (using the direct
  connection string) and deleted the throwaway family by email, which cascade-deleted its
  profile and categories per the schema's `onDelete: Cascade` - production data left
  clean, no leftover test rows.

## iPhone verification (user-driven, reported back)

User installed the live app via Safari's "Add to Home Screen," created their real family
account (not a throwaway), and confirmed directly on-device:
- Home screen icon renders as the intended violet square with white "F" monogram.
- Standalone launch has no Safari chrome (address bar, tabs, toolbar) - reads as a native
  app.
- With Airplane Mode on, the dashboard and expense list still render from the service
  worker's cache.
- Attempting to add an expense while offline shows a clean "you're offline" message and
  preserves the typed input, rather than failing silently or losing data.

This is the first time any of the PWA behavior has been confirmed on real hardware -
every prior session's "verification" for this piece was necessarily code-level (`next
build`/`next start`, reading the compiled service worker) since no iPhone or HTTPS deploy
was available until now.

## Open item

Both Neon connection strings (direct and pooled - same underlying database password) were
pasted into the chat session during setup. Recommended rotating the password (Neon
dashboard -> Settings -> Reset password) and updating the two Vercel env vars afterward.
**User deferred this** ("I'll do the password thing later") - not yet done as of this
session, flagged for follow-up.

## What shipped

| File | Change |
|---|---|
| `package.json` | Added `"postinstall": "prisma generate"` |
| `prisma/migrations/20260722000335_init/` | New - first migration history, generated against Neon |

Plus, outside of source control: GitHub repo created and pushed, Neon project created and
migrated, Vercel project created/configured/deployed (env vars + Build Command override
live only in Vercel's dashboard, not in the repo).

## Memory / doc updates

- New `production-deployment` memory created (deployment topology, env var mapping,
  build-command rationale, the pending password-rotation item).
- `MEMORY.md` index updated with a pointer to it.
- `log files/implementation-plan.md`'s Phase 6 status flipped from paused to complete,
  and the phase checklist line updated to ✅.
