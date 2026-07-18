import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth-session";
import { loginSchema } from "@/lib/validation/family";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/login?error=INVALID", request.url), { status: 303 });
  }

  const { email, password } = parsed.data;
  const family = await db.family.findUnique({ where: { email } });
  if (!family) {
    return NextResponse.redirect(new URL("/login?error=INVALID", request.url), { status: 303 });
  }

  const valid = await verifyPassword(password, family.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=INVALID", request.url), { status: 303 });
  }

  await setSessionCookie({ familyId: family.id, activeProfileId: null });

  return NextResponse.redirect(new URL("/profiles", request.url), { status: 303 });
}
