import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/articles",
  "/authors",
  "/moderation-policy",
  "/reporting",
  "/terms",
  "/privacy",
  "/robots.txt",
  "/sitemap.xml",
];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );
  const isApiRoute = pathname.startsWith("/api");
  const isStaticRoute =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon");

  // Public, static, and API routes are always allowed through. Auth pages
  // validate sessions server-side to avoid cookie-only redirect loops.
  if (isPublicRoute || isApiRoute || isStaticRoute || pathname === "/") {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
