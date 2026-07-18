import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AvatarPicker } from "@/components/profiles/AvatarPicker";

export function AddProfileTile() {
  return (
    <details className="group open:col-span-full">
      <summary className="flex cursor-pointer list-none flex-col items-center gap-3 rounded-3xl p-4 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-105 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-dashed border-hairline-strong text-3xl text-ink-muted transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
          +
        </span>
        <span className="font-display text-sm font-semibold text-ink-secondary">Add profile</span>
      </summary>

      <Card className="animate-fade-in mt-4 w-full max-w-md p-6">
        <form action="/api/auth/profiles" method="POST" className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Family member's name" required maxLength={40} autoFocus />
          </div>
          <AvatarPicker />
          <Button type="submit">➕ Add profile</Button>
        </form>
      </Card>
    </details>
  );
}
