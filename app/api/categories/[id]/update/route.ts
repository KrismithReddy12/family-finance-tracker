import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { categorySchema } from "@/lib/validation/category";
import { redirectWithFields } from "@/lib/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const existing = await db.category.findFirst({ where: { id, familyId: session.familyId } });
  if (!existing) {
    return NextResponse.redirect(new URL("/categories", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const fields = {
    name: formData.get("name"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  };
  const parsed = categorySchema.safeParse(fields);

  if (!parsed.success) {
    return redirectWithFields(request, `/categories/${id}/edit`, "INVALID_INPUT", fields);
  }

  const { name, icon, color } = parsed.data;

  await db.category.update({
    where: { id },
    data: { name, icon, color },
  });

  return NextResponse.redirect(new URL("/categories", request.url), { status: 303 });
}
