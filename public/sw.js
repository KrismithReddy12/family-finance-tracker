// Family Finance service worker.
//
// Scope, deliberately: installability + read-only cached viewing of pages
// already visited. No offline write queue - iOS Safari doesn't support the
// Background Sync API, so an offline expense-entry queue would be unreliable
// on the one platform this app targets. Mutations (POST) are always
// network-only; the offline-form guard (see components/pwa) stops them from
// even being attempted while offline, so this worker never has to reason
// about failed writes.
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
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null);

      if (cached) {
        // Serve the cached copy immediately; refresh the cache in the
        // background without blocking this response.
        event.waitUntil(networkFetch);
        return cached;
      }

      const networkResponse = await networkFetch;
      if (networkResponse) return networkResponse;

      if (request.mode === "navigate") {
        return new Response(OFFLINE_FALLBACK_HTML, {
          status: 503,
          headers: { "Content-Type": "text/html" },
        });
      }
      return new Response("Offline", { status: 503 });
    })
  );
});
