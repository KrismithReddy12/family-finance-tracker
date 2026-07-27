---
name: ui-design-direction
description: Visual/UX direction for the Finance_man family expense tracker app
metadata: 
  node_type: memory
  type: project
  originSessionId: 18bcd330-f4cb-4507-bc25-9784838bddd7
  modified: 2026-07-27T16:32:37.053Z
---

The app's shape language is now a **flat, "Robinhood-style" mobile shell** - no borders, no hard offset shadows, no bounce - rendered in the same single dark-purple "Royal Velvet" palette as before (unchanged tokens, see below). This supersedes the earlier "Gummy 3D" system (chunky pressable buttons, thick-bordered sticker cards, hard offset shadows, bouncy pop-in) - see history below. The palette carried over untouched; only the shape/motion/navigation language changed.

**Why:** The user felt the app, while installable as a PWA, still "operated like a desktop website that's just accessible on phone" - lots of zoom issues, no native-app feel. They asked for the Robinhood mobile app's look and interaction model specifically (flat surfaces, bottom tab bar, hero stat + trend chart), explicitly keeping the existing color scheme. Landed via one interactive mockup artifact (iPhone-frame, functional bottom tabs so the user could actually tap between mock screens) rather than static comparisons - same "build the comparison, don't guess on the live app" lesson as both prior palette rounds, just a richer artifact this time since the direction (Robinhood) was already given rather than open-ended.

**Concrete tokens (in `app/globals.css`), unchanged by this pass:**
- `--surface-page: #1c1330` (page bg), `--surface: #211730` (flat card/group surface)
- `--ink: #f2ecfa`, `--ink-secondary: #b3a0c4`, `--ink-muted: #8a7a9c`
- `--accent: #8b5cf6`, `--accent-strong: #6d28d9` (now used for button `:active` brightness, not a border-lip)
- `--hairline: #2c2138` (row divider inside flat groups - now the *only* border color in normal use), `--hairline-strong: #c4b5fd` (kept defined but no longer applied anywhere - flat surfaces don't use a crisp border)
- `--shadow-ink: #000000` - no longer used for the old hard cartoon offset shadow. Floating elements (chart tooltips) now use a normal soft blurred `shadow-lg`, not this token.
- Categorical series (`--series-1..8`) and status colors (`--status-good/warning/critical`) are untouched - still dataviz-skill-validated against `#211730`.

**How to apply (current, flat shell):**
- **Navigation is a fixed bottom tab bar** (`components/nav/BottomTabBar.tsx`), not a top nav header. Five tabs: Home (`/dashboard`), Expenses, Budgets, Insights, More (`/settings`). Icons are hand-drawn stroke SVGs in `components/icons/NavIcons.tsx` (no icon library dependency), active tab colored `--accent`, inactive `--ink-muted`. `app/(app)/layout.tsx` is now just a session/profile guard + `<main>` + `<BottomTabBar/>` - no header row at all. **Categories has no bottom-tab slot** - it's reachable via a "Manage categories" row on the Settings/More page, matching how a real app tucks secondary destinations under Account.
- **Settings (`/settings`) doubles as the "More" tab destination.** "Switch profile" and "Log out" moved here (as flat action rows) from the old top-header buttons, which no longer exist.
- Cards (`components/ui/Card.tsx`) and the new `components/ui/Group.tsx`: `rounded-2xl bg-surface`, no border, no shadow. `Group` is for row-based lists (expenses, budgets, categories) - rows inside it use `border-b border-hairline last:border-b-0` dividers instead of each row being its own bordered/shadowed card. `InsightCard` stays a standalone flat `Card` per item (not grouped) since each insight's severity color-coding benefits from separation.
- Buttons (`components/ui/Button.tsx`): flat solid fill (`primary` = accent, `secondary` = surface, `ghost` = transparent), no border-b press-lip. Press feedback is `active:scale-[0.97]` + `active:brightness-90`, not the old shrink-and-drop mechanic.
- Inputs/Select/Textarea (`components/ui/Input.tsx`): **bumped to `text-base` (16px)** - this was a real, reproduced bug fix, not just style: anything under 16px makes iOS Safari auto-zoom the whole page on focus, which is a big part of why the app "felt like a zoomed-in website" on the user's phone. Fields are flat filled (`bg-surface-page`, no border except `focus:border-accent`), giving a "sunken field on a card" look since they normally sit inside a `bg-surface` Card/Group.
- Category icons (`components/ui/CategoryIcon.tsx`): tinted circle badge only, no border ring (tint bumped to 35% to keep enough presence without the ring).
- Charts: `MonthlyTrendChart` is now a Recharts `AreaChart` (was `LineChart`) with a gradient fill under the line and no per-point dots, matching Robinhood's minimal trend-line look; `CategoryBreakdownChart`'s bars got fully-rounded ends. Both tooltips dropped the old hard-bordered/offset-shadow box for a plain `rounded-xl bg-surface shadow-lg`.
- Motion: `.animate-fade-in` / `.animate-bounce-in` (`app/globals.css`) dropped the bouncy overshoot cubic-bezier for a plain 0.25s ease-out fade+slide - bounce read as too playful for the flat direction.
- Fonts unchanged: Fredoka (`font-display`) + Nunito (`font-sans`), self-hosted via `next/font/google`. Mockup artifacts still can't load them (CSP blocks font CDNs in Claude Artifacts), so mockups render in system fonts as an approximation - noted to the user each time so they know the real app looks slightly different (better-branded) than the preview.

**Important exception - unchanged:** do NOT pastel-ify or re-hue `--series-1..8` or the status colors. Still dataviz-skill-validated against `#211730`; re-run the validator before ever touching either.

**History (superseded):**
1. Light cream (`#fff8ee`) + coral-rose (`#ff4d6d`) Gummy 3D, the original ship.
2. Dark-purple-only "Royal Velvet" Gummy 3D (chunky borders/hard shadows/bounce, same palette as now) - picked via 3 rounds of comparison mockups after the user rejected the cream+coral look.
3. **Current:** flat "Robinhood-style" shell on the same Royal Velvet palette - shape/motion/navigation overhaul, no palette change, triggered by the user wanting a more native-feeling mobile UI plus a real (now-fixed) iOS input-zoom bug.

**Relevant to:** every UI surface except the PWA icon-generation routes (`app/manifest.ts`, `app/apple-icon.tsx`, `app/icons/*/route.tsx`) and `viewport.themeColor`, which hardcode hex directly and are untouched by this pass since the palette didn't change.
