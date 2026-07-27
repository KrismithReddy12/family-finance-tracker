# Session log: service worker was serving pre-mutation data (2026-07-27)

The user reported the Home page "doesn't update immediately" after adding an expense.

## Reproduction

Confirmed against a real `next build` + `next start` (not `next dev` - the service worker
only registers in production, so `next dev` can't reproduce anything involving it) on the
user's real production account (`family-finance-tracker-chi.vercel.app`):

1. Load `/dashboard` (caches it).
2. Add an expense - the mutation itself works fine, the DB is updated correctly.
3. The 303 redirect lands on `/expenses` - **it doesn't show the new expense either.**
4. Reload `/expenses` a few seconds later - now it's there.

So the bug wasn't specific to Home - it hit the very page you land on right after any
mutation, and every other page until its cache entry got a chance to refresh in the
background.

## Root cause

`public/sw.js`'s fetch handler applied **stale-while-revalidate** to every same-origin
GET, with no distinction between static assets (fine to serve stale-then-refresh) and page
navigations (must be fresh). Concretely: the handler served the cached response
immediately if one existed, and only kicked off a network fetch to update the cache "for
next time" - via `event.waitUntil()`, non-blocking. Since Next's client-side tab
navigations and the full-page redirect after a mutation are both plain same-origin GETs,
they hit this exact path: whatever was cached from the *previous* visit to that route got
served, not the fresh post-mutation data.

This is a real, fully general bug for a CRUD app, not an edge case - it would hit budgets,
categories, and settings the same way, any time you mutate something and then land on or
navigate to a page you'd visited before in that session.

## Fix

Switched `public/sw.js` to **network-first, cache-on-failure**: try the network first and
use that response (updating the cache as a side effect); only fall back to the cache if
the fetch itself fails (i.e., actually offline). This still satisfies this app's whole
reason for having a service worker (Phase 6's "installability + read-only cached viewing
of pages already visited") since the cache is still populated and still used - just only
as a fallback, never as the first answer while online.

## Verification

Re-ran the exact repro above against a fresh `next build` + `next start` on port 3001
(separate origin from the normal `:3000` dev server, so a clean, unregistered service
worker scope) with `caches.open()` + `keys()` checked via `javascript_tool` to confirm the
service worker was actually installed, controlling the page, and had cache entries before
trusting the visual result:

- Added an expense, landed on `/expenses` - the new row was there immediately (previously
  it was missing until a reload).
- Tapped the Home tab immediately after - the hero stat, category breakdown, and trend
  chart all reflected the new expense on the very first paint.

Did not re-verify the offline fallback path itself (confirmed on a real iPhone in Airplane
Mode back in Phase 6) since this fix only changes *when* the cache is consulted (on fetch
failure instead of always-first), not the fallback logic itself; did confirm via
`caches.keys()` that pages are still being written to the cache, so that fallback still has
something to serve.

Test expenses were added against both the local dev DB and the user's real production
account during reproduction/verification; both were deleted afterward.

## What shipped

| File | Change |
|---|---|
| `public/sw.js` | Stale-while-revalidate → network-first with cache-on-failure |
| `log files/implementation-plan.md` | Progress notes updated to describe the new strategy |
