/**
 * Default categories seeded for every new family. Colors are drawn from the
 * app's validated categorical palette (app/globals.css --series-1..8) in a
 * fixed, non-cycled order; the two lowest-priority buckets use the neutral
 * muted ink instead of consuming a categorical slot. Icons are emoji, shown
 * as small colored badges throughout the UI.
 */
export const DEFAULT_CATEGORIES = [
  { name: "Groceries", icon: "🛒", color: "var(--series-2)" },
  { name: "Dining Out", icon: "🍽️", color: "var(--series-6)" },
  { name: "Transport", icon: "🚗", color: "var(--series-1)" },
  { name: "Utilities", icon: "💡", color: "var(--series-4)" },
  { name: "Entertainment", icon: "🎬", color: "var(--series-7)" },
  { name: "Housing", icon: "🏠", color: "var(--series-5)" },
  { name: "Healthcare", icon: "🩺", color: "var(--series-8)" },
  { name: "Shopping", icon: "🛍️", color: "var(--series-3)" },
  { name: "Subscriptions", icon: "🔁", color: "var(--ink-muted)" },
  { name: "Other", icon: "🏷️", color: "var(--ink-muted)" },
] as const;
