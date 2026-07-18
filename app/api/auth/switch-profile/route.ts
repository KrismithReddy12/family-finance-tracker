import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const profileId = formData.get("profileId");
  if (typeof profileId !== "string" || !profileId) {
    return NextResponse.redirect(new URL("/profiles", request.url), { status: 303 });
  }

  const profile = await db.profile.findFirst({
    where: { id: profileId, familyId: session.familyId },
  });
  if (!profile) {
    return NextResponse.redirect(new URL("/profiles", request.url), { status: 303 });
  }

  await setSessionCookie({ familyId: session.familyId, activeProfileId: profile.id });

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}
