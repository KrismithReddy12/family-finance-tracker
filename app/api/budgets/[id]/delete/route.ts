import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { toMonthInputValue } from "@/lib/format";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const existing = await db.budget.findFirst({ where: { id, familyId: session.familyId } });
  if (!existing) {
    return NextResponse.redirect(new URL("/budgets", request.url), { status: 303 });
  }

  await db.budget.delete({ where: { id } });

  const month = toMonthInputValue(existing.periodStart);
  return NextResponse.redirect(new URL(`/budgets?month=${month}`, request.url), { status: 303 });
}
