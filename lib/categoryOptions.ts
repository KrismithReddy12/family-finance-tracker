/**
 * Selectable icon/color options for the category icon+color picker.
 * Colors reuse the app's validated categorical palette (app/globals.css
 * --series-1..8) so category badges stay visually consistent with charts.
 */
export const CATEGORY_ICONS = [
  "🛒", "🍽️", "🚗", "💡", "🎬", "🏠", "🩺", "🛍️",
  "🔁", "🏷️", "📚", "✈️", "🎁", "🐾", "💇", "🏋️",
  "☕", "🎮", "👶", "🧾",
] as const;

export const CATEGORY_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
] as const;
