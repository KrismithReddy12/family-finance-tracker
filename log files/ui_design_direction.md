---
name: ui-design-direction
description: Visual/UX direction for the Finance_man family expense tracker app
metadata: 
  node_type: memory
  type: project
  originSessionId: 18bcd330-f4cb-4507-bc25-9784838bddd7
---

The app's UI is a "Gummy 3D" pleasant cartoon style: chunky pressable buttons, thick-bordered sticker-style cards with hard offset shadows, a warm cream background, and a coral-rose accent. This supersedes an earlier "calm and professional" direction the user explicitly rejected after seeing it built.

**Why:** User's first request (2026-07-18) was "calm and slightly professional... cool animated clean UI," which was built and shown. User then said they didn't like it and wanted "pleasant cartoon style" with "clean light colors." After two more guessed iterations (pastel violet, then light rose) still didn't land, a 3-option side-by-side mockup artifact was built (Gummy 3D / Sticker-comic / Soft-blob) and the user picked **Option A: Gummy 3D**. Lesson: when a design request is subjective/visual and a first attempt is rejected, build a quick comparison mockup artifact for the user to point at rather than guessing repeatedly on the live app - it converged in one round instead of three.

**Concrete tokens (in `app/globals.css`), light mode:**
- `--surface-page: #fff8ee` (warm cream), `--surface: #ffffff` (cards)
- `--ink: #3d2530`, `--ink-secondary: #8a6d76`, `--ink-muted: #b39ca4` - rose-wine hued neutrals, NOT brown. A prior mistake used a literal chocolate-brown ink color reasoning it would "pair with the cream" - but text color dominates perceived page color since it's used everywhere, so the page read as brown instead of rose. Keep all neutral/ink tones rose-tinted, never brown-tinted, to avoid repeating this.
- `--accent: #ff4d6d` (coral-rose), `--accent-strong: #c4183f` (darker "lip" shade for 3D button press effect)
- `--hairline: #ffe3ea`, `--hairline-strong: #ffd7de`
- Dark-mode equivalents exist in the same file, also rose-tinted (not brown).

**How to apply:**
- Buttons (`components/ui/Button.tsx`): solid accent fill + thick darker bottom border (`border-b-[5px] border-accent-strong`) that shrinks and the button translates down on `:active` - genuine pressable 3D affordance, not just a hover color change.
- Cards (`components/ui/Card.tsx`): thick border (3px) + hard, non-blurred offset shadow (`shadow-[5px_5px_0_var(--hairline-strong)]`), not a soft blurred shadow.
- List items (e.g. expense rows) are individual small gummy cards with their own border/shadow and gap spacing, not rows divided by thin lines inside one shared container.
- Category icons (`components/ui/CategoryIcon.tsx`): emoji in a circle badge with a colored border matching the category's color, tinted background via `color-mix`.
- Fonts: Fredoka (display/headings/buttons/big numbers, `font-display` utility) + Nunito (body, default `font-sans`), self-hosted via `next/font/google` in `app/layout.tsx` - no CDN, works fine in the real app even though Claude Artifact previews can't load custom fonts (CSP blocks font CDNs there, so mockup comparisons use system fonts and note that real fonts come later).
- Motion: bouncy "pop-in" entrance animation (`.animate-fade-in`, cubic-bezier overshoot) already established, kept from an earlier iteration - fits the gummy direction well.

**Important exception - do NOT pastel-ify the data/chart palette:** The 8-color categorical series (`--series-1..8` in `app/globals.css`) and status colors are kept at their dataviz-skill-validated values, not made pastel/light, even though the rest of the chrome is light and playful. Real light pastels fail the colorblind-safety (CVD ΔE) and contrast checks the dataviz skill validates against. This was explained to the user and accepted - the cartoon feeling comes from shape/motion/chrome, not from the data-encoding colors. See [[dataviz-skill-usage]] if that memory exists, otherwise just: always run the dataviz skill's validator before changing series colors, never eyeball it.

**Relevant to:** every UI surface. Phase 4 (dashboard/charts) should style charts using the dataviz skill's guidance layered under this gummy chrome - chart marks/axes use the skill's rules, surrounding stat tiles/cards/buttons use the gummy tokens above.
