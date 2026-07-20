"use client";

import { useEffect } from "react";

/** Registers the service worker in production only - dev mode stays uncached so edits show up immediately. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline viewing is a progressive enhancement - a failed registration
      // shouldn't surface as a user-facing error.
    });
  }, []);

  return null;
}
