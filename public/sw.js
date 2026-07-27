// Family Finance service worker.
//
// Scope, deliberately: installability + read-only cached viewing of pages
// already visited. No offline write queue - iOS Safari doesn't support the
// Background Sync API, so an offline expense-entry queue would be unreliable
// on the one platform this app targets. Mutations (POST) are always
// network-only; the offline-form guard (see components/pwa) stops them from
// even being attempted while offline, so this worker never has to reason
// about failed writes.
//
// Same-origin GETs are network-first, cache-on-failure - NOT
// stale-while-revalidate. This app is data-CRUD (add/edit/delete an expense,
// set a budget, ...), so a page you navigate to right after a mutation must
// show the fresh result immediately, not whatever was cached from the last
// time you viewed it. The cache exists purely as an offline fallback: it's
// only ever read when the network fetch actually fails.
const CACHE_NAME = "family-finance-v1";

const OFFLINE_FALLBACK_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Offline - Family Finance</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #fff8ee; color: #3d2530;
    display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
  p { color: #8a6d76; margin: 8px 0 0; }
</style>
</head>
<body>
  <div>
    <h1 style="margin:0">You're offline</h1>
    <p>This page hasn't been viewed yet, so it isn't available offline. Reconnect and try again.</p>
  </div>
</body>
</html>`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Mutations and cross-origin requests pass straight through - only
  // same-origin GETs (the app shell, page navigations, list views) are
  // cached, per the stale-while-revalidate strategy below.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        // Actually offline (or the request otherwise failed) - fall back to
        // whatever was last cached for this exact request.
        const cached = await cache.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          return new Response(OFFLINE_FALLBACK_HTML, {
            status: 503,
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response("Offline", { status: 503 });
      }
    })
  );
});
