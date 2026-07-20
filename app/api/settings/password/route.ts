import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, clearSessionCookie } from "@/lib/auth-session";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation/settings";

// Deliberately never uses redirectWithFields here - unlike other forms,
// password values must never round-trip through a query string (server
// logs, browser history). Errors redirect with just an error code.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/settings?error=INVALID_PASSWORD", request.url), { status: 303 });
  }

  const family = await db.family.findUnique({ where: { id: session.familyId } });
  if (!family) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const valid = await verifyPassword(parsed.data.currentPassword, family.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL("/settings?error=WRONG_PASSWORD", request.url), { status: 303 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.family.update({ where: { id: session.familyId }, data: { passwordHash } });

  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login?message=PASSWORD_CHANGED", request.url), { status: 303 });
}
