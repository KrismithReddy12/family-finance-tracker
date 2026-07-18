/**
 * Default categories seeded for every new family. Colors are drawn from the
 * app's validated categorical palette (app/globals.css --series-1..8) in a
 * fixed, non-cycled order; the two lowest-priority buckets use the neutral
 * muted ink instead of consuming a categorical slot.
 */
export const DEFAULT_CATEGORIES = [
  { name: "Groceries", icon: "shopping-cart", color: "var(--series-2)" },
  { name: "Dining Out", icon: "utensils", color: "var(--series-6)" },
  { name: "Transport", icon: "car", color: "var(--series-1)" },
  { name: "Utilities", icon: "bolt", color: "var(--series-4)" },
  { name: "Entertainment", icon: "film", color: "var(--series-7)" },
  { name: "Housing", icon: "home", color: "var(--series-5)" },
  { name: "Healthcare", icon: "heart-pulse", color: "var(--series-8)" },
  { name: "Shopping", icon: "shopping-bag", color: "var(--series-3)" },
  { name: "Subscriptions", icon: "repeat", color: "var(--ink-muted)" },
  { name: "Other", icon: "tag", color: "var(--ink-muted)" },
] as const;
