import { z } from "zod";
import { AVATAR_EMOJIS, AVATAR_COLORS } from "@/lib/avatarOptions";

export const onboardingSchema = z.object({
  familyName: z.string().trim().min(1, "Family name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  profileName: z.string().trim().min(1, "Your name is required").max(40),
  avatarEmoji: z.enum([...AVATAR_EMOJIS]),
  avatarColor: z.enum([...AVATAR_COLORS]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
