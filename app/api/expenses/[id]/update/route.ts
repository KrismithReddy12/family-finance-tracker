import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { expenseSchema } from "@/lib/validation/expense";
import { redirectWithFields } from "@/lib/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const existing = await db.expense.findFirst({ where: { id, familyId: session.familyId } });
  if (!existing) {
    return NextResponse.redirect(new URL("/expenses", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const fields = {
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    profileId: formData.get("profileId"),
    date: formData.get("date"),
    description: formData.get("description"),
    notes: formData.get("notes"),
    paymentMethod: formData.get("paymentMethod"),
  };
  const parsed = expenseSchema.safeParse(fields);

  if (!parsed.success) {
    return redirectWithFields(request, `/expenses/${id}/edit`, "INVALID_INPUT", fields);
  }

  const { amount, categoryId, profileId, date, description, notes, paymentMethod } = parsed.data;

  const [category, profile] = await Promise.all([
    db.category.findFirst({ where: { id: categoryId, familyId: session.familyId } }),
    db.profile.findFirst({ where: { id: profileId, familyId: session.familyId } }),
  ]);
  if (!category || !profile) {
    return redirectWithFields(request, `/expenses/${id}/edit`, "INVALID_INPUT", fields);
  }

  await db.expense.update({
    where: { id },
    data: {
      profileId,
      categoryId,
      amount,
      date: new Date(`${date}T00:00:00`),
      description,
      notes,
      paymentMethod,
    },
  });

  return NextResponse.redirect(new URL("/expenses", request.url), { status: 303 });
}
