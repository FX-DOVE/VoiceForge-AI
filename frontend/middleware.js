import { NextResponse } from "next/server";

// Fully configurable canonical host for Docker/VPS/custom domain deploys.
// Set NEXT_PUBLIC_SITE_URL in your build (docker-compose build args or .env).
// Falls back to a sensible default only for local development.
const getCanonicalHost = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      // malformed env, ignore
    }
  }
  // Local dev fallback only
  return "localhost";
};

const CANONICAL_HOST = getCanonicalHost();

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/studio",
  "/cloning",
  "/history",
  "/billing",
  "/settings",
  "/checkout",
  "/success",
  "/admin",
  "/claim-credits",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("vf_session")?.value;

  // 1. Canonical Domain & HTTPS Enforcement (in production)
  if (process.env.NODE_ENV === "production") {
    const host = request.nextUrl.hostname;

    // Skip enforcement for internal/loopback requests (Docker healthchecks, etc.)
    const isInternal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0" ||
      host.startsWith("10.") ||
      host.startsWith("172.") ||
      host.startsWith("192.168.");

    if (!isInternal) {
      let urlChanged = false;
      const newUrl = request.nextUrl.clone();

      // Force HTTPS
      if (newUrl.protocol === "http:") {
        newUrl.protocol = "https:";
        urlChanged = true;
      }

      // Force canonical host
      if (host !== CANONICAL_HOST) {
        newUrl.hostname = CANONICAL_HOST;
        urlChanged = true;
      }

      if (urlChanged) {
        return NextResponse.redirect(newUrl, 301);
      }
    }
  }

  // 2. Auth logic
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
