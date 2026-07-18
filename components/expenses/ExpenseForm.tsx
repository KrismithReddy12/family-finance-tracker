import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/validation/expense";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "Please check the highlighted details and try again.",
};

type Category = { id: string; name: string; archivedAt: Date | null };
type Profile = { id: string; name: string };

export function ExpenseForm({
  action,
  categories,
  profiles,
  defaultValues,
  submitLabel,
  error,
}: {
  action: string;
  categories: Category[];
  profiles: Profile[];
  defaultValues?: {
    amount?: string;
    categoryId?: string;
    profileId?: string;
    date?: string;
    description?: string;
    notes?: string;
    paymentMethod?: string;
  };
  submitLabel: string;
  error?: string;
}) {
  return (
    <form action={action} method="POST" className="space-y-5">
      <FormError>{error ? (ERROR_MESSAGES[error] ?? "Something went wrong.") : null}</FormError>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            pattern="^\d{1,9}(\.\d{1,2})?$"
            placeholder="0.00"
            defaultValue={defaultValues?.amount}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={defaultValues?.date} required />
        </div>
      </div>

      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select id="categoryId" name="categoryId" defaultValue={defaultValues?.categoryId ?? ""} required>
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.archivedAt ? " (archived)" : ""}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="profileId">Who&apos;s this for</Label>
        <Select id="profileId" name="profileId" defaultValue={defaultValues?.profileId ?? ""} required>
          <option value="" disabled>
            Choose a profile
          </option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="e.g. Weekly grocery run"
          maxLength={140}
          defaultValue={defaultValues?.description}
        />
      </div>

      <div>
        <Label htmlFor="paymentMethod">Payment method</Label>
        <Select id="paymentMethod" name="paymentMethod" defaultValue={defaultValues?.paymentMethod ?? ""}>
          <option value="">Not specified</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={defaultValues?.notes}
          placeholder="Optional details"
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
