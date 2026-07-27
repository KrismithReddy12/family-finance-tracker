# Session log: Robinhood-style mobile shell redesign (2026-07-27)

The user reported that despite being installable as a PWA, the app still "operated like a
desktop website that's just accessible on phone" - zoom issues on forms, no native-app
feel. They asked for a full UI/UX redesign matching the Robinhood mobile app's look and
navigation model, explicitly keeping the existing Royal Velvet color scheme.

## Direction-setting

Rather than guessing on the live app, built one interactive HTML mockup (iPhone-frame,
functional bottom tabs so the user could actually tap between five mock screens) as a
Claude Artifact, using the real `app/globals.css` tokens. The user approved it as-is
("yes i love that. you can start building") after one round - no revisions needed, unlike
the three rounds the original Royal Velvet palette took, likely because the reference
(Robinhood) was concrete rather than open-ended.

Confirmed with the user up front: full flat clone (not a hybrid keeping some gummy
touches), bottom tab bar replacing the top nav, and mockup-then-build-everywhere rather
than mocking every page first.

## What changed

Shape/motion/navigation overhaul; **palette untouched**. Full rationale and tokens in the
`ui-design-direction` memory (re-synced to this file, which is the source of truth per
prior sessions' convention) - short version:

- **Bottom tab bar** (`components/nav/BottomTabBar.tsx`, icons in
  `components/icons/NavIcons.tsx`) replaces the top nav header entirely. Five tabs: Home,
  Expenses, Budgets, Insights, More. Categories has no tab slot - moved to a "Manage
  categories" row on Settings, which now doubles as the "More" destination and also
  absorbed "Switch profile"/"Log out" from the old header.
- **Flat surfaces everywhere:** `Card`/new `Group` component dropped the thick border +
  hard offset shadow for plain `bg-surface` rounded blocks; list rows (`ExpenseRow`,
  `CategoryCard`, `BudgetRow`, `BudgetMeterRow`) dropped their individual card chrome for
  `border-b border-hairline` dividers inside a shared `Group`, so a list of expenses reads
  as one grouped block instead of a stack of separate cards.
- **Buttons** dropped the border-b press-lip mechanic for flat fills with
  `active:scale-[0.97]` press feedback.
- **Dashboard rewritten** around a Robinhood-style hero: big "spent this month" number,
  colored delta pill vs. last month, budget-remaining subline - replacing the old 3-tile
  `StatTile` grid (component deleted, no other usages).
- **Charts restyled flat:** `MonthlyTrendChart` switched from a `LineChart` to an
  `AreaChart` with a gradient fill and no per-point dots; `CategoryBreakdownChart` bars got
  fully-rounded ends; both tooltips dropped the hard-bordered box for a plain soft-shadowed
  one.
- **Real bug fix, not just style:** `Input`/`Select`/`Textarea` were `text-sm` (14px) -
  under iOS Safari's 16px auto-zoom-on-focus threshold. This is almost certainly the "zoom
  issues" the user described. Bumped to `text-base` (16px) as part of the same pass.
- Motion: `.animate-fade-in`/`.animate-bounce-in` dropped the bouncy overshoot easing for a
  plain fade+slide, matching the flatter direction.

## Verification

- `tsc --noEmit`, `npm run lint`, `npm test` (39/39) all clean after the changes.
- Full authenticated browser walkthrough via `claude-in-chrome` against the real `kris`/
  `Gade` dev account (local `prisma dev` daemon `financeman`, per the established gotcha of
  starting it by name): Dashboard, Expenses (added and deleted a real throwaway expense to
  confirm the full create -> list -> edit -> delete loop and to see the hero stat and
  charts react to real data), Budgets (set and cleared a real budget to see the meter/status
  color and the dashboard budget-remaining line react), Categories, Insights, Settings/More
  all confirmed rendering correctly with the new flat components. All test data cleaned up
  afterward - dev DB verified back to its pre-session state ($0.00 spent, no budgets).
- Caught and fixed one real layout bug during verification: the trend chart's end-of-line
  value label (e.g. "$42.50") was clipped to "$42.!" because the `AreaChart`'s right margin
  had been tightened from the original `LineChart`'s `24` down to `8` when the component was
  rewritten - restored to `24`.
- **Not verified:** the actual iOS auto-zoom fix, since that's a real-Safari-only behavior
  that neither desktop Chrome nor this environment's browser automation can reproduce.
  Per this project's own established standard for PWA/mobile-only behavior (see the Phase 6
  log), this needs the user's physical iPhone to confirm - flagged for follow-up.

## What shipped

New files: `components/ui/Group.tsx`, `components/nav/BottomTabBar.tsx`,
`components/icons/NavIcons.tsx`.

Rewritten: `app/globals.css` (motion only), `app/(app)/layout.tsx`,
`app/(app)/dashboard/page.tsx`, `components/ui/{Card,Button,Input,CategoryIcon,FormError}.tsx`,
`components/charts/{MonthlyTrendChart,CategoryBreakdownChart}.tsx`,
`components/{expenses/ExpenseRow,categories/CategoryCard,budgets/BudgetRow,dashboard/BudgetMeterRow,insights/InsightCard}.tsx`,
`app/(app)/{expenses,budgets,categories,insights,settings}/page.tsx`.

Deleted: `components/dashboard/StatTile.tsx` (no longer used).

Untouched by choice: `/login`, `/onboarding`, `/profiles` (the Netflix-style profile
picker) - these inherit the flatter Button/Input/Card look automatically since they share
the same primitives, but their own bespoke bits (e.g. `ProfileTile`'s dashed avatar-picker
ring) were left alone as a distinct, deliberately playful screen outside the redesign's
scope (dashboard + main app shell).

## Memory / doc updates

- `ui-design-direction` memory rewritten to describe the flat shell as current, with the
  Gummy 3D Royal Velvet version folded into its history section.
- `MEMORY.md` index updated.
- This file added; `implementation-plan.md`'s progress log updated with a pointer to it.
