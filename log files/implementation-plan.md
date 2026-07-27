# Family Expense Tracker - Implementation Plan

## Progress So Far (updated 2026-07-27, end of session)

**All 7 original phases complete and live in production (see Phase 6 status below). Since then: a bug-fix pass (2026-07-21, first live browser check) and a third UI redesign pass (2026-07-27) that replaced the "Gummy 3D" shape language with a flat "Robinhood-style" mobile shell - bottom tab navigation, flat grouped lists, a hero dashboard stat - on the same Royal Velvet palette. Full narrative in `log files/2026-07-27-robinhood-redesign.md`; current design rules live in the `ui-design-direction` memory (re-synced to `log files/ui_design_direction.md`).**

**Second design pass (post-Phase-7):** with the app feature-complete, the user decided they didn't like the original cream + coral-rose look after all and pointed at a different project (`caffeine-countdown`) as a reference. Three rounds of comparison-mockup artifacts (never guessed blind on the live app) converged on a full palette swap: the app is now a single dark-purple theme, "Royal Velvet" (`#160f22` page / `#211730` card / `#8b5cf6` accent), not a light/dark pair - the user explicitly chose dark-purple-only over building a matching light companion. Full rationale, exact tokens, and the reasoning behind splitting the border color from the shadow color (a dark-on-dark shadow doesn't read as depth the way the old light-mode one did) are in the `ui-design-direction` memory - this file's copy in `log files/` was re-synced from it, so that's the source of truth going forward, not the summary here.

All work is committed to git (local repo at the project root, not yet pushed anywhere - no remote configured). Local dev environment:
- Postgres runs via `npx prisma dev` (a local dev daemon, NOT a normal Postgres install) - if it's not running, `cd` into the project and run `npx prisma dev -d --name financeman` to start it in the background before `npm run dev`. Careful: running any other `npx prisma dev` subcommand (e.g. a mistyped `status`) while one is already running can spin up a *second*, unnamed daemon on fresh ports instead of attaching to the existing one - check `netstat` for stray `prisma dev` processes if something seems off, and kill the extra one rather than leaving two Postgres instances running.
- `.env` has two DB URLs: `DATABASE_URL` (Prisma's `prisma+postgres://` proxy protocol, used by the Prisma CLI for `db push`/`generate`) and `APP_DATABASE_URL` (raw `postgres://` TCP URL, used by the app's Prisma Client via `@prisma/adapter-pg` - Prisma 7 requires an explicit driver adapter, plain `new PrismaClient()` no longer works). Don't merge these into one URL, they're for different consumers.
- `prisma migrate dev` does NOT work against the local `prisma dev` daemon (fails with P1017, looks like a shadow-DB limitation of that lightweight local server) - use `prisma db push --accept-data-loss` for local schema syncs instead. This should be revisited once a real Neon database is wired up for production (Phase 6/deploy) - try `migrate dev` there to get proper migration history files, since none exist yet.
- Dev server: `npm run dev`, runs Turbopack on port 3000.
- The local dev DB currently has a couple of test families in it from curl-based end-to-end verification (Phases 2 and 3) - harmless, but if a truly clean slate is ever needed, `prisma db push --force-reset` wipes it.

**Deviations from the original plan below**, made deliberately during implementation:
- **Auth mutations (`app/api/auth/*`), expense CRUD (`app/api/expenses/*`), and category/budget CRUD (`app/api/categories/*`, `app/api/budgets/*`) are REST route handlers, not server actions**, despite the plan originally preferring server actions. Reason: no browser tool is available in this environment, so route handlers let every flow be verified end-to-end with `curl` (cookies, redirects, validation) instead of fighting Next's server-action request encoding. Forms are plain `<form method="POST" action="/api/...">` - fully progressive-enhancement friendly, no client JS required anywhere yet. Keep this pattern for future phases for consistency and testability.
- **`middleware.ts` is `proxy.ts`** - Next.js 16 renamed the file convention (function is now `export function proxy(...)` not `middleware`). If a future Next upgrade changes this again, check the deprecation warning in dev server output.
- **Family login identifier is `email`** (added as a unique field beyond the original plan's bare `name`), since a login needs a unique lookup key.
- Prisma client generation output was moved from the plan's default to `generated/prisma` (project root, not inside `app/`) to avoid mixing generated code into the App Router's routing directory.
- **Categories are archived, never hard-deleted** (matches the original data-model decision) - the `/categories` page shows active categories plus a separate "Archived" section with an Unarchive action, rather than making archiving a one-way trip. Budgets tied to an archived category still surface on `/budgets` (not silently hidden) so a family can still see/clear a dangling budget after archiving its category.
- Curl testing this environment on Windows: emoji values (e.g. `avatarEmoji`, category `icon`) get mangled to `??` if passed as raw shell arguments through `--data-urlencode` - the shell/curl pipeline doesn't preserve UTF-8 bytes reliably. Workaround: pass the already-percent-encoded UTF-8 bytes directly via plain `-d "field=%F0%9F%90%BE"` instead of relying on curl to encode a literal emoji character. Worth remembering for Phase 5 testing too if any forms take emoji input.
- **The dashboard's "budget-vs-actual" piece is a compact meter list (`components/dashboard/BudgetMeterRow.tsx`), not a Recharts chart.** The dataviz skill's own form-selection guidance calls a single-ratio-against-a-limit "a Meter, not a chart" - and the app already had this exact visual language from the `/budgets` page (Phase 3), so the dashboard reuses the same status-color-on-neutral-track treatment (factored into `lib/budgetStatus.ts` so both call sites share one threshold definition) rather than inventing a second, inconsistent chart form for the same job.
- **"Budget remaining" only nets out spend inside budgeted categories, not the family's total spend.** First implementation computed it as `totalBudgeted - totalSpentEverywhere`, which produces a confusing negative number when a family has unbudgeted-but-heavy spend in one category and a small, perfectly-on-track budget in another (caught by hand-verifying a seeded test scenario before shipping, not by inspection). Fixed to `totalBudgeted - spendWithinBudgetedCategories`, matching envelope-budgeting semantics and how `/budgets` already frames it.
- Added `vitest` as a dev dependency (`npm test`) specifically for `lib/charts/aggregations.ts`, per this file's own Verification Approach section calling that module out as needing targeted unit tests - it's the one piece of Phase 4 that can't be visually confirmed via curl (Recharts' `ResponsiveContainer` needs a real browser to measure and paint; curl only sees the pre-hydration shell). 13 tests cover category totals/sorting, month-bucketing including a year-boundary case, budget pairing/sorting, and the percent-change edge cases (zero baseline, null baseline).
- `vitest` needed its own path-alias config (`vitest.config.ts`, mapping `@` to the project root) - it doesn't read `tsconfig.json`'s `paths` automatically the way Next's bundler does. Without it, any test file importing via `@/...` fails to resolve even though `tsc` and the dev server are both fine with it.
- **Insights engine has more modules than the plan's file list names** (`lib/insights/{engine,topCategories,momTrend,budgetOverage,suggestions}.ts`) - it also needed `outliers.ts` and `staleCategories.ts` to cover the two heuristics described in prose (single-expense outlier flag, no-spend/stale category note) but not listed among the named files. All heuristic modules return the same `Insight` type (`lib/insights/types.ts`) so `engine.ts` can compose and sort them uniformly; each `Insight.detail` states the exact numbers behind the claim (no severity or copy is ever asserted without the arithmetic alongside it).
- **PWA icons are generated by code (`app/icons/{192,512,maskable}/route.tsx`, `app/apple-icon.tsx`), not static PNG files in `public/icons/` as the plan originally sketched.** Next's `ImageResponse` (from `next/og`, already a Next dependency - no new packages needed) draws each icon as JSX/CSS at build time, so there was no need to hand-produce or rasterize image assets. A simple flat accent-colored square with a white "F" monogram (accent color updated to `#8b5cf6` in the second design pass) - deliberately not an emoji, since Satori (the renderer behind `ImageResponse`) resolves emoji glyphs via an external CDN fetch at generation time, which is an unnecessary reliability risk for something this simple. Custom route handlers default to dynamic (server-rendered per request) as of Next 15 - each icon route needs `export const dynamic = "force-static"` or it silently stops being prerendered at build time; caught by reading `next build`'s route-type output (`ƒ` vs `○`), not by anything failing. Note these icon/manifest/viewport-themeColor files hardcode hex directly (`ImageResponse` can't resolve CSS custom properties) - a future palette change needs to touch these by hand too, `globals.css` alone won't reach them.
- **The offline-mutation story is a global `submit`-event guard (`components/pwa/OfflineFormGuard.tsx`), not per-form logic.** Every mutation in this app is a plain `<form method="POST">` full-page submission (see the route-handler deviation above), so a single capture-phase listener on `document` that checks `navigator.onLine` before any POST is allowed to proceed covers every form in the app - including ones added in future phases - without touching each form component. Blocking the submit (rather than letting a real network POST fail while offline) is what "preserves form input": `preventDefault()` simply leaves the DOM, and therefore every typed value, untouched.
- **`OfflineBanner` uses `useSyncExternalStore`, not `useState` + `useEffect`.** First pass called `setIsOffline(!navigator.onLine)` synchronously inside a `useEffect` to pick up the real value after mount (since `navigator` doesn't exist during SSR) - caught immediately by an ESLint rule (`react-hooks/set-state-in-effect`) flagging exactly this as an anti-pattern. `useSyncExternalStore` is the React-idiomatic hook for subscribing to external mutable browser state and handles the SSR/hydration boundary itself via its `getServerSnapshot` argument, so it was a straight swap, not a workaround.
- **`error.tsx` boundaries use `unstable_retry`, not the older `reset` prop.** Next 16.2.0 added `unstable_retry` and the docs now say to prefer it in most cases - a version-specific detail worth flagging since `reset` is what most existing knowledge of Next's error-boundary API would reach for by default.
- **Password-change errors never go through `redirectWithFields`** (the helper every other form's error path reuses to preserve entered values via the query string) - password values must never round-trip through a URL, since that's server-log and browser-history exposure. The route redirects with just an error code; the form always renders empty on error, by design, not oversight.
- Deleting a profile is blocked by two independent rules, not just the one the plan named: **has logged expenses** (the plan's rule) and **is the family's only remaining profile** (added defensively - a family with zero profiles would be locked out of `/dashboard` entirely with no way back in through the UI). Both were verified with real scenarios: a freshly-added zero-expense profile deletes cleanly, a profile with real expense history is blocked, and a single-profile family can't delete its last one.
- Added `app/(app)/not-found.tsx` alongside the root `app/not-found.tsx` - without it, `notFound()` calls from inside authenticated pages (an edit page for an expense/category that doesn't belong to the family) would bubble past the `(app)` route group and render the bare public 404, dropping the nav shell. The segment-scoped version renders inside `(app)/layout.tsx` instead, so a user hitting a bad ID stays inside the app chrome and can navigate back out through the nav bar.

**UI design went through several iterations** based on live user feedback - see the `ui-design-direction` memory (auto-loaded in future sessions) for the full rationale and concrete color/font tokens, current as of the second design pass. Short version: "Gummy 3D" cartoon style (chunky pressable buttons, thick-bordered sticker cards, hard offset shadows) rendered as a single dark-purple theme, "Royal Velvet" (`#160f22` page, `#211730` cards, `#8b5cf6` accent, Fredoka+Nunito fonts) - no light mode. The original cream + coral-rose (`#ff4d6d`) version of this same system is gone from the codebase; this note exists purely so nobody re-derives the old palette from an out-of-date memory of "what the app looks like." Match the current tokens (`components/ui/*`) rather than introducing new patterns - the primitives (Button, Card, Input/Select/Textarea, FormError, CategoryIcon) already exist and should be reused.

**What exists right now, concretely:**
- Full auth loop: onboarding (family + first profile + 10 seeded default categories), login, Netflix-style profile picker, add-profile, switch-profile, leave-profile, logout. Route protection via `proxy.ts`.
- Full expense CRUD: add/list/edit/delete, category+profile filters on the list page, validation preserves entered values on error, cross-family data isolation verified.
- Full category management (`/categories`, `/categories/new`, `/categories/[id]/edit`): add, rename, change icon/color (20-icon x 8-color picker reusing the AvatarPicker radio pattern), archive/unarchive. Archived categories stay excluded from expense-entry pickers but still render correctly on their historical expenses.
- Full budget management (`/budgets`): month picker (prev/next nav + direct `?month=YYYY-MM`), one row per active category showing spend-vs-budget with a gummy progress bar (green under 90%, amber 90-100%, red over 100%, capped visual width at 100% with an "over budget" note), inline save-per-row and a clear/delete action. Verified budgets don't collide across months and that spend is computed correctly from real expense data.
- Full dashboard (`/dashboard`): month picker (prev/next nav, same pattern as `/budgets`) + profile filter, all charts/stats/list re-rendering against the same slice; 3 stat tiles (spend this period, budget remaining within budgeted categories, % vs last month with correct-colored direction); a horizontal category-breakdown bar chart and a 6-month trailing trend line chart (both Recharts, styled per the dataviz skill - fixed categorical/status colors, thin marks, rounded bar ends, custom tooltips matching the gummy chrome, direct end-label on the trend line); a budget-vs-actual meter list (only shown when budgets exist for the period); the existing recent-expenses list, now scoped by the same month/profile filters instead of always showing the latest 5 regardless of filter. `lib/charts/aggregations.ts` holds all the pure data-shaping (category totals, month bucketing, budget pairing, percent-change) with a `vitest` suite (see deviations above).
- Full insights engine (`/insights`): month-scoped feed of insight cards from `lib/insights/engine.ts`, sorted critical → warning → info → positive. Seven heuristics, each pure and DB-free: top spending category (with runner-ups), month-over-month category moves >20% (up = warning, down = positive), per-category and family-wide budget overage (>=90% warning, >=100% critical, scoped to only budgeted categories like the dashboard's "budget remaining"), savings suggestions (a top-3 category also trending up >20%), single-expense outliers (>2x a category's trailing average, requires >=3 historical expenses in that category before flagging anything), and stale-budget notes (budgeted category, zero spend logged). No LLM calls anywhere - every card's detail text states the exact numbers behind it.
- PWA plumbing, code-complete and build-verified but **not yet deployed or tested on a device** (see below): `app/manifest.ts` (name, `display: "standalone"`, `start_url: "/dashboard"`, 192/512/maskable icons), code-generated icons including the iOS home-screen one, `public/sw.js` (stale-while-revalidate for same-origin GETs, mutations pass straight through untouched), a persistent `navigator.onLine`-driven offline banner, and a global guard that blocks any POST submission while offline so typed input is never lost to a failed network request. Confirmed via a real `next build` + `next start` (not just `next dev`, since the service worker only registers in production) that the manifest, all three icon routes (now statically prerendered), the apple-touch-icon, and `sw.js` all serve correctly, and that the registration code is actually present in the compiled client bundle.
- Full `/settings` page: rename family (validated, error preserves the entered value), change the shared password (verifies the current password, forces everyone back to `/login` on success by clearing the session), and profile management (delete a profile, blocked if it has expense history or would leave the family with zero profiles). A small gear-icon link in the app header (next to "Switch profile"/"Log out") is the only entry point - not in the main nav row, matching how `/settings` was scoped in the original plan (its own page, not a primary nav destination).
- App-wide error handling: `error.tsx` at both the root and inside the `(app)` route group (client components, gummy-styled, "Try again" wired to Next 16.2's `unstable_retry`), plus matching `not-found.tsx` pairs so a 404 inside the authenticated shell keeps the nav bar instead of dropping to a bare page. Every page's empty-data state (no expenses/categories/budgets/insights for the selected period) was already built incrementally during Phases 2-5 and spot-checked again this phase - no gaps found.

**Bug found and fixed during Phase 3 verification:** the initial `/api/budgets` route handler built its redirect URL as `` `/budgets?month=${month}` `` and then passed that whole string as the `pathname` argument to the existing `redirectWithFields` helper - which itself appends `` `?${params}` ``, producing a malformed double-`?` URL (`/budgets?month=2026-07?error=...`) on any validation failure. Fixed by passing the bare `/budgets` path and folding `month` into the fields object instead (so it becomes one of the querystring params `redirectWithFields` already builds correctly). Caught by driving the actual invalid-input path end-to-end with curl rather than only checking the happy path - a good example of why every phase's verification approach (below) insists on exercising real request/response flows, not just skimming the code.

**Design issue found and fixed during Phase 4 verification:** see the "Budget remaining" deviation note above - caught the same way, by seeding a real multi-category scenario and hand-verifying the number before trusting it, not by reading the code.

**Phase 5 verification, done exactly as the plan prescribed:** 26 `vitest` unit tests hitting every threshold boundary (MoM at exactly 20% vs 20.01%, budget overage at exactly 90%/100%, outlier at exactly 2x vs 2.01x, top-3-only suggestion cutoff), plus a hand-verified end-to-end pass against real seeded data through the running app (not just the unit tests) - built up a multi-month, multi-category, multi-budget scenario via `curl`, hand-computed the expected percentages for every heuristic in play (budget overage 250%, family-wide 170%, MoM 275%, outlier average $90.00, top-category share 96%), and confirmed the `/insights` page matched every number and the severity ordering exactly. No discrepancies found this phase - the extensive unit-test boundary coverage plus the earlier phases' `MoneyLike`/percent-change groundwork in `lib/charts/aggregations.ts` paid off here.

**Phase 6 status - complete (2026-07-21).** Deployed to production: GitHub repo (`github.com/KrismithReddy12/family-finance-tracker`, private) connected to Vercel (`family-finance-tracker-chi.vercel.app`), database is Neon Postgres (project `financeman`). Setup notes:
- `package.json` got a `"postinstall": "prisma generate"` script (Vercel doesn't auto-run this) and Vercel's Build Command was overridden to `prisma migrate deploy && next build` - deliberately kept out of the shared `build` script since local dev's `.env` still points at the local `prisma dev` daemon, which doesn't support `migrate` commands.
- First-ever migration history (`prisma/migrations/20260722000335_init/`) was generated by running `prisma migrate dev --name init` against Neon directly - local dev had only ever used `db push` before this.
- Three env vars in Vercel (all environments): `DATABASE_URL` (Neon direct connection, for migrations), `APP_DATABASE_URL` (Neon pooled connection, for the running app), `SESSION_SECRET` (freshly generated, not reused from local `.env`).
- Verified with a real onboarding POST against the live URL (not just checking the build succeeded) - confirmed the DB write/read round trip and the signed session cookie worked, then cleaned up the throwaway test family directly via Neon's direct connection.
- Verified on a real iPhone by the user directly: home screen icon renders correctly, standalone launch has no Safari chrome, offline caching keeps the dashboard/list viewable, and adding an expense while offline shows a clean error with input preserved rather than failing silently.
- Open item: the Neon database password should be rotated (it was pasted into a chat session during setup) - user deferred this, revisit in a future session.

Full narrative in `log files/2026-07-21-vercel-neon-deploy.md`.

**Phase 7 verification:** every settings flow driven end-to-end with `curl` against real data, including the sequences that only show up under real use rather than a first pass - changed the shared password, confirmed the old password now fails and the new one works, confirmed the session was force-cleared in between; added a throwaway zero-expense profile specifically so the "successful delete" path had something to test (the two seeded test families only had profiles with real expense history by this point); confirmed both delete-blocking rules (has expenses, is the last profile) and cross-family isolation on the new `/api/settings/*` routes; confirmed the segment-scoped 404 keeps the app-shell nav while the root 404 doesn't. A production build (`next build`) was re-run after these changes and stayed clean.

**Immediate next step:** verify the 2026-07-27 Robinhood-style redesign on a real iPhone (Add to Home Screen) - specifically that the input font-size fix actually stops the auto-zoom-on-focus bug the user reported, since that's real-Safari-only behavior no desktop tool can reproduce (see `log files/2026-07-27-robinhood-redesign.md`). Also still open: rotating the Neon database password (see Phase 6 status above), deferred by the user to a future session.

## Context

The user wants a finance app for tracking family expenses, usable by multiple family members. Each member needs their own profile to log purchases (amount, category, details), and the app needs a dashboard with visualizations plus an insights feature that highlights where money is going and how to cut costs. The user also wants it installable on their iOS device.

This is a **greenfield project** - the working directory is empty, no existing code or git repo. Decisions confirmed with the user:
- **Platform**: Web app + installable PWA (installs to iOS home screen via Safari's "Add to Home Screen" - no Apple Developer account, no App Store, works today).
- **Hosting**: Cloud-hosted, accessible from any device without a home server running.
- **Auth model**: One shared family login, then Netflix-style profile switching (profiles are not individually password-protected - they're "who is logging this" labels within an authenticated family session).
- **AI insights**: Rule-based/statistical analytics, not an LLM API call - deterministic, auditable heuristics (top categories, month-over-month trend %, budget overage, savings suggestions), no ongoing API cost, no external dependency.

Scope is deliberately kept to a single-family personal tool - no billing, no multi-tenant admin surface, no per-profile credentials.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | One codebase for UI + backend (server actions/route handlers), strong typing end-to-end, no separate backend service needed at this scale. |
| Database | PostgreSQL via Neon | Plain relational DB with serverless pooling and branching; avoids pulling in a competing auth/storage platform (e.g. Supabase) that would conflict with our custom family/profile auth. |
| ORM | Prisma | Type-safe schema-as-code, solid migration tooling. |
| Styling | Tailwind CSS | Utility-first, fast to keep visually consistent across many small views. |
| Charts | Recharts | Declarative React charts, sufficient for personal-scale data volumes. Actual chart styling/colors will follow the project's dataviz skill at build time. |
| Auth/session | Custom session (iron-session or JWT via `jose`) + bcrypt | NextAuth is built for per-user identity providers; our model (one shared family credential + unauthenticated profile switching) fights that abstraction. A small explicit session (`{ familyId, activeProfileId, exp }` in a signed httpOnly cookie) is simpler and has less long-term dependency risk. |
| PWA | Native App Router (`app/manifest.ts`) + hand-written minimal service worker | Avoids `next-pwa`/Workbox black-box config; full control over a deliberately small caching strategy. |
| Hosting | Vercel | Zero-config Next.js deploys, automatic HTTPS (required for PWA/service workers), preview deploys per phase. |
| Validation | Zod | Shared client/server validation for forms (expenses, budgets, categories). |
| Dates | date-fns | Lightweight, used for month grouping and trend math. |

No Redux/Zustand - server components + server actions handle most data flow.

## Data Model (Prisma)

- **Family**: `id, name, passwordHash, createdAt` - has many Profile, Category, Expense, Budget.
- **Profile**: `id, familyId, name, avatarColor/emoji, createdAt` - no password; purely a label scoped by session.
- **Category**: `id, familyId, name, icon, color, isDefault, archivedAt` - soft-delete only (archived, never hard-deleted) so historical expenses keep valid references. Default set (Groceries, Dining Out, Transport, Utilities, Entertainment, Housing, Healthcare, Shopping, Subscriptions, Other) seeded per new family via `prisma/seed.ts`.
- **Expense**: `id, familyId, profileId, categoryId, amount (Decimal, never Float), currency (default "USD"), date, description, notes, paymentMethod (nullable enum), createdAt, updatedAt`.
- **Budget**: `id, familyId, categoryId, periodStart (month), amount (Decimal)` - unique on `(familyId, categoryId, periodStart)`.

Indexes: `Expense(familyId, date)`, `Expense(familyId, categoryId)`, `Budget(familyId, periodStart)`. Money always stored as `Decimal`/Postgres `numeric`, never float.

## Auth / Session Flow

1. `/login` - family identifier + shared password; bcrypt-verified; issues family-level session cookie.
2. `/profiles` - Netflix-style profile picker for the session's family; selecting one adds `activeProfileId` to the session and redirects to `/dashboard`.
3. `middleware.ts` protects `/dashboard`, `/expenses/*`, `/budgets`, `/categories`, `/insights`, `/settings` - redirects to `/profiles` if no active profile, `/login` if no family session.
4. "Switch Profile" control clears `activeProfileId` without re-entering the password.
5. `/onboarding` - one-time family + first profile creation (no open signup/multi-tenant flow beyond this).
6. `/settings` - rename family, change shared password, manage profiles (block deleting a profile with existing expenses).

## App Structure

```
app/
  manifest.ts, layout.tsx, globals.css
  (public)/login/page.tsx, (public)/onboarding/page.tsx
  (app)/layout.tsx                # protected shell: nav, profile badge, offline banner
  (app)/profiles/page.tsx
  (app)/dashboard/page.tsx
  (app)/expenses/page.tsx, expenses/new/page.tsx, expenses/[id]/edit/page.tsx
  (app)/budgets/page.tsx
  (app)/categories/page.tsx
  (app)/insights/page.tsx
  (app)/settings/page.tsx
lib/
  session.ts, auth.ts, db.ts
  validation/{expense,budget,category}.ts
  insights/{engine,topCategories,momTrend,budgetOverage,suggestions}.ts
  charts/aggregations.ts
actions/
  expenseActions.ts, budgetActions.ts, categoryActions.ts, profileActions.ts, familyActions.ts
components/
  charts/, expenses/, profiles/, insights/, ui/
prisma/
  schema.prisma, seed.ts, migrations/
public/
  icons/, sw.js
```

Server actions handle all mutations (create/update/delete expense, switch profile, etc.); route handlers reserved for things needing a real HTTP endpoint (future CSV export, service worker).

## Dashboard & Visualizations

- `/dashboard`: stat row (month total, budget remaining, delta vs last month), category breakdown chart, monthly trend (6-12mo trailing), budget-vs-actual chart, recent transactions list, month/profile filters.
- `/expenses`: filterable/sortable data list (no charts - this is the management view).
- `/budgets`: per-category editable monthly amount with inline spent-vs-budget progress bar.
- `/insights`: feed of insight cards (see below), not chart-heavy.

Chart data-shaping lives in `lib/charts/aggregations.ts` as pure functions, independently testable from Recharts rendering. Exact colors/tokens/chart-type nuances are decided at build time using the project's dataviz skill.

## Rule-Based Insights Engine

`lib/insights/engine.ts` orchestrates pure, testable heuristics (no DB access inside heuristic files, no LLM calls):

1. **Top spending categories** - rank by total spend for the period.
2. **Month-over-month % change per category** - flag >20% moves (up = warning framing, down = positive framing).
3. **Budget overage detection** - >90% of budget = warning, >100% = alert; plus a family-wide total check.
4. **Trend-based savings suggestions** - composes (1)+(2): a top-3 category trending up generates a concrete suggestion.
5. **Single-expense outlier flag** - expense >2x a category's trailing average, catches both real overspends and data-entry typos.
6. **No-spend/stale category note** - category has a budget but zero logged expenses this month (possible missed logging).

Every insight is arithmetic traceable back to real numbers - auditable, no black-box model output.

## PWA Setup

- `app/manifest.ts`: name, `display: "standalone"`, `start_url: "/dashboard"`, icon set (192/512/maskable) in `public/icons/`. Combined with Vercel's automatic HTTPS, this alone enables iOS "Add to Home Screen."
- **Offline strategy: installability + read-only cached viewing, no offline write queue.** iOS Safari doesn't support the Background Sync API, so an offline expense-entry queue would be unreliable specifically on the target platform - not worth the added complexity (IndexedDB outbox, conflict resolution, pending-sync UI). Instead: stale-while-revalidate caching for the app shell and dashboard/list GETs; mutations are network-only with a clear "you're offline, try again" error that preserves form input; a persistent offline banner driven by `navigator.onLine`.
- Hand-written `public/sw.js`, registered from a small client component, production-only.

## Build Phases

0. ✅ **Scaffold & pipeline** - done locally (see Progress log above). Vercel deploy not done yet - still developing locally per user's choice in Phase 0 planning; revisit before Phase 6 (PWA needs a real HTTPS deploy to test "Add to Home Screen").
1. ✅ **Schema, auth, profile switching** - done, via REST route handlers instead of server actions (see Progress log above for why).
2. ✅ **Expense CRUD** - done, same route-handler pattern.
2.5. ✅ **UI design system** - not in the original plan; went through two full palette passes after user feedback (light cream+coral-rose, then the current dark-purple "Royal Velvet" - see Progress log above and the `ui-design-direction` memory for both). The Gummy 3D *shape/motion* system (chunky borders, offset shadows, pressable buttons) has stayed constant across both; only the palette changed. Reuse the current tokens - don't redesign again without reason, but if the user does ask again, the two-round mockup-comparison approach documented in memory is what converged fastest both times.
3. ✅ **Categories & budgets** - management UI for both, verified end-to-end with real test data (see Progress log above).
4. ✅ **Dashboard & charts** - aggregations module + all dashboard visualizations, styled per dataviz skill (layered under the gummy chrome tokens - see design memory), verified end-to-end with real seeded data.
5. ✅ **Insights engine** - heuristic modules + `/insights` page, sanity-checked against real data from prior phases (see Progress log above for the exact hand-verified numbers).
6. ✅ **PWA polish** - manifest, icons, service worker, offline banner, offline-mutation guard, deployed to Vercel + Neon and verified installable/offline-capable on a real iPhone (see Progress log above).
7. ✅ **Settings & hardening** - password change (forces re-login), profile management (delete blocked by expense history or last-profile-standing), empty states (already in place from earlier phases, re-checked), error boundaries (root + `(app)`-scoped, both paired with matching `not-found.tsx`). Verified end-to-end with real data (see Progress log above).

## Verification Approach

Each phase verified end-to-end as a real user would, not just via unit tests:
- Phase 0: live Vercel URL loads over HTTPS, no console errors.
- Phase 1: full browser walkthrough of onboarding -> login -> profile pick -> protected page -> switch profile -> logged-out redirect; inspect cookie flags in devtools.
- Phase 2: add/edit/delete expenses with edge-case data (tiny/large amounts, empty optional fields), confirm persistence survives a full page reload.
- Phase 3: archive a category and confirm it disappears from pickers but still renders on historical expenses; confirm budgets don't collide across months.
- Phase 4: seed a realistic multi-month/category/profile dataset, hand-verify chart numbers against manual sums, check real mobile viewport widths.
- Phase 5: construct known scenarios (e.g. a category exactly 30% up MoM) and confirm insight text/numbers match hand-calculated expectations exactly - this is the highest-stakes phase for correctness.
- Phase 6 (**requires a real physical iPhone**): deploy live, add to home screen via Safari, confirm standalone launch (no browser chrome), toggle Airplane Mode and confirm cached dashboard/list still render, confirm offline expense-add shows a clean error instead of failing silently. Desktop emulation cannot substitute here - iOS Safari's PWA behavior has real quirks.
- Phase 7: password change forces re-login with new credentials; deleting a profile with expense history is blocked; every page checked with zero data for sane empty states.
- Throughout: targeted `vitest` unit tests for the highest-risk pure functions (`lib/insights/*`, `lib/charts/aggregations.ts`, budget percentage math), in addition to manual walkthroughs.

## Critical Files

- `prisma/schema.prisma` - the entire data model.
- `lib/session.ts` + `middleware.ts` - the custom auth/profile-switching model and route protection.
- `lib/insights/engine.ts` (+ `topCategories.ts`, `momTrend.ts`, `budgetOverage.ts`, `suggestions.ts`) - the rule-based "AI insights" feature.
- `app/manifest.ts` + `public/sw.js` - PWA installability and offline caching.
- `lib/charts/aggregations.ts` - shared data-shaping for all dashboard visualizations.
