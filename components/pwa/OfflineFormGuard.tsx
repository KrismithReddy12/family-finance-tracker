"use client";

import { useEffect } from "react";

/**
 * Stops mutating form submissions (add/edit/delete expense, switch profile,
 * etc.) from being attempted while offline - a failed network POST here
 * would otherwise either hang or hand the user the browser's own offline
 * interstitial, discarding whatever they typed. Blocking the submit instead
 * leaves the form's inputs untouched, and the persistent OfflineBanner
 * already explains why nothing happened.
 */
export function OfflineFormGuard() {
  useEffect(() => {
    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const method = (form.getAttribute("method") ?? "get").toLowerCase();
      if (method !== "post" || navigator.onLine) return;

      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);

  return null;
}
