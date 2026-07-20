import type { Insight } from "@/lib/insights/engine";

const SEVERITY_STYLES: Record<Insight["severity"], { color: string; label: string }> = {
  critical: { color: "var(--status-critical)", label: "Alert" },
  warning: { color: "var(--status-warning)", label: "Watch" },
  info: { color: "var(--ink-secondary)", label: "Note" },
  positive: { color: "var(--status-good)", label: "Nice" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const style = SEVERITY_STYLES[insight.severity];

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-hairline bg-surface px-4 py-3 shadow-[3px_3px_0_var(--hairline)]">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-lg"
        style={{ borderColor: style.color, backgroundColor: `color-mix(in oklab, ${style.color} 16%, var(--surface))` }}
      >
        {insight.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-ink">{insight.title}</p>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
            style={{ color: style.color, backgroundColor: `color-mix(in oklab, ${style.color} 14%, var(--surface))` }}
          >
            {style.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-ink-secondary">{insight.detail}</p>
      </div>
    </div>
  );
}
