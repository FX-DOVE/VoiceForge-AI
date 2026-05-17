import { apiRequest } from "./client";

export const authApi = {
  register: (body) => apiRequest("/auth/register", { method: "POST", body, skipAuth: true }),
  login: (body) => apiRequest("/auth/login", { method: "POST", body, skipAuth: true }),
  me: () => apiRequest("/auth/me"),
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email }, skipAuth: true }),
  resetPassword: (body) =>
    apiRequest("/auth/reset-password", { method: "POST", body, skipAuth: true }),
};

export const usersApi = {
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (body) => apiRequest("/users/profile", { method: "PATCH", body }),
};

export const voicesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/voices${qs ? `?${qs}` : ""}`, { skipAuth: true });
  },
  get: (slug) => apiRequest(`/voices/${slug}`, { skipAuth: true }),
  preview: (slug) => apiRequest(`/voices/${slug}/preview`, { skipAuth: true }),
};

export const ttsApi = {
  generate: (body) => apiRequest("/tts/generate", { method: "POST", body }),
  get: (id) => apiRequest(`/tts/${id}`),
  history: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/tts/history${qs ? `?${qs}` : ""}`);
  },
};

export const cloningApi = {
  upload: (files, cloneId) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("samples", file));
    if (cloneId) formData.append("cloneId", cloneId);
    return apiRequest("/cloning/upload", { method: "POST", formData });
  },
  configure: (body) => apiRequest("/cloning/configure", { method: "POST", body }),
  start: (cloneId) => apiRequest("/cloning/start", { method: "POST", body: { cloneId } }),
  list: () => apiRequest("/cloning"),
  status: (id) => apiRequest(`/cloning/${id}/status`),
};

export const usageApi = {
  summary: () => apiRequest("/usage/summary"),
};

export const paymentsApi = {
  purchase: (amount) => apiRequest("/payments/purchase", { method: "POST", body: { amount } }),
  estimate: (amount) => apiRequest(`/payments/estimate?amount=${amount}`),
  balance: () => apiRequest("/payments/balance"),
};

export const adminApi = {
  dashboard: () => apiRequest("/admin/dashboard"),
  users: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateUser: (id, body) => apiRequest(`/admin/users/${id}`, { method: "PATCH", body }),
  systemHealth: () => apiRequest("/admin/system-health"),
  billing: () => apiRequest("/admin/billing"),
  settings: () => apiRequest("/admin/settings"),
};

export const notificationsApi = {
  list: () => apiRequest("/notifications"),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
};

export const filesApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/files/upload", { method: "POST", formData });
  },
};

export const healthApi = {
  check: () => apiRequest("/health", { skipAuth: true }),
};
