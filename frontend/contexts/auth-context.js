"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api";
import { clearTokens, clearBackendToken, setTokens } from "@/lib/auth-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    
    // If user is not verified, redirect to verify-email page
    if (!data.user.emailVerified) {
      const verifyUrl = new URL("/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", data.user.email || "");
      window.location.href = verifyUrl.toString();
      return data.user;
    }
    
    return data.user;
  }, []);

  const register = useCallback(async ({ email, password, name, termsAccepted, termsVersion }) => {
    const data = await authApi.register({ email, password, name, termsAccepted, termsVersion });
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    
    // After registration, redirect to verify-email page
    const verifyUrl = new URL("/verify-email", window.location.origin);
    verifyUrl.searchParams.set("email", data.user.email || "");
    window.location.href = verifyUrl.toString();
    
    // Return full data including welcomeCreditsGranted flag
    return { user: data.user, welcomeCreditsGranted: data.welcomeCreditsGranted, welcomeCreditsAmount: data.welcomeCreditsAmount };
  }, []);

  const logout = useCallback(() => {
    // Get tokens before clearing
    const { refreshToken } = getTokens();
    
    // Clear tokens immediately (don't wait for backend)
    clearTokens();
    clearBackendToken();
    setUser(null);
    
    // Fire backend logout with refresh token to revoke it
    authApi.logout(refreshToken).catch(() => {});
  }, []);

  // Function to update user data locally (e.g., after email verification)
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Force logout unverified users (except on verify-email page)
  useEffect(() => {
    if (!loading && user && !user.emailVerified) {
      // Check if we're on the verify-email page
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/verify-email" && !currentPath.startsWith("/verify-email")) {
          // Force logout and redirect to verify-email
          logout();
          const verifyUrl = new URL("/verify-email", window.location.origin);
          verifyUrl.searchParams.set("email", user.email || "");
          window.location.href = verifyUrl.toString();
        }
      }
    }
  }, [user, loading, logout]);

  // Periodic check every 5 seconds to catch any edge cases
  useEffect(() => {
    if (loading || !user) return;
    
    const interval = setInterval(() => {
      if (!user.emailVerified) {
        const currentPath = window.location.pathname;
        if (currentPath !== "/verify-email" && !currentPath.startsWith("/verify-email")) {
          logout();
          const verifyUrl = new URL("/verify-email", window.location.origin);
          verifyUrl.searchParams.set("email", user.email || "");
          window.location.href = verifyUrl.toString();
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, loading, logout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isEmailVerified: user?.emailVerified || false,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, loading, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
