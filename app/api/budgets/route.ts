import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { budgetSchema } from "@/lib/validation/budget";
import { redirectWithFields } from "@/lib/http";
import { fromMonthInputValue } from "@/lib/format";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const fields = {
    categoryId: formData.get("categoryId"),
    periodStart: formData.get("periodStart"),
    amount: formData.get("amount"),
  };
  const parsed = budgetSchema.safeParse(fields);

  if (!parsed.success) {
    return redirectWithFields(request, "/budgets", "INVALID_INPUT", { ...fields, month: fields.periodStart });
  }

  const { categoryId, periodStart, amount } = parsed.data;

  const category = await db.category.findFirst({ where: { id: categoryId, familyId: session.familyId } });
  if (!category) {
    return redirectWithFields(request, "/budgets", "INVALID_INPUT", { ...fields, month: periodStart });
  }

  const periodDate = fromMonthInputValue(periodStart);

  await db.budget.upsert({
    where: {
      familyId_categoryId_periodStart: {
        familyId: session.familyId,
        categoryId,
        periodStart: periodDate,
      },
    },
    update: { amount },
    create: { familyId: session.familyId, categoryId, periodStart: periodDate, amount },
  });

  return NextResponse.redirect(new URL(`/budgets?month=${periodStart}`, request.url), { status: 303 });
}
