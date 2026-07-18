import { NextRequest, NextResponse } from "next/server";
import { readSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const PROFILE_REQUIRED_PREFIXES = [
  "/dashboard",
  "/expenses",
  "/budgets",
  "/categories",
  "/insights",
  "/settings",
];
const FAMILY_ONLY_PATHS = ["/profiles"];
const AUTH_ENTRY_PATHS = ["/login", "/onboarding"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;

  const requiresProfile = PROFILE_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const requiresFamily = requiresProfile || FAMILY_ONLY_PATHS.includes(pathname);

  if (requiresFamily && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (requiresProfile && session && !session.activeProfileId) {
    return NextResponse.redirect(new URL("/profiles", request.url));
  }

  if (AUTH_ENTRY_PATHS.includes(pathname) && session?.activeProfileId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/budgets/:path*",
    "/categories/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/profiles",
    "/login",
    "/onboarding",
  ],
};
