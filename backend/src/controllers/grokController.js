const grokService = require("../services/grokService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await grokService.getDashboardStats();
  sendSuccess(res, stats);
});

// Funding
const listFundings = asyncHandler(async (req, res) => {
  const data = await grokService.listFundings(req.query);
  sendSuccess(res, data);
});

const addFunding = asyncHandler(async (req, res) => {
  const funding = await grokService.addFunding(req.body, req.user._id);
  sendSuccess(res, funding, "Funding added successfully", 201);
});

const updateFunding = asyncHandler(async (req, res) => {
  const funding = await grokService.updateFunding(req.params.id, req.body, req.user._id);
  sendSuccess(res, funding, "Funding updated successfully");
});

const deleteFunding = asyncHandler(async (req, res) => {
  await grokService.deleteFunding(req.params.id);
  sendSuccess(res, null, "Funding deleted successfully");
});

// Usage
const listUsage = asyncHandler(async (req, res) => {
  const data = await grokService.listUsage(req.query);
  sendSuccess(res, data);
});

const recordUsage = asyncHandler(async (req, res) => {
  const usage = await grokService.recordUsage(req.body);
  sendSuccess(res, usage, "Usage recorded successfully", 201);
});

// API Keys
const listApiKeys = asyncHandler(async (req, res) => {
  const keys = await grokService.listApiKeys(req.query);
  sendSuccess(res, { keys });
});

const createApiKey = asyncHandler(async (req, res) => {
  const key = await grokService.createApiKey(req.body, req.user._id);
  sendSuccess(res, key, "API key created successfully", 201);
});

const updateApiKey = asyncHandler(async (req, res) => {
  const key = await grokService.updateApiKey(req.params.id, req.body);
  sendSuccess(res, key, "API key updated successfully");
});

const revokeApiKey = asyncHandler(async (req, res) => {
  await grokService.revokeApiKey(req.params.id, req.body.reason, req.user._id);
  sendSuccess(res, null, "API key revoked successfully");
});

const deleteApiKey = asyncHandler(async (req, res) => {
  await grokService.deleteApiKey(req.params.id);
  sendSuccess(res, null, "API key deleted successfully");
});

// Alerts
const listAlerts = asyncHandler(async (req, res) => {
  const data = await grokService.listAlerts(req.query);
  sendSuccess(res, data);
});

const acknowledgeAlert = asyncHandler(async (req, res) => {
  const alert = await grokService.acknowledgeAlert(req.params.id, req.user._id);
  sendSuccess(res, alert, "Alert acknowledged");
});

const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await grokService.resolveAlert(req.params.id, req.user._id);
  sendSuccess(res, alert, "Alert resolved");
});

// Settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await grokService.getSettings();
  sendSuccess(res, { settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await grokService.updateSettings(req.body, req.user._id);
  sendSuccess(res, { settings }, "Settings updated successfully");
});

// Analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const data = await grokService.getAnalytics(req.query.period);
  sendSuccess(res, data);
});

// Balance check
const checkBalance = asyncHandler(async (req, res) => {
  const stats = await grokService.checkBalanceAndAlert();
  sendSuccess(res, stats);
});

// Sync with xAI Billing API
const syncXaiBilling = asyncHandler(async (req, res) => {
  const data = await grokService.syncXaiBilling(req.user._id);
  sendSuccess(res, data, "Synced with xAI Billing API");
});

module.exports = {
  // Dashboard
  getDashboardStats,
  
  // Funding
  listFundings,
  addFunding,
  updateFunding,
  deleteFunding,
  
  // Usage
  listUsage,
  recordUsage,
  
  // API Keys
  listApiKeys,
  createApiKey,
  updateApiKey,
  revokeApiKey,
  deleteApiKey,
  
  // Alerts
  listAlerts,
  acknowledgeAlert,
  resolveAlert,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Analytics
  getAnalytics,
  
  // Balance
  checkBalance,
  
  // xAI Sync
  syncXaiBilling
};
