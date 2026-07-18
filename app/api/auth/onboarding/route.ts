import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth-session";
import { onboardingSchema } from "@/lib/validation/family";
import { DEFAULT_CATEGORIES } from "@/lib/defaultCategories";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = onboardingSchema.safeParse({
    familyName: formData.get("familyName"),
    email: formData.get("email"),
    password: formData.get("password"),
    profileName: formData.get("profileName"),
    avatarEmoji: formData.get("avatarEmoji"),
    avatarColor: formData.get("avatarColor"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/onboarding?error=INVALID_INPUT", request.url), { status: 303 });
  }

  const { familyName, email, password, profileName, avatarEmoji, avatarColor } = parsed.data;

  const existing = await db.family.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.redirect(new URL("/onboarding?error=EMAIL_TAKEN", request.url), { status: 303 });
  }

  const passwordHash = await hashPassword(password);

  const { family, profile } = await db.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: { name: familyName, email, passwordHash },
    });
    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({
        familyId: family.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        isDefault: true,
      })),
    });
    const profile = await tx.profile.create({
      data: { familyId: family.id, name: profileName, avatarEmoji, avatarColor },
    });
    return { family, profile };
  });

  await setSessionCookie({ familyId: family.id, activeProfileId: profile.id });

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}
