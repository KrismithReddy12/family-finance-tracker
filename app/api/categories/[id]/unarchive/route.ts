import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const existing = await db.category.findFirst({ where: { id, familyId: session.familyId } });
  if (existing && existing.archivedAt) {
    await db.category.update({ where: { id }, data: { archivedAt: null } });
  }

  return NextResponse.redirect(new URL("/categories", request.url), { status: 303 });
}
