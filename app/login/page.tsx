import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID: "That email or password isn't right. Try again.",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  PASSWORD_CHANGED: "Password changed. Log in with your new password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-4 py-12">
      <Card className="animate-fade-in w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-ink-secondary">Log in with your family account.</p>

        <form action="/api/auth/login" method="POST" className="mt-6 space-y-5">
          {message && (
            <div className="rounded-2xl border border-status-good/20 bg-status-good/10 px-4 py-3 text-sm font-medium text-status-good">
              {SUCCESS_MESSAGES[message] ?? "Done."}
            </div>
          )}
          <FormError>{error ? ERROR_MESSAGES[error] ?? "Something went wrong." : null}</FormError>

          <div>
            <Label htmlFor="email">Family email</Label>
            <Input id="email" name="email" type="email" placeholder="family@example.com" required autoFocus />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          New family?{" "}
          <Link href="/onboarding" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
