# Session log: first live browser check + 3 bugs found (2026-07-21)

Every prior session verified the app without a browser (no browser tool was available in
this environment) - via curl, compiled-CSS greps, and viewing generated PNG icons
directly. This session, the `claude-in-chrome` skill became available for the first time,
so the user asked to actually host the app and look at it live. That real render
immediately surfaced three bugs that all prior curl/build-based verification had missed.

## How the app was hosted

1. `npx prisma dev` (Prisma's local dev Postgres daemon) started in the background.
2. `npm run dev` (Next.js + Turbopack) started in the background, listening on
   `http://localhost:3000`.
3. `claude-in-chrome` skill used to open the URL in the user's real Chrome and interact
   with it (screenshots, clicks, form fills) via the `mcp__claude-in-chrome__*` tools.

**Gotcha for next time:** `npx prisma dev` with no `-n/--name` flag starts (or resumes) a
server named `default` on fresh random ports. This project's `.env` (`DATABASE_URL` /
`APP_DATABASE_URL`) is pinned to a **named, persistent** daemon called `financeman`
(visible via `npx prisma dev ls`). Starting `default` instead silently spins up an empty,
unrelated database on different ports - the app then fails every DB call with
`ECONNREFUSED` because `.env`'s fixed ports don't match. Always start it explicitly:
`npx prisma dev start financeman -d` (or `npx prisma dev ls` first to check what's already
registered/running before starting anything).

## Bug 1: Tailwind v4 source-scanning a markdown file broke the entire CSS build

**Symptom:** `http://localhost:3000` loaded a completely blank white page. No visible
error in the page itself.

**Root cause:** Tailwind CSS v4 (`@import "tailwindcss";` in `app/globals.css`) does
automatic content/source detection across the whole project (anything not
`.gitignore`-excluded) - it doesn't need a `content: [...]` config like v3. The
`log files/` folder is committed to the repo (not gitignored), and
`log files/ui_design_direction.md` (synced from the `ui-design-direction` memory file
during the previous Royal Velvet redesign session) contains this literal prose as a
worked example:

> Any new component that adds a `shadow-[Npx_Npx_0_var(--hairline...)]` is reintroducing
> the old light-mode assumption

Tailwind's scanner treats any `word-[...]` shaped string as an arbitrary-value utility
class candidate, regardless of whether it's inside a code fence, a sentence, or a real
component file. It tried to generate CSS for the literal string
`Npx_Npx_0_var(--hairline...)`, which isn't valid CSS syntax, and the resulting parse
error broke the whole stylesheet - hence the blank page. Confirmed via
`read_console_messages` in the browser, which showed the exact PostCSS parse error
pointing at the generated (fake) utility class.

**Fix:** Added `@source not "../log files";` to the top of `app/globals.css`, right after
`@import "tailwindcss";`. This is Tailwind v4's documented syntax for excluding a path
from automatic source detection (confirmed supported in the installed
`tailwindcss@4.3.3` by checking `node_modules/tailwindcss/dist/lib.mjs` for `@source`
negation handling, per this project's `AGENTS.md` rule to verify Next/Tailwind-adjacent
APIs against the installed version rather than trusting training data).

**Lesson for future sessions:** any prose in `log files/*.md` (or any other
non-gitignored file) that contains a literal `something-[...]` pattern - even just as a
descriptive example, not real code - can break the production CSS build the same way.
Either keep using `@source not` for doc directories, or avoid writing bracket-style
Tailwind-arbitrary-value examples verbatim in checked-in markdown.

## Bug 2: All 10 default categories had broken icon data (not a code bug - stale test data)

**Symptom:** On the Categories page, every category showed a raw text label instead of
an emoji badge - e.g. "utensils", "shopping cart", "heart-pulse", "home", "tag",
"shopping bag", "repeat", "car", "bolt", "film" overlapping the category name.

**Root cause:** `lib/defaultCategories.ts` (the source of truth for what gets seeded on
onboarding) correctly stores real emoji (🍽️, 🛒, 🩺, etc.) and always has - this was
never a bug in current code. The `kris` test family used for manual verification
throughout this whole project was created back during Phase 3 development, before the
UTF-8 emoji-mangling-over-curl issue (see the Phase 3-era log/memory) was discovered and
worked around. Its categories were seeded/edited with literal placeholder icon-name
strings (Lucide icon slugs, it looks like) instead of real emoji at the time, and because
the `financeman` Prisma dev daemon persists data across every session (unlike an
ephemeral `default` instance), that stale bad data has silently lived in the dev database
ever since - just never rendered in a real browser until now.

**Fix:** Not a code change. Manually corrected all 10 categories through the app's own
Edit Category UI (`/categories/[id]/edit`), picking the correct emoji for each from the
existing icon picker. No source files touched for this part.

## Bug 3 (found while fixing Bug 2): category color enum was missing a documented value

**Symptom:** Two of the ten categories - "Other" and "Subscriptions" - would not save
through the Edit form no matter what: their icon looked selectable, but submitting kept
silently failing (redirect back to the edit page with a generic "check the highlighted
details" error, no field-level indicator of which field was wrong).

**Root cause:** `lib/defaultCategories.ts` deliberately seeds those two specific
categories with `color: "var(--ink-muted)"` instead of one of the 8 categorical series
colors - the file's own comment explains this is intentional, so the two lowest-priority
buckets don't consume a slot from the categorical chart palette. But
`lib/categoryOptions.ts`'s `CATEGORY_COLORS` array (which both the Zod validation schema
in `lib/validation/category.ts` and the `IconColorPicker` component's color swatches are
generated from) only ever listed the 8 series colors. So:
- The edit picker had no swatch that matched the category's actual stored color, meaning
  none of the 8 radios came pre-checked (`IconColorPicker.tsx` checks
  `defaultColor === color` per swatch).
- Submitting without explicitly clicking a color always failed `categorySchema`'s
  `z.enum([...CATEGORY_COLORS])` check, since no `color` field value was submitted at
  all.
- The only way to "fix" it through the UI, before this session, would have been to
  accidentally overwrite the deliberate muted color with one of the 8 bright series
  colors - permanently losing the intended design distinction with no warning of why.

This is a real, reachable bug for any real user too, not just this dev account: anyone
who opens Edit on their "Other" or "Subscriptions" category (both created by default for
every new family) hits the same silent-failure wall.

**Fix (code change, committed):** Added `"var(--ink-muted)"` as a 9th entry to
`CATEGORY_COLORS` in `lib/categoryOptions.ts`. This one array feeds both the Zod schema
and the picker UI, so the fix was a single line. Verified with `tsc --noEmit` (clean),
`npm run lint` (clean), and `npm test` (39/39 still passing) before committing.

## What shipped

Two files changed, committed as `b322281`
("Fix Tailwind source scan picking up doc prose, and category color enum gap"):

| File | Change |
|---|---|
| `app/globals.css` | Added `@source not "../log files";` under the Tailwind import |
| `lib/categoryOptions.ts` | Added `"var(--ink-muted)"` to `CATEGORY_COLORS` |

Plus, outside of source control: all 10 categories on the `kris`/`financeman` dev account
were manually corrected to their proper emoji through the running app's own edit UI.

## Verification

- Confirmed the blank-page bug was actually a CSS parse failure via
  `mcp__claude-in-chrome__read_console_messages`, not guessed from source alone.
- Confirmed the `ECONNREFUSED` dashboard 500s by reading the raw Next dev server log
  (`Prisma dev` daemon name/port mismatch), not just the browser-side error message.
- After both infra fixes, did a full authenticated page-by-page browser tour (Dashboard,
  Categories, Budgets, Insights, Settings) with real screenshots - first time in this
  project's history that the Royal Velvet redesign (shipped last session, `ebc5112`) has
  actually been seen rendered rather than inferred from compiled CSS/token greps.
- `tsc --noEmit`, `npm run lint`, `npm test` (39/39) all re-run and clean after the code
  changes, before committing.

## Open observation (not yet addressed)

Looking at real cards in the browser, the "hard offset shadow" that's supposed to be a
signature part of the Gummy 3D look is barely visible - `--shadow-ink: #05030a` sits too
close in lightness to `--surface-page: #160f22` for the offset shadow to read as a
distinct cast shadow the way it did in the mockup comparisons. Only the lavender border
is clearly visible; the shadow mostly disappears into the page background. This wasn't
caught earlier because no session before this one could actually render the app. Not
fixed yet - flagged to the user, left for a follow-up decision since it touches the
explicitly-chosen "true near-black shadow" design pick from the Royal Velvet mockup round
(see `ui_design_direction.md`), not a clear-cut bug.
