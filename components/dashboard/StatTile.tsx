import { Card } from "@/components/ui/Card";

export function StatTile({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: { text: string; isGood: boolean } | null;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">{label}</p>
      <p
        className="font-display mt-1 text-2xl font-semibold text-ink"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      {delta && (
        <p className={`mt-1 text-xs font-medium ${delta.isGood ? "text-success" : "text-status-critical"}`}>
          {delta.text}
        </p>
      )}
      {hint && !delta && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </Card>
  );
}
