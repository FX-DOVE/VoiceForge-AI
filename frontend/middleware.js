import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/studio",
  "/voices",
  "/cloning",
  "/history",
  "/billing",
  "/settings",
  "/checkout",
  "/success",
  "/admin",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("vf_session")?.value;

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/studio/:path*",
    "/voices/:path*",
    "/cloning/:path*",
    "/history/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/checkout/:path*",
    "/success/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
