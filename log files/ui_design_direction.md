---
name: ui-design-direction
description: Visual/UX direction for the Finance_man family expense tracker app
metadata: 
  node_type: memory
  type: project
  originSessionId: 18bcd330-f4cb-4507-bc25-9784838bddd7
  modified: 2026-07-20T19:56:40.698Z
---

The app's UI is "Gummy 3D" (chunky pressable buttons, thick-bordered sticker-style cards with hard offset shadows) rendered as a **single dark-purple theme, "Royal Velvet"** - no light mode, not OS-preference-driven. This supersedes an earlier light cream + coral-rose version of the same Gummy 3D system (see history below) - the shapes/motion/chunkiness carried over, only the palette and the light/dark decision changed.

**Why:** After the app was feature-complete (all 7 build phases done), the user said they didn't like the cream+coral look and pointed at a different project (`caffeine-countdown`) as a reference for what felt more appealing on mobile. Two rounds of comparison-mockup artifacts converged this: first an "ink pop" pass (swap the pale pastel border/shadow color for a solid dark ink - this alone is most of why the reference felt chunkier), then the user said the palette itself should change and asked for options, then explicitly said none of those felt right because they were "mainly white themed" and asked for dark purple instead. A third mockup with three dark-purple sub-options (differing mainly in how the "ink pop" shadow works on a dark surface: true black shadow vs. glowing colored shadow vs. something in between) let them pick **"Royal Velvet"** directly. Same lesson as the original coral-rose pick: build the comparison, don't guess on the live app - this took 3 rounds of concrete mockups but zero blind edits to the real app before landing.

**Concrete tokens (in `app/globals.css`), the only theme:**
- `--surface-page: #1c1330` (near-black purple, page bg - see contrast fix note below), `--surface: #211730` (card/header surface)
- `--ink: #f2ecfa`, `--ink-secondary: #b3a0c4`, `--ink-muted: #8a7a9c` - light lavender neutrals
- `--accent: #8b5cf6` (violet), `--accent-strong: #6d28d9` (darker "lip" shade for button press effect)
- `--hairline: #2c2138` (dim divider), `--hairline-strong: #c4b5fd` (crisp light-lavender border - this is the border color, distinct from the shadow color below)
- `--shadow-ink: #000000` (true black) - **the offset-shadow color is a separate token from the border color.** In the old light theme both border and shadow reused `--hairline-strong`; that doesn't work on a dark surface (a light-on-dark shadow doesn't read as depth), so shadows always reference `--shadow-ink` while borders reference `--hairline`/`--hairline-strong`. Any new component that adds a `shadow-[Npx_Npx_0_var(--hairline...)]` is reintroducing the old light-mode assumption - use `--shadow-ink` instead.
- **Shadow-contrast fix (2026-07-21):** the first-ever live-browser render of Royal Velvet (previous sessions had no browser tool) showed the offset shadow was nearly invisible - the original `--shadow-ink: #05030a` sat too close in lightness to the original `--surface-page: #160f22` for the "hard offset shadow" to read as a cast shadow at real viewing scale (confirmed only visible when zoomed way into a card corner). Fixed with two changes together: `--shadow-ink` pushed to true `#000000` (max achievable darkness) and `--surface-page` lifted slightly to `#1c1330` (more headroom below it, still reads as near-black/"velvet"), plus `Card.tsx`'s offset bumped from `5px` to `7px` so the shadow occupies enough area to be perceptible (the smaller `3px` shadows on rows/tooltips didn't need a size change - the token contrast fix alone was enough for those). The PWA hardcoded hex values (`app/manifest.ts` background/theme_color, `app/layout.tsx` viewport.themeColor) were updated to `#1c1330` to match. If iterating on this again, use the `claude-in-chrome` skill to view real screenshots rather than reasoning from hex values alone - the original near-invisible shadow looked fine on paper (it *is* darker than the page, just not by enough to read at normal screen scale).
- Categorical series (`--series-1..8`) and status colors are unchanged from the app's old dark-mode values (see exception below) - re-validated with the dataviz skill's `validate_palette.js` against the new `#211730` surface specifically, all checks still pass.
- `CategoryIcon`'s `color-mix` tint was bumped from 22% to 30% - the lighter mix read as washed-out against the new dark surface.
- There is no light/dark toggle scaffolding anymore (`prefers-color-scheme` media query and `data-theme` blocks were removed from `globals.css`) - the user chose dark-purple-only over building a matching light companion theme, so keeping that scaffolding around would have been dead code for a feature that was deliberately rejected.

**How to apply:**
- Buttons (`components/ui/Button.tsx`): solid accent fill + thick darker bottom border (`border-b-[5px] border-accent-strong`) that shrinks and the button translates down on `:active` - unchanged mechanic, just re-themed via the token swap.
- Cards (`components/ui/Card.tsx`): thick border (3px, `--hairline-strong`) + hard, non-blurred offset shadow (`shadow-[7px_7px_0_var(--shadow-ink)]`) - note the shadow token is different from the border token now, see above.
- List items (e.g. expense rows) are individual small gummy cards with their own border/shadow and gap spacing, not rows divided by thin lines inside one shared container.
- Category icons (`components/ui/CategoryIcon.tsx`): emoji in a circle badge with a colored border matching the category's color, tinted background via `color-mix` at 30%.
- Fonts: Fredoka (display/headings/buttons/big numbers, `font-display` utility) + Nunito (body, default `font-sans`), self-hosted via `next/font/google` in `app/layout.tsx` - unchanged by the palette swap. Claude Artifact previews can't load these custom fonts (CSP blocks font CDNs there), so mockup comparisons render in system fonts and look chunkier in the real app than in a mockup.
- Motion: bouncy "pop-in" entrance animation (`.animate-fade-in`, cubic-bezier overshoot) - unchanged, still fits.
- PWA chrome (`app/manifest.ts`, `app/apple-icon.tsx`, `app/icons/*/route.tsx`, `viewport.themeColor` in `app/layout.tsx`) all hardcode hex directly since `next/og`'s `ImageResponse` can't resolve CSS custom properties - these were updated by hand to `#8b5cf6` (icon fill) / `#1c1330` (theme-color, manifest background - see shadow-contrast fix note above for why this isn't `#160f22` anymore). If the palette changes again, these files need the same hex swap manually, `globals.css` alone won't propagate to them.

**Important exception - do NOT pastel-ify or re-hue the data/chart palette:** The 8-color categorical series (`--series-1..8`) and status colors are kept at their dataviz-skill-validated values regardless of chrome changes. This was re-verified for Royal Velvet specifically (validator run against the new `#211730` surface, all checks passed) rather than assumed to still be fine - always run the dataviz skill's validator before changing series colors OR before changing the surface color they render against, never eyeball either.

**History (superseded):** originally shipped as a light cream (`#fff8ee`) + coral-rose (`#ff4d6d`) version of this same Gummy 3D system, picked from a 3-option mockup (Gummy 3D / Sticker-comic / Soft-blob) after an even earlier "calm and professional" direction was rejected. That coral-rose palette is fully gone from the codebase now, replaced token-for-token by Royal Velvet above.

**Relevant to:** every UI surface, including the PWA icon-generation routes (unlike most of the app, those can't consume `globals.css` tokens directly - see above).
