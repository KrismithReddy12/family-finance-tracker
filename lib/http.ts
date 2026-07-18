import { NextRequest, NextResponse } from "next/server";

/** Redirects back to a form with an error code and the submitted values preserved as query params. */
export function redirectWithFields(
  request: NextRequest,
  pathname: string,
  error: string,
  fields: Record<string, FormDataEntryValue | null>
) {
  const params = new URLSearchParams({ error });
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && value) params.set(key, value);
  }
  return NextResponse.redirect(new URL(`${pathname}?${params.toString()}`, request.url), { status: 303 });
}
