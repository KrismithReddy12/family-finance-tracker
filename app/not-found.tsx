import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <Card className="animate-fade-in w-full max-w-md p-8 text-center">
        <p className="text-3xl">🔍</p>
        <h1 className="font-display mt-3 text-lg font-semibold text-ink">Page not found</h1>
        <p className="mt-1 text-sm text-ink-secondary">The page you&apos;re looking for doesn&apos;t exist or moved.</p>
        <LinkButton href="/" className="mt-6">
          Take me home
        </LinkButton>
      </Card>
    </main>
  );
}
