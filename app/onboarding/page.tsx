import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { AvatarPicker } from "@/components/profiles/AvatarPicker";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "Please check your details and try again.",
  EMAIL_TAKEN: "An account with that email already exists. Try logging in instead.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-4 py-12">
      <Card className="animate-fade-in w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Create your family account 🎉</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          One login for the whole family. Everyone gets their own profile once you&apos;re in.
        </p>

        <form action="/api/auth/onboarding" method="POST" className="mt-6 space-y-5">
          <FormError>{error ? ERROR_MESSAGES[error] ?? "Something went wrong." : null}</FormError>

          <div>
            <Label htmlFor="familyName">Family name</Label>
            <Input id="familyName" name="familyName" placeholder="The Rogers Family" required maxLength={80} />
          </div>

          <div>
            <Label htmlFor="email">Family email</Label>
            <Input id="email" name="email" type="email" placeholder="family@example.com" required />
          </div>

          <div>
            <Label htmlFor="password">Family password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
            <p className="mt-1 text-xs text-ink-muted">At least 8 characters. Shared by everyone in the family.</p>
          </div>

          <hr className="border-hairline" />

          <div>
            <Label htmlFor="profileName">Your name</Label>
            <Input id="profileName" name="profileName" placeholder="Your first name" required maxLength={40} />
          </div>

          <AvatarPicker />

          <Button type="submit" className="w-full">
            Create family account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already have a family account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
