import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-secondary">Your family&apos;s spending at a glance.</p>
      </div>
      <Card className="p-6">
        <p className="text-sm text-ink-secondary">
          Expense tracking and charts are coming in the next phase. For now, this confirms you&apos;re
          logged in and the right profile is active.
        </p>
      </Card>
    </div>
  );
}
