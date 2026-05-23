import { NextResponse } from "next/server";

// Read from env or default to non-www
const CANONICAL_HOST = process.env.NEXT_PUBLIC_SITE_URL 
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname 
  : "voiceforgeai.site";

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
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("vf_session")?.value;

  // 1. Canonical Domain & HTTPS Enforcement (in production)
  if (process.env.NODE_ENV === "production") {
    let urlChanged = false;
    const newUrl = request.nextUrl.clone();

    // Force HTTPS (Next.js usually handles this behind proxies, but good to be explicit if direct)
    if (newUrl.protocol === "http:" && !newUrl.hostname.includes("localhost")) {
      newUrl.protocol = "https:";
      urlChanged = true;
    }

    // Force canonical host
    if (newUrl.hostname !== "localhost" && newUrl.hostname !== CANONICAL_HOST) {
      newUrl.hostname = CANONICAL_HOST;
      urlChanged = true;
    }

    if (urlChanged) {
      return NextResponse.redirect(newUrl, 301);
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
