# Family Expense Tracker - Implementation Plan

## Progress So Far (updated 2026-07-20, end of session)

**Done: Phases 0, 1, 2, 3, plus a full UI design pass. Next up: Phase 4 (Dashboard & charts).**

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
- Curl testing this environment on Windows: emoji values (e.g. `avatarEmoji`, category `icon`) get mangled to `??` if passed as raw shell arguments through `--data-urlencode` - the shell/curl pipeline doesn't preserve UTF-8 bytes reliably. Workaround: pass the already-percent-encoded UTF-8 bytes directly via plain `-d "field=%F0%9F%90%BE"` instead of relying on curl to encode a literal emoji character. Worth remembering for Phase 4/5 testing too if any forms take emoji input.

**UI design went through several iterations** based on live user feedback - see the `ui-design-direction` memory (auto-loaded in future sessions) for the full rationale and concrete color/font tokens. Short version: landed on a "Gummy 3D" cartoon style (chunky pressable buttons, thick-bordered sticker cards, cream background, coral-rose accent `#ff4d6d`, Fredoka+Nunito fonts). When building Phase 4+ UI, match this established system (`components/ui/*`) rather than introducing new patterns - the primitives (Button, Card, Input/Select/Textarea, FormError, CategoryIcon) already exist and should be reused.

**What exists right now, concretely:**
- Full auth loop: onboarding (family + first profile + 10 seeded default categories), login, Netflix-style profile picker, add-profile, switch-profile, leave-profile, logout. Route protection via `proxy.ts`.
- Full expense CRUD: add/list/edit/delete, category+profile filters on the list page, validation preserves entered values on error, cross-family data isolation verified.
- Full category management (`/categories`, `/categories/new`, `/categories/[id]/edit`): add, rename, change icon/color (20-icon x 8-color picker reusing the AvatarPicker radio pattern), archive/unarchive. Archived categories stay excluded from expense-entry pickers but still render correctly on their historical expenses.
- Full budget management (`/budgets`): month picker (prev/next nav + direct `?month=YYYY-MM`), one row per active category showing spend-vs-budget with a gummy progress bar (green under 90%, amber 90-100%, red over 100%, capped visual width at 100% with an "over budget" note), inline save-per-row and a clear/delete action. Verified budgets don't collide across months and that spend is computed correctly from real expense data.
- Dashboard shows this-month total spend + 5 most recent expenses (a lightweight preview of Phase 4's real charts) - unchanged this phase.
- No charts yet (Recharts isn't installed/used yet) - Phase 4.
- No insights engine yet - Phase 5.

**Bug found and fixed during Phase 3 verification:** the initial `/api/budgets` route handler built its redirect URL as `` `/budgets?month=${month}` `` and then passed that whole string as the `pathname` argument to the existing `redirectWithFields` helper - which itself appends `` `?${params}` ``, producing a malformed double-`?` URL (`/budgets?month=2026-07?error=...`) on any validation failure. Fixed by passing the bare `/budgets` path and folding `month` into the fields object instead (so it becomes one of the querystring params `redirectWithFields` already builds correctly). Caught by driving the actual invalid-input path end-to-end with curl rather than only checking the happy path - a good example of why every phase's verification approach (below) insists on exercising real request/response flows, not just skimming the code.

**Immediate next step:** Phase 4 - build `lib/charts/aggregations.ts` (pure, testable data-shaping functions) and the real dashboard visualizations (category breakdown, monthly trend, budget-vs-actual) using Recharts, styled per the dataviz skill layered under the established gummy chrome tokens. Seed a realistic multi-month/category/profile dataset first so chart numbers can be hand-verified against manual sums.

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
2.5. ✅ **UI design system** - not in the original plan, but a full visual redesign happened this session after user feedback (see Progress log above and the `ui-design-direction` memory). Gummy 3D cartoon style is now the established system - reuse it, don't redesign again without reason.
3. ✅ **Categories & budgets** - management UI for both, verified end-to-end with real test data (see Progress log above).
4. ⬜ **Dashboard & charts** - aggregations module + all dashboard visualizations, styled per dataviz skill (layered under the gummy chrome tokens - see design memory). **← next up.**
5. ⬜ **Insights engine** - heuristic modules + `/insights` page, sanity-checked against real data from prior phases.
6. ⬜ **PWA polish** - manifest, icons, service worker, offline banner, install UX (last, since it needs a feature-complete app to test against). Also when this phase starts: revisit deploying to Vercel + wiring a real Neon database (see Progress log - local dev has been Postgres via `prisma dev`, not Neon, so far).
7. ⬜ **Settings & hardening** - password change, profile management, empty states, error boundaries.

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
