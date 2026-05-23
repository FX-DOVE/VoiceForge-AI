const isProd = process.env.NODE_ENV === "production";

export const API_URL = isProd
  ? (process.env.NEXT_PUBLIC_API_URL || "/api")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export function getApiOrigin() {
  const stripped = API_URL.replace(/\/api\/?$/, "");
  // If API_URL is a relative path like "/api", stripped is empty — use current origin
  if (!stripped || stripped.startsWith("/")) {
    return typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
  }
  return stripped || "http://localhost:5000";
}

export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const origin = getApiOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getApiUrl() {
  return API_URL;
}
