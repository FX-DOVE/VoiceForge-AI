import { apiRequest } from "./client";

export const authApi = {
  register: (body) => apiRequest("/auth/register", { method: "POST", body, skipAuth: true }),
  login: (body) => apiRequest("/auth/login", { method: "POST", body, skipAuth: true }),
  logout: (refreshToken) => apiRequest("/auth/logout", { method: "POST", body: refreshToken ? { refreshToken } : undefined }),
  me: () => apiRequest("/auth/me"),
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email }, skipAuth: true }),
  resetPassword: (body) =>
    apiRequest("/auth/reset-password", { method: "POST", body, skipAuth: true }),
  googleAuth: (idToken) => apiRequest("/auth/google", { method: "POST", body: { idToken }, skipAuth: true }),
};

export const usersApi = {
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (body) => apiRequest("/users/profile", { method: "PATCH", body }),
  markWelcomeModalSeen: () => apiRequest("/users/welcome-modal-seen", { method: "POST" }),
};

export const voicesApi = {
  list: (params = {}, { skipAuth = true } = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/voices${qs ? `?${qs}` : ""}`, { skipAuth });
  },
  getBySlug: (slug) => apiRequest(`/voices/${slug}`, { skipAuth: true }),
  preview: (slug) => apiRequest(`/voices/${slug}/preview`, { skipAuth: true }),
  listByProvider: (provider, params = {}, { skipAuth = true } = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/voices/provider/${provider}${qs ? `?${qs}` : ""}`, { skipAuth });
  },
  listByModel: (model, params = {}, { skipAuth = true } = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/voices/model/${model}${qs ? `?${qs}` : ""}`, { skipAuth });
  },
};

export const ttsApi = {
  generate: (body) => apiRequest("/tts/generate", { method: "POST", body }),
  get: (id) => apiRequest(`/tts/${id}`),
  history: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/tts/history${qs ? `?${qs}` : ""}`);
  },
  delete: (id) => apiRequest(`/tts/${id}`, { method: "DELETE" }),
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
  update: (id, body) => apiRequest(`/cloning/${id}`, { method: "PATCH", body }),
  delete: (id) => apiRequest(`/cloning/${id}`, { method: "DELETE" }),
  getShared: (token) => apiRequest(`/cloning/shared/${token}`, { skipAuth: true }),
};

export const usageApi = {
  summary: () => apiRequest("/usage/summary"),
};

export const paymentsApi = {
  initialize: (amount, refundPolicyAccepted) => apiRequest("/payments/paystack/initialize", { method: "POST", body: { amount, refundPolicyAccepted } }),
  verify: (reference) => apiRequest("/payments/paystack/verify", { method: "POST", body: { reference } }),
  estimate: (amount, provider) => apiRequest(`/payments/estimate?amount=${amount}${provider ? `&provider=${provider}` : ''}`),
  balance: () => apiRequest("/payments/balance"),
  claimGift: (token) => apiRequest("/payments/claim-gift", { method: "POST", body: { token } }),
};

export const adminApi = {
  dashboard: () => apiRequest("/admin/dashboard"),
  users: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateUser: (id, body) => apiRequest(`/admin/users/${id}`, { method: "PATCH", body }),
  banUser: (id, reason) => apiRequest(`/admin/users/${id}/ban`, { method: "POST", body: { reason } }),
  unbanUser: (id) => apiRequest(`/admin/users/${id}/unban`, { method: "POST" }),
  restrictUser: (id, reason, restrictions) => apiRequest(`/admin/users/${id}/restrict`, { method: "POST", body: { reason, restrictions } }),
  unrestrictUser: (id) => apiRequest(`/admin/users/${id}/unrestrict`, { method: "POST" }),
  deleteUser: (id, reason) => apiRequest(`/admin/users/${id}`, { method: "DELETE", body: { reason } }),
  addCredits: (id, credits, note, usdAmount) => apiRequest(`/admin/users/${id}/add-credits`, { method: "POST", body: { credits, note, usdAmount } }),
  systemHealth: () => apiRequest("/admin/system-health"),
  billing: () => apiRequest("/admin/billing"),
  settings: () => apiRequest("/admin/settings"),
  billingSettings: () => apiRequest("/admin/billing-settings"),
  updateBillingSettings: (body) => apiRequest("/admin/billing-settings", { method: "PUT", body }),
  billingProfiles: () => apiRequest("/admin/billing-profiles"),
  updateBillingProfile: (body) => apiRequest("/admin/billing-profiles", { method: "PUT", body }),
  ttsAnalytics: (period = "24h") => apiRequest(`/admin/tts-analytics?period=${period}`),
  getEmailTemplates: () => apiRequest("/admin/email-templates"),
  previewEmailTemplate: (id) => `/api/admin/email-templates/${id}/preview`,
  resetAllCredits: () => apiRequest("/admin/reset-all-credits", { method: "POST" }),
  sendGiftEmail: (body) => apiRequest("/admin/gift-email/send", { method: "POST", body }),
  getGiftCampaigns: () => apiRequest("/admin/gift-email/campaigns"),
};

export const notificationsApi = {
  list: () => apiRequest("/notifications"),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
};

export const professionalApi = {
  subscribe: (body = {}) => apiRequest("/professional/subscribe", { method: "POST", body }),
  status: () => apiRequest("/professional/status"),
  renew: () => apiRequest("/professional/renew", { method: "POST" }),
};

export const elevenlabsApi = {
  generate: (body) => apiRequest("/elevenlabs/generate", { method: "POST", body }),
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

export const contactApi = {
  submit: (body) => apiRequest("/contact", { method: "POST", body, skipAuth: true }),
};
