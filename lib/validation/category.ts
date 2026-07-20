import { z } from "zod";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/categoryOptions";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  icon: z.enum([...CATEGORY_ICONS]),
  color: z.enum([...CATEGORY_COLORS]),
});
