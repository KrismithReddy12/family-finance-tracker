import { z } from "zod";
import { decimalAmount } from "@/lib/validation/expense";

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Choose a category"),
  periodStart: z.string().regex(/^\d{4}-\d{2}$/, "Choose a valid month"),
  amount: decimalAmount,
});
