import { API_URL } from "./config";
import { getTokens } from "../auth-storage";

export class ApiError extends Error {
  constructor(message, status = 500, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    formData,
    token,
    skipAuth = false,
  } = options;

  const headers = {};
  if (!formData) headers["Content-Type"] = "application/json";

  const accessToken =
    token ?? (typeof window !== "undefined" && !skipAuth ? getTokens().accessToken : null);
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData ?? (body ? JSON.stringify(body) : undefined),
    credentials: "include",
  });

  let json = {};
  try {
    json = await res.json();
  } catch {
    /* non-json response */
  }

  if (!res.ok) {
    throw new ApiError(
      json.message || "Something went wrong. Please try again.",
      res.status,
      json.errors || {}
    );
  }

  return json.data ?? json;
}
