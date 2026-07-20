import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";
import { updateFamilyNameSchema } from "@/lib/validation/settings";
import { redirectWithFields } from "@/lib/http";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.activeProfileId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const fields = { familyName: formData.get("familyName") };
  const parsed = updateFamilyNameSchema.safeParse(fields);

  if (!parsed.success) {
    return redirectWithFields(request, "/settings", "INVALID_FAMILY_NAME", fields);
  }

  await db.family.update({
    where: { id: session.familyId },
    data: { name: parsed.data.familyName },
  });

  return NextResponse.redirect(new URL("/settings?success=FAMILY_NAME_UPDATED", request.url), { status: 303 });
}
