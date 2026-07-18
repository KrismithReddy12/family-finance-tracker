import { NextRequest, NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  await setSessionCookie({ familyId: session.familyId, activeProfileId: null });

  return NextResponse.redirect(new URL("/profiles", request.url), { status: 303 });
}
