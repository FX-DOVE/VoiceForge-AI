"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { clearTokens, clearBackendToken } from "@/lib/auth-storage";
import { Loader2 } from "lucide-react";

// Routes that require email verification
const VERIFICATION_REQUIRED_ROUTES = [
  "/dashboard",
  "/studio",
  "/cloning",
  "/history",
  "/billing",
  "/settings",
];

// Routes that unverified users ARE allowed to access
const ALLOWED_UNVERIFIED_ROUTES = [
  "/verify-email",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated, isEmailVerified, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - let middleware handle the redirect
    if (!isAuthenticated) return;

    // Check if current route requires verification
    const requiresVerification = VERIFICATION_REQUIRED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if user is allowed on this route without verification
    const isAllowedUnverified = ALLOWED_UNVERIFIED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // If verification required and email not verified, LOGOUT and redirect to verification page
    if (requiresVerification && !isEmailVerified) {
      // Clear all tokens immediately before logout call
      clearTokens();
      clearBackendToken();
      logout(); // FORCE LOGOUT (will revoke refresh token on backend)
      const verifyUrl = new URL("/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", user?.email || "");
      window.location.href = verifyUrl.toString(); // Use window.location for hard redirect
      return;
    }

    // If verified and on verify-email page, redirect to dashboard
    if (isEmailVerified && pathname === "/verify-email") {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isEmailVerified, loading, pathname, router, user?.email, logout]);

  // Show loading state while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if we should block access
  const requiresVerification = VERIFICATION_REQUIRED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Block children rendering if unverified and on protected route
  if (requiresVerification && isAuthenticated && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-neutral-400">Please verify your email to continue...</p>
        </div>
      </div>
    );
  }

  return children;
}
