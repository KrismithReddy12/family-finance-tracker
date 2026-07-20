import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="animate-fade-in w-full max-w-md p-8 text-center">
        <p className="text-3xl">🔍</p>
        <h1 className="font-display mt-3 text-lg font-semibold text-ink">Not found</h1>
        <p className="mt-1 text-sm text-ink-secondary">That item doesn&apos;t exist or you don&apos;t have access to it.</p>
        <LinkButton href="/dashboard" className="mt-6">
          Back to dashboard
        </LinkButton>
      </Card>
    </div>
  );
}
