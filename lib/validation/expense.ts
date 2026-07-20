import { z } from "zod";

export const PAYMENT_METHODS = ["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"] as const;

export const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  CASH: "Cash",
  CREDIT_CARD: "Credit card",
  DEBIT_CARD: "Debit card",
  BANK_TRANSFER: "Bank transfer",
  OTHER: "Other",
};

// Kept as a string throughout validation (never coerced to a JS number) so
// money is never routed through floating point before it reaches Postgres.
export const decimalAmount = z
  .string()
  .trim()
  .regex(/^\d{1,9}(\.\d{1,2})?$/, "Enter a valid amount, e.g. 12.50")
  .refine((value) => Number(value) > 0, "Amount must be greater than 0");

/**
 * FormData.get() returns null (not undefined) for absent fields, which
 * z.optional() doesn't treat as absent. Preprocessing to "" first makes
 * null, undefined, and "" all resolve the same way for optional fields.
 */
function optionalText(max: number) {
  return z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().max(max)
  ).transform((v) => (v ? v : undefined));
}

const optionalPaymentMethod = z.preprocess(
  (v) => (typeof v === "string" && v ? v : undefined),
  z.enum(PAYMENT_METHODS).optional()
);

export const expenseSchema = z.object({
  amount: decimalAmount,
  categoryId: z.string().min(1, "Choose a category"),
  profileId: z.string().min(1, "Choose who this expense is for"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date"),
  description: optionalText(140),
  notes: optionalText(2000),
  paymentMethod: optionalPaymentMethod,
});
