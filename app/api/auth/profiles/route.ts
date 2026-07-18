import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { createProfileSchema } from "@/lib/validation/profile";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const parsed = createProfileSchema.safeParse({
    name: formData.get("name"),
    avatarEmoji: formData.get("avatarEmoji"),
    avatarColor: formData.get("avatarColor"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/profiles?error=INVALID_PROFILE", request.url), { status: 303 });
  }

  await db.profile.create({
    data: { familyId: session.familyId, ...parsed.data },
  });

  return NextResponse.redirect(new URL("/profiles", request.url), { status: 303 });
}
