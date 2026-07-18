import { z } from "zod";
import { AVATAR_EMOJIS, AVATAR_COLORS } from "@/lib/avatarOptions";

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  avatarEmoji: z.enum([...AVATAR_EMOJIS]),
  avatarColor: z.enum([...AVATAR_COLORS]),
});
