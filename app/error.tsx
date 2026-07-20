"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <Card className="animate-fade-in w-full max-w-md p-8 text-center">
        <p className="text-3xl">😵</p>
        <h1 className="font-display mt-3 text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-1 text-sm text-ink-secondary">That&apos;s on us, not you. Try again, or start over.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <LinkButton href="/" variant="secondary">
            Start over
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
