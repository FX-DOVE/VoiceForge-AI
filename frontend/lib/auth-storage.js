const ACCESS_KEY = "vf_access_token";
const REFRESH_KEY = "vf_refresh_token";
const SESSION_COOKIE = "vf_session";
const TOKEN_COOKIE = "token";

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_FLAGS = isProduction ? "; Secure; SameSite=None" : "; SameSite=Lax";

export function getTokens() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: window.localStorage.getItem(ACCESS_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_KEY),
  };
}

export function setTokens({ accessToken, refreshToken }) {
  if (typeof window === "undefined") return;
  if (accessToken) window.localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}${COOKIE_FLAGS}`;
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.sessionStorage?.removeItem(SESSION_COOKIE);
  // Clear frontend session cookie
  document.cookie = `${SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${COOKIE_FLAGS}`;
}

/**
 * Clear the backend HTTP-only token cookie.
 * This is a best-effort client-side cleanup; the backend logout endpoint
 * is the authoritative way to clear the cookie.
 */
export function clearBackendToken() {
  if (typeof window === "undefined") return;
  // Attempt to clear the backend token cookie with production-safe flags
  document.cookie = `${TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${COOKIE_FLAGS}`;
}
