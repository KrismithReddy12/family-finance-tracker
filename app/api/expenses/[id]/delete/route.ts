import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const existing = await db.expense.findFirst({ where: { id, familyId: session.familyId } });
  if (existing) {
    await db.expense.delete({ where: { id } });
  }

  return NextResponse.redirect(new URL("/expenses", request.url), { status: 303 });
}
