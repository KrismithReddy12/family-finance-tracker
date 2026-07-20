# Session log: Royal Velvet redesign (2026-07-20)

Session that followed completion of all 7 build phases. The app was feature-complete
(auth, expenses, categories, budgets, dashboard, insights, settings, PWA code) when the
user asked for a full visual redesign, unrelated to any remaining functional work.

## Request

User said they weren't a fan of the existing look (light cream + coral-rose "Gummy 3D"
theme, shipped during initial build) and pointed at a separate local project,
`C:\Users\RossK\Projects\caffeine-countdown`, as a reference for a look they found more
appealing on mobile - a single-file HTML app with a bold, high-contrast cartoon-sticker
style.

## Process

Read `caffeine-countdown/index.html` directly to identify what specifically made it read
as "cooler" rather than guessing from vibes. The key technical finding: its cards/buttons
use one dark ink color (`--brown: #6B3A1F`) for **both** the border and the offset
drop-shadow, giving high contrast. Family Finance's existing "Gummy 3D" system used the
same border+shadow mechanic but with a very pale pastel pink (`--hairline-strong:
#ffd7de`) for both roles - same idea, much softer execution.

Per the project's own design-memory precedent ("build a comparison mockup rather than
guessing repeatedly on the live app"), three rounds of side-by-side HTML mockup artifacts
were built and published rather than editing the live app blind:

1. **Intensity comparison** - Current vs. "Option A: Ink Pop" (swap the pastel
   border/shadow token for a solid dark ink, same coral-rose palette) vs. "Option B: Full
   Energy" (Option A + a gradient header + warm background blooms, closer to the
   reference's total effect).
2. **Color options** - user said Option A/B's *coloring* wasn't it ("mainly white
   themed"), asked for alternatives. Four palettes shown: Coral Sunrise (deepened
   current), Marigold (literal caffeine-countdown palette adapted), Mint Ledger (money
   green), Grape Soda (violet).
3. **Dark purple options** - user rejected all four as still too light and asked
   specifically for dark purple. Three sub-variants shown, differing in how the
   "ink-pop" shadow trick adapts to a dark surface (a dark-on-dark shadow doesn't read as
   depth the same way): Royal Velvet (true near-black shadow, light lavender border),
   Neon Candy (glowing colored shadow), Orchid Dusk (softer/warmer, gradient header).

User picked **Royal Velvet**. Follow-up question (asked via AskUserQuestion, since it was
a real fork the user needed to decide, not something inferable): should this replace
light mode entirely, or become the dark half of a light/dark pair with a new light
companion designed to match? User chose **dark-purple only** - no light mode.

## What shipped

Full token swap in `app/globals.css`:

| Token | Old (coral-rose) | New (Royal Velvet) |
|---|---|---|
| `--surface-page` | `#fff8ee` | `#160f22` |
| `--surface` | `#ffffff` | `#211730` |
| `--ink` | `#3d2530` | `#f2ecfa` |
| `--ink-secondary` | `#8a6d76` | `#b3a0c4` |
| `--ink-muted` | `#b39ca4` | `#8a7a9c` |
| `--hairline` | `#ffe3ea` | `#2c2138` |
| `--hairline-strong` | `#ffd7de` | `#c4b5fd` |
| `--accent` | `#ff4d6d` | `#8b5cf6` |
| `--accent-strong` | `#c4183f` | `#6d28d9` |
| `--shadow-ink` (new token) | *(none - shadows reused `--hairline-strong`)* | `#05030a` |

The new `--shadow-ink` token is the structurally important change, not just a color
swap: in the old light theme, `border-hairline-strong` and `shadow-[...var(--hairline-strong)]`
pointed at the same value, since a pale border and a pale shadow both worked against a
white surface. On a dark surface that stops working - the shadow needs to be *darker*
than the surface to read as depth, while the border needs to be *lighter* to read as a
crisp edge. So shadows and borders now reference separate tokens. Seven components had
hardcoded `shadow-[...var(--hairline...))]` classes that needed the swap to
`var(--shadow-ink)`: `Card.tsx`, `ExpenseRow.tsx`, `CategoryCard.tsx`, `BudgetRow.tsx`,
`InsightCard.tsx`, and both Recharts custom-tooltip components.

Also removed the `@media (prefers-color-scheme: dark)` and `:root[data-theme]` blocks
from `globals.css` entirely - dead scaffolding now that dark-purple-only was the explicit
choice over a light/dark pair.

Categorical chart colors (`--series-1..8`) and status colors (good/warning/serious/
critical) were **not** changed - re-used the app's former dark-mode values as-is, but
re-verified them with the dataviz skill's `validate_palette.js` against the new
`#211730` card surface specifically (the values were previously validated against a
different, slightly lighter dark surface). All checks passed - no re-hueing needed.

`CategoryIcon`'s `color-mix` tint bumped from 22% to 30% - the lighter mix read as
washed-out against the new dark surface.

PWA chrome updated by hand in six files that can't consume `globals.css` tokens (Next's
`ImageResponse`, used for the manifest icons and apple-touch-icon, can't resolve CSS
custom properties - has to be literal hex): `app/manifest.ts` (background/theme color),
`app/layout.tsx` (`viewport.themeColor`), `app/apple-icon.tsx`, and the three
`app/icons/*/route.tsx` files (icon fill color `#ff4d6d` → `#8b5cf6`).

## Verification

No browser tool is available in this environment (established constraint throughout the
whole project), so verification leaned on what curl and static analysis could confirm:

- `npm run lint`, `tsc --noEmit`, and the full `vitest` suite (39 tests) all clean
  before and after.
- `npm run build` (production build, not just dev) succeeded; icon routes still
  correctly prerendered as static (`○`, not `ƒ`).
- Fetched the compiled CSS chunk directly and grepped for the new hex values
  (`160f22`, `8b5cf6`, `05030a`, `c4b5fd`) to confirm the token swap actually reached the
  built output, not just the source file.
- Downloaded the regenerated `/icons/512` PNG and viewed it directly (the `Read` tool
  can render images) to visually confirm the icon is now purple with the white "F"
  monogram, not just trust the source code change.
- Full page-by-page regression pass via curl across every route (dashboard, expenses,
  categories, budgets, insights, settings) - all still 200, no runtime errors introduced
  by the token changes.
- Did **not** and cannot visually confirm the live rendered app matches intent (no
  browser) - flagged this limitation explicitly to the user rather than claiming full
  visual verification.

## Memory / doc updates

- `ui-design-direction` memory (`C:\Users\RossK\.claude\projects\...\memory\`) rewritten
  to describe Royal Velvet as current, with the coral-rose era moved to a "History
  (superseded)" section rather than deleted outright - keeps the mockup-comparison lesson
  and the "why" reasoning available for the next time a redesign request comes in.
- `MEMORY.md` index entry updated to match.
- `log files/ui_design_direction.md` and `log files/MEMORY.md` re-synced from the memory
  files (this project keeps a copy of the memory system's content checked into the repo).
- `log files/implementation-plan.md`'s progress log and Phase 2.5 checklist entry updated
  to note the second design pass without deleting the history of the first.

## Commit

`ebc5112` - "Redesign to a dark-purple 'Royal Velvet' theme"
