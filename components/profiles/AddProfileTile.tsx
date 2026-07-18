import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AvatarPicker } from "@/components/profiles/AvatarPicker";

export function AddProfileTile() {
  return (
    <details className="group open:col-span-full">
      <summary className="flex cursor-pointer list-none flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-hairline-strong text-3xl text-ink-muted transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
          +
        </span>
        <span className="text-sm font-medium text-ink-secondary">Add profile</span>
      </summary>

      <Card className="animate-fade-in mt-4 w-full max-w-md p-6">
        <form action="/api/auth/profiles" method="POST" className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Family member's name" required maxLength={40} autoFocus />
          </div>
          <AvatarPicker />
          <Button type="submit">Add profile</Button>
        </form>
      </Card>
    </details>
  );
}
