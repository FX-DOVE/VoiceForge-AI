import { apiRequest } from "./client";

export const grokApi = {
  // Dashboard
  getDashboardStats: () => apiRequest("/admin/grok/dashboard"),
  checkBalance: () => apiRequest("/admin/grok/check-balance"),
  
  // Funding
  listFundings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/grok/funding${qs ? `?${qs}` : ""}`);
  },
  addFunding: (body) => apiRequest("/admin/grok/funding", { method: "POST", body }),
  updateFunding: (id, body) => apiRequest(`/admin/grok/funding/${id}`, { method: "PATCH", body }),
  deleteFunding: (id) => apiRequest(`/admin/grok/funding/${id}`, { method: "DELETE" }),
  
  // Usage
  listUsage: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/grok/usage${qs ? `?${qs}` : ""}`);
  },
  recordUsage: (body) => apiRequest("/admin/grok/usage", { method: "POST", body }),
  
  // API Keys
  listApiKeys: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/grok/api-keys${qs ? `?${qs}` : ""}`);
  },
  createApiKey: (body) => apiRequest("/admin/grok/api-keys", { method: "POST", body }),
  updateApiKey: (id, body) => apiRequest(`/admin/grok/api-keys/${id}`, { method: "PATCH", body }),
  revokeApiKey: (id, reason) => apiRequest(`/admin/grok/api-keys/${id}/revoke`, { method: "POST", body: { reason } }),
  deleteApiKey: (id) => apiRequest(`/admin/grok/api-keys/${id}`, { method: "DELETE" }),
  
  // Alerts
  listAlerts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/grok/alerts${qs ? `?${qs}` : ""}`);
  },
  acknowledgeAlert: (id) => apiRequest(`/admin/grok/alerts/${id}/acknowledge`, { method: "POST" }),
  resolveAlert: (id) => apiRequest(`/admin/grok/alerts/${id}/resolve`, { method: "POST" }),
  
  // Settings
  getSettings: () => apiRequest("/admin/grok/settings"),
  updateSettings: (body) => apiRequest("/admin/grok/settings", { method: "PATCH", body }),
  
  // Analytics
  getAnalytics: (period = "30d") => apiRequest(`/admin/grok/analytics?period=${period}`),
  
  // Sync with xAI Billing
  syncXaiBilling: () => apiRequest("/admin/grok/sync-xai", { method: "POST" }),
};
