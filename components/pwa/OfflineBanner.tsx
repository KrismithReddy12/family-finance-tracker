"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

/** Persistent banner driven by navigator.onLine - the app's single source of truth for "you can view cached pages but can't save changes right now." */
export function OfflineBanner() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div className="bg-status-warning px-4 py-2 text-center text-sm font-semibold text-ink" role="status">
      You&apos;re offline. Pages you&apos;ve already viewed still work, but changes can&apos;t be saved right now.
    </div>
  );
}
