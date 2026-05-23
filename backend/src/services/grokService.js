const { GrokFunding, GrokUsage, GrokApiKey, GrokAlert, GrokSettings, Payment, User } = require("../models");
const crypto = require("crypto");
const { checkXaiApiBalance, getXaiPrepaidBalance, getXaiUsage } = require("../integrations/xaiBilling");

// Encryption helper for API keys
const ENCRYPTION_KEY = process.env.GROK_API_KEY_ENCRYPTION_KEY || process.env.JWT_SECRET || "default-key-32-chars-long-for-dev-only!";
const IV_LENGTH = 16;

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, "0")), iv);
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptApiKey(encryptedData) {
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, "0")), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Dashboard & Overview
async function getDashboardStats() {
  const settings = await GrokSettings.getSettings();
  
  // Calculate totals
  const totalFundsResult = await GrokFunding.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalFundsAdded = totalFundsResult[0]?.total || 0;
  
  const totalSpendResult = await GrokUsage.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$costUsd" } } }
  ]);
  const totalApiSpend = totalSpendResult[0]?.total || 0;
  
  const remainingBalance = totalFundsAdded - totalApiSpend;
  const ttsCostPerHour = settings.ttsCostPerHour || 0.25;
  const estimatedRemainingHours = remainingBalance > 0 ? remainingBalance / ttsCostPerHour : 0;
  
  // Usage stats
  const usageStats = await GrokUsage.aggregate([
    { $match: { status: "success" } },
    { $group: { 
      _id: null, 
      totalCharacters: { $sum: "$charactersUsed" },
      totalRequests: { $sum: "$requestCount" }
    }}
  ]);
  const totalCharacters = usageStats[0]?.totalCharacters || 0;
  const totalRequests = usageStats[0]?.totalRequests || 0;
  
  // Active API keys count
  const activeApiKeys = await GrokApiKey.countDocuments({ status: "active" });
  
  // Customer revenue (from customer payments)
  const revenueResult = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$usdAmount" } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;
  
  // Current month usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyUsageResult = await GrokUsage.aggregate([
    { $match: { status: "success", createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$costUsd" } } }
  ]);
  const currentMonthUsage = monthlyUsageResult[0]?.total || 0;
  
  // Today's usage
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const todayUsageResult = await GrokUsage.aggregate([
    { $match: { status: "success", createdAt: { $gte: startOfDay } } },
    { $group: { _id: null, total: { $sum: "$costUsd" } } }
  ]);
  const todayUsage = todayUsageResult[0]?.total || 0;
  
  // Profit calculations
  const grossProfit = totalRevenue - totalApiSpend;
  
  // Alert count
  const unreadAlerts = await GrokAlert.countDocuments({ status: "unread" });
  
  // Check real xAI API status and balance
  const xaiApiStatus = await checkXaiApiBalance();
  
  return {
    totalFundsAdded,
    totalApiSpend,
    remainingBalance,
    estimatedRemainingHours: Math.round(estimatedRemainingHours * 100) / 100,
    totalCharacters,
    totalRequests,
    activeApiKeys,
    lowBalanceThreshold: settings.lowBalanceThreshold,
    xaiApiStatus: xaiApiStatus || { available: false, message: "Not configured" },
    xaiBalance: xaiApiStatus?.balance || null, // Real xAI balance from API
    totalRevenue,
    grossProfit,
    currentMonthUsage,
    todayUsage,
    unreadAlerts,
    autoPauseAtZero: settings.autoPauseAtZero,
    ttsCostPerHour,
  };
}

// Funding Management
async function listFundings(filters = {}) {
  const { page = 1, limit = 20, status, startDate, endDate } = filters;
  const query = {};
  
  if (status) query.status = status;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  const [fundings, total] = await Promise.all([
    GrokFunding.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean(),
    GrokFunding.countDocuments(query)
  ]);
  
  return { fundings, total, page, totalPages: Math.ceil(total / limit) };
}

async function addFunding(data, userId) {
  const funding = await GrokFunding.create({
    ...data,
    createdBy: userId,
    status: "completed"
  });
  
  // Create alert for new funding
  await GrokAlert.create({
    type: "funding_added",
    message: `$${data.amount} added to xAI balance`,
    severity: "info",
    metadata: { fundingId: funding._id, amount: data.amount }
  });
  
  // Check if balance is still low after funding
  const stats = await getDashboardStats();
  if (stats.remainingBalance < stats.lowBalanceThreshold) {
    await createLowBalanceAlert(stats.remainingBalance);
  }
  
  return funding;
}

async function updateFunding(id, data, userId) {
  const funding = await GrokFunding.findByIdAndUpdate(
    id,
    { ...data, updatedBy: userId },
    { new: true }
  );
  if (!funding) throw Object.assign(new Error("Funding record not found"), { statusCode: 404 });
  return funding;
}

async function deleteFunding(id) {
  const funding = await GrokFunding.findByIdAndDelete(id);
  if (!funding) throw Object.assign(new Error("Funding record not found"), { statusCode: 404 });
  return { success: true };
}

// Usage Management
async function listUsage(filters = {}) {
  const { page = 1, limit = 50, serviceType, model, status, startDate, endDate, userId } = filters;
  const query = {};
  
  if (serviceType) query.serviceType = serviceType;
  if (model) query.model = model;
  if (status) query.status = status;
  if (userId) query.userId = userId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  const [usage, total] = await Promise.all([
    GrokUsage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .lean(),
    GrokUsage.countDocuments(query)
  ]);
  
  return { usage, total, page, totalPages: Math.ceil(total / limit) };
}

async function recordUsage(data) {
  // Convert xAI cost ticks to USD if provided
  if (data.costInUsdTicks && !data.costUsd) {
    data.costUsd = data.costInUsdTicks / 10000000000;
  }
  
  const usage = await GrokUsage.create(data);
  
  // Update API key stats if provided
  if (data.apiKeyId) {
    await GrokApiKey.findByIdAndUpdate(data.apiKeyId, {
      $inc: { totalSpend: data.costUsd, requestCount: data.requestCount || 1 },
      lastUsedAt: new Date()
    });
  }
  
  // Check for high usage alert
  const settings = await GrokSettings.getSettings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayUsageResult = await GrokUsage.aggregate([
    { $match: { status: "success", createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$costUsd" } } }
  ]);
  const todayUsage = todayUsageResult[0]?.total || 0;
  
  if (todayUsage > (settings.alertThresholds?.highUsage || 100)) {
    await createHighUsageAlert(todayUsage);
  }
  
  return usage;
}

// API Key Management
async function listApiKeys(filters = {}) {
  const { status } = filters;
  const query = {};
  if (status) query.status = status;
  
  const keys = await GrokApiKey.find(query)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email")
    .lean();
  
  // Remove encrypted key from response, keep only prefix
  return keys.map(k => ({
    ...k,
    encryptedKey: undefined,
    keyDisplay: k.keyPrefix + "****"
  }));
}

async function createApiKey(data, userId) {
  const keyPrefix = data.key.slice(0, 8);
  const encryptedKey = encryptApiKey(data.key);
  
  const apiKey = await GrokApiKey.create({
    name: data.name,
    encryptedKey,
    keyPrefix,
    status: "active",
    rateLimitPerMinute: data.rateLimitPerMinute || 60,
    rateLimitPerHour: data.rateLimitPerHour || 1000,
    allowedModels: data.allowedModels || [],
    allowedServices: data.allowedServices || [],
    createdBy: userId
  });
  
  return {
    ...apiKey.toObject(),
    encryptedKey: undefined,
    keyDisplay: keyPrefix + "****"
  };
}

async function updateApiKey(id, data) {
  const updateData = { ...data };
  if (data.key) {
    updateData.keyPrefix = data.key.slice(0, 8);
    updateData.encryptedKey = encryptApiKey(data.key);
    delete updateData.key;
  }
  
  const apiKey = await GrokApiKey.findByIdAndUpdate(id, updateData, { new: true });
  if (!apiKey) throw Object.assign(new Error("API key not found"), { statusCode: 404 });
  
  return {
    ...apiKey.toObject(),
    encryptedKey: undefined,
    keyDisplay: apiKey.keyPrefix + "****"
  };
}

async function revokeApiKey(id, reason, userId) {
  const apiKey = await GrokApiKey.findByIdAndUpdate(id, {
    status: "revoked",
    revokedAt: new Date(),
    revokedReason: reason
  }, { new: true });
  
  if (!apiKey) throw Object.assign(new Error("API key not found"), { statusCode: 404 });
  return { success: true };
}

async function deleteApiKey(id) {
  const apiKey = await GrokApiKey.findByIdAndDelete(id);
  if (!apiKey) throw Object.assign(new Error("API key not found"), { statusCode: 404 });
  return { success: true };
}

// Alert Management
async function listAlerts(filters = {}) {
  const { status, type, severity, page = 1, limit = 50 } = filters;
  const query = {};
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (severity) query.severity = severity;
  
  const skip = (page - 1) * limit;
  const [alerts, total] = await Promise.all([
    GrokAlert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GrokAlert.countDocuments(query)
  ]);
  
  return { alerts, total, page, totalPages: Math.ceil(total / limit) };
}

async function createAlert(data) {
  return await GrokAlert.create(data);
}

async function createLowBalanceAlert(balance) {
  const existingUnread = await GrokAlert.findOne({
    type: "low_balance",
    status: { $in: ["unread", "read"] }
  });
  
  if (!existingUnread) {
    return await GrokAlert.create({
      type: "low_balance",
      message: `Low xAI balance: $${balance.toFixed(2)} remaining`,
      severity: balance <= 0 ? "critical" : "warning",
      metadata: { balance }
    });
  }
}

async function createHighUsageAlert(dailySpend) {
  const existingUnread = await GrokAlert.findOne({
    type: "high_usage",
    status: { $in: ["unread", "read"] },
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  
  if (!existingUnread) {
    return await GrokAlert.create({
      type: "high_usage",
      message: `High daily usage detected: $${dailySpend.toFixed(2)} spent today`,
      severity: "warning",
      metadata: { dailySpend }
    });
  }
}

async function acknowledgeAlert(id, userId) {
  const alert = await GrokAlert.findByIdAndUpdate(id, {
    status: "acknowledged",
    resolvedAt: new Date(),
    resolvedBy: userId
  }, { new: true });
  
  if (!alert) throw Object.assign(new Error("Alert not found"), { statusCode: 404 });
  return alert;
}

async function resolveAlert(id, userId) {
  const alert = await GrokAlert.findByIdAndUpdate(id, {
    status: "resolved",
    resolvedAt: new Date(),
    resolvedBy: userId
  }, { new: true });
  
  if (!alert) throw Object.assign(new Error("Alert not found"), { statusCode: 404 });
  return alert;
}

// Settings Management
async function getSettings() {
  return await GrokSettings.getSettings();
}

async function updateSettings(data, userId) {
  const settings = await GrokSettings.getSettings();
  
  Object.assign(settings, data, { updatedBy: userId });
  await settings.save();
  
  return settings;
}

// Analytics
async function getAnalytics(period = "30d") {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case "7d": startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
    case "30d": startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
    case "90d": startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
    default: startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
  
  // Daily spending
  const dailySpending = await GrokUsage.aggregate([
    { $match: { status: "success", createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        spend: { $sum: "$costUsd" },
        requests: { $sum: "$requestCount" },
        characters: { $sum: "$charactersUsed" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Spending by service type
  const spendingByService = await GrokUsage.aggregate([
    { $match: { status: "success", createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: "$serviceType",
        spend: { $sum: "$costUsd" },
        requests: { $sum: "$requestCount" }
      }
    }
  ]);
  
  // Top users by consumption
  const topUsers = await GrokUsage.aggregate([
    { $match: { status: "success", userId: { $ne: null }, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: "$userId",
        spend: { $sum: "$costUsd" },
        requests: { $sum: "$requestCount" },
        characters: { $sum: "$charactersUsed" }
      }
    },
    { $sort: { spend: -1 } },
    { $limit: 10 }
  ]);
  
  // Populate user details
  const userIds = topUsers.map(u => u._id);
  const users = await User.find({ _id: { $in: userIds } }, "name email").lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));
  
  const topUsersWithDetails = topUsers.map(u => ({
    ...u,
    user: userMap.get(u._id.toString()) || { name: "Unknown", email: "" }
  }));
  
  return {
    dailySpending,
    spendingByService,
    topUsers: topUsersWithDetails,
    period
  };
}

// Check balance and create alerts if needed
async function checkBalanceAndAlert() {
  const stats = await getDashboardStats();
  const settings = await GrokSettings.getSettings();
  
  if (stats.remainingBalance <= 0) {
    await GrokAlert.create({
      type: "zero_balance",
      message: "xAI balance is depleted. API calls may fail.",
      severity: "critical",
      metadata: { balance: stats.remainingBalance }
    });
  } else if (stats.remainingBalance < settings.lowBalanceThreshold) {
    await createLowBalanceAlert(stats.remainingBalance);
  }
  
  return stats;
}

// Sync with xAI Billing API
async function syncXaiBilling(userId) {
  // Get real balance from xAI
  const balanceResult = await getXaiPrepaidBalance();
  
  if (!balanceResult.success) {
    throw Object.assign(
      new Error(balanceResult.error || "Failed to sync with xAI"),
      { statusCode: 400 }
    );
  }
  
  // Get current system totals
  const totalFundsResult = await GrokFunding.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const currentTotalFunds = totalFundsResult[0]?.total || 0;
  
  // The real xAI balance
  const realXaiBalance = balanceResult.balance;
  
  // Calculate how much we need to add to match reality
  // Real balance = Total Funds - Total Spend
  // So: Total Funds = Real balance + Total Spend
  const totalSpendResult = await GrokUsage.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$costUsd" } } }
  ]);
  const totalApiSpend = totalSpendResult[0]?.total || 0;
  
  // Calculate expected total funds based on real balance
  const expectedTotalFunds = realXaiBalance + totalApiSpend;
  
  // If there's a discrepancy, add an adjustment entry
  if (Math.abs(expectedTotalFunds - currentTotalFunds) > 0.01) {
    const adjustment = expectedTotalFunds - currentTotalFunds;
    
    await GrokFunding.create({
      amount: adjustment,
      date: new Date(),
      paymentMethod: "other",
      referenceNumber: `xai-sync-${Date.now()}`,
      notes: `Auto-sync adjustment from xAI Billing API. Real balance: $${realXaiBalance.toFixed(2)}`,
      createdBy: userId,
      status: "completed"
    });
    
    // Create alert for the sync
    await GrokAlert.create({
      type: "system",
      message: `Synced with xAI Billing API. Balance: $${realXaiBalance.toFixed(2)}. Adjustment: $${adjustment.toFixed(2)}`,
      severity: "info",
      metadata: { 
        realBalance: realXaiBalance, 
        adjustment,
        previousTotal: currentTotalFunds,
        newTotal: expectedTotalFunds
      }
    });
  }
  
  // Also fetch recent usage from xAI to compare
  const usageResult = await getXaiUsage("7d");
  
  return {
    success: true,
    xaiBalance: realXaiBalance,
    xaiBalanceCents: balanceResult.balanceCents,
    adjustment: expectedTotalFunds - currentTotalFunds,
    previousTotal: currentTotalFunds,
    newTotal: expectedTotalFunds,
    xaiUsage: usageResult.success ? usageResult.usage : [],
    changes: balanceResult.changes || []
  };
}

module.exports = {
  // Dashboard
  getDashboardStats,
  checkBalanceAndAlert,
  
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
  encryptApiKey,
  decryptApiKey,
  
  // Alerts
  listAlerts,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  createLowBalanceAlert,
  createHighUsageAlert,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Analytics
  getAnalytics,
  
  // xAI Sync
  syncXaiBilling
};
