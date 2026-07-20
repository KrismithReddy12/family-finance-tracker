import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { IconColorPicker } from "@/components/categories/IconColorPicker";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "Please check the highlighted details and try again.",
};

export function CategoryForm({
  action,
  defaultValues,
  submitLabel,
  error,
}: {
  action: string;
  defaultValues?: { name?: string; icon?: string; color?: string };
  submitLabel: string;
  error?: string;
}) {
  return (
    <form action={action} method="POST" className="space-y-5">
      <FormError>{error ? (ERROR_MESSAGES[error] ?? "Something went wrong.") : null}</FormError>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Pet Care"
          maxLength={40}
          defaultValue={defaultValues?.name}
          required
          autoFocus
        />
      </div>

      <IconColorPicker defaultIcon={defaultValues?.icon} defaultColor={defaultValues?.color} />

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
