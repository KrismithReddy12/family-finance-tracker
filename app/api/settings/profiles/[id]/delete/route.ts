import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth-session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const profile = await db.profile.findFirst({ where: { id, familyId: session.familyId } });
  if (!profile) {
    return NextResponse.redirect(new URL("/settings", request.url), { status: 303 });
  }

  const [profileCount, expenseCount] = await Promise.all([
    db.profile.count({ where: { familyId: session.familyId } }),
    db.expense.count({ where: { profileId: id } }),
  ]);

  if (profileCount <= 1) {
    return NextResponse.redirect(new URL("/settings?error=LAST_PROFILE", request.url), { status: 303 });
  }
  if (expenseCount > 0) {
    return NextResponse.redirect(new URL("/settings?error=PROFILE_HAS_EXPENSES", request.url), { status: 303 });
  }

  await db.profile.delete({ where: { id } });

  if (session.activeProfileId === id) {
    await setSessionCookie({ familyId: session.familyId, activeProfileId: null });
    return NextResponse.redirect(new URL("/profiles", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/settings", request.url), { status: 303 });
}
