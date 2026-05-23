const mongoose = require("mongoose");
const {
  User,
  AudioGeneration,
  TrainingJob,
  UsageRecord,
  ActivityLog,
  BillingSetting,
  Payment,
} = require("../models");

async function getDashboard() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    proUsers,
    generations30d,
    clones30d,
    totalCharacters,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ plan: { $in: ["pro", "enterprise"] } }),
    AudioGeneration.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    TrainingJob.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    UsageRecord.aggregate([
      { $match: { unit: "characters", createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const chars = totalCharacters[0]?.total || 0;
  const apiUsagePercent = Math.min(100, Math.round((chars / 500000) * 100));

  return {
    revenue: { mrr: proUsers * 19, currency: "USD" },
    subscriptions: { active: proUsers, total: totalUsers },
    apiUsagePercent,
    generationVolume: generations30d,
    voiceClones: clones30d,
    activeUsers,
    activity: recentActivity.map((a) => ({
      id: a._id.toString(),
      action: a.action,
      message: a.message,
      level: a.level,
      createdAt: a.createdAt,
    })),
  };
}

async function listUsers({ page = 1, limit = 20, search = "", plan, status }) {
  const query = {};
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }
  if (plan) query.plan = plan;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  const userIds = users.map((u) => u._id);
  const genCounts = await AudioGeneration.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);

  const genCountsMap = {};
  genCounts.forEach((g) => {
    genCountsMap[g._id.toString()] = g.count;
  });

  const { getCharactersLimit } = require("../utils/planLimits");
  return {
    items: users.map((u) => {
      const publicJson = u.toPublicJSON();
      const limitVal = getCharactersLimit(u.plan);
      return {
        ...publicJson,
        createdAt: u.createdAt,
        generationsCount: genCountsMap[u._id.toString()] || 0,
        usage: {
          charactersUsed: u.charactersUsed || 0,
          charactersLimit: limitVal,
        },
      };
    }),
    total,
    page,
    limit,
  };
}

async function getSystemHealth() {
  const dbState = mongoose.connection.readyState;
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

  return {
    status: dbState === 1 ? "healthy" : "degraded",
    services: [
      {
        name: "mongodb",
        status: dbState === 1 ? "up" : "down",
        detail: dbStates[dbState] || "unknown",
      },
      {
        name: "api",
        status: "up",
        regions: [
          { region: "us-east", status: "up", latencyMs: 42 },
          { region: "eu-west", status: "up", latencyMs: 78 },
        ],
      },
      {
        name: "tts",
        status: process.env.XAI_API_KEY ? "up" : "not_configured",
      },
      {
        name: "redis",
        status: process.env.REDIS_URL ? "configured" : "optional",
      },
    ],
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

async function getBilling() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    freeUsers,
    proUsers,
    enterpriseUsers,
    totalRevenueAgg,
    monthlyRevenueAgg,
    recentPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ plan: "free" }),
    User.countDocuments({ plan: "pro" }),
    User.countDocuments({ plan: "enterprise" }),
    // Total revenue from all successful payments
    Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$usdAmount" } } },
    ]),
    // Revenue from last 30 days
    Payment.aggregate([
      { $match: { status: "success", processedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$usdAmount" } } },
    ]),
    // Recent successful payments
    Payment.find({ status: "success" })
      .sort({ processedAt: -1 })
      .limit(50)
      .populate("user", "name email plan")
      .lean(),
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  const payingCustomers = await Payment.distinct("user", { status: "success" });
  const total = totalUsers || 1;

  // Build real transaction list from Paystack payments
  const transactions = recentPayments.map((p) => ({
    id: p.reference,
    customer: p.user?.name || p.user?.email || "Unknown",
    email: p.user?.email || "",
    plan: p.user?.plan
      ? p.user.plan.charAt(0).toUpperCase() + p.user.plan.slice(1)
      : "Free",
    amount: `$${p.usdAmount.toFixed(2)}`,
    date: new Date(p.processedAt || p.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: "Paid",
    gateway: "Paystack",
    credits: p.creditsAdded,
  }));

  return {
    totalRevenue,
    monthlyRevenue,
    payingCustomers: payingCustomers.length,
    totalUsers,
    subscriptionSplit: [
      {
        label: "Pro",
        count: proUsers,
        percent: Math.round((proUsers / total) * 100),
        color: "blue",
      },
      {
        label: "Free",
        count: freeUsers,
        percent: Math.round((freeUsers / total) * 100),
        color: "purple",
      },
      {
        label: "Enterprise",
        count: enterpriseUsers,
        percent: Math.round((enterpriseUsers / total) * 100),
        color: "orange",
      },
    ],
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
    transactions,
  };
}

async function updateUser(userId, { plan, status }) {
  const update = {};
  if (plan) update.plan = plan;
  if (status) update.status = status;
  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user.toPublicJSON();
}

async function banUser(userId, adminId, { reason }) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      status: "banned",
      banReason: reason || "Violation of terms of service",
      bannedAt: new Date(),
      bannedBy: adminId,
    },
    { new: true }
  );
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  
  // Log the action
  await ActivityLog.create({
    user: adminId,
    action: "ban_user",
    message: `Banned user ${user.email}`,
    metadata: { bannedUserId: userId, reason: reason },
    level: "warning",
  });
  
  return user.toPublicJSON();
}

async function restrictUser(userId, adminId, { reason, restrictions }) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      status: "restricted",
      restrictionReason: reason || "Account restrictions applied",
      restrictedAt: new Date(),
      restrictedBy: adminId,
      restrictions: restrictions || ["tts", "cloning", "payments"],
    },
    { new: true }
  );
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  
  // Log the action
  await ActivityLog.create({
    user: adminId,
    action: "restrict_user",
    message: `Restricted user ${user.email}`,
    metadata: { restrictedUserId: userId, reason, restrictions },
    level: "warning",
  });
  
  return user.toPublicJSON();
}

async function unbanUser(userId, adminId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      status: "active",
      banReason: null,
      bannedAt: null,
      bannedBy: null,
    },
    { new: true }
  );
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  
  await ActivityLog.create({
    user: adminId,
    action: "unban_user",
    message: `Unbanned user ${user.email}`,
    metadata: { unbannedUserId: userId },
    level: "info",
  });
  
  return user.toPublicJSON();
}

async function unrestrictUser(userId, adminId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      status: "active",
      restrictionReason: null,
      restrictedAt: null,
      restrictedBy: null,
      restrictions: [],
    },
    { new: true }
  );
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  
  await ActivityLog.create({
    user: adminId,
    action: "unrestrict_user",
    message: `Removed restrictions from user ${user.email}`,
    metadata: { unrestrictedUserId: userId },
    level: "info",
  });
  
  return user.toPublicJSON();
}

async function deleteUser(userId, adminId, { reason }) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  
  // Prevent deleting admin users
  if (user.role === "admin") {
    throw Object.assign(new Error("Cannot delete admin users"), { statusCode: 403 });
  }
  
  // Log before deletion
  await ActivityLog.create({
    user: adminId,
    action: "delete_user",
    message: `Deleted user ${user.email}`,
    metadata: { deletedUserId: userId, email: user.email, reason },
    level: "error",
  });
  
  // Delete user's data
  await AudioGeneration.deleteMany({ user: userId });
  await TrainingJob.deleteMany({ user: userId });
  await UsageRecord.deleteMany({ user: userId });
  await Payment.deleteMany({ user: userId });
  
  // Delete the user
  await User.findByIdAndDelete(userId);
  
  return { success: true, message: "User deleted successfully" };
}

async function getSettings() {
  const config = require("../config");
  const { User } = require("../models");
  const [totalUsers, proUsers, freeUsers, enterpriseUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ plan: "pro" }),
    User.countDocuments({ plan: "free" }),
    User.countDocuments({ plan: "enterprise" }),
  ]);

  return {
    general: {
      siteName: "VoiceForge AI",
      env: config.env,
      port: config.port,
      clientUrl: config.clientUrl,
      adminEmail: config.adminEmail || "",
      ttsProvider: config.ttsProvider,
    },
    api: {
      xaiConfigured: !!config.xai.apiKey,
      xaiModel: config.xai.model,
      xaiDefaultVoice: config.xai.defaultVoiceId,
      xaiDefaultLanguage: config.xai.defaultLanguage,
      xaiDefaultCodec: config.xai.defaultCodec,
      rateLimitMax: config.rateLimit.max,
      rateLimitWindowMs: config.rateLimit.windowMs,
    },
    storage: {
      provider: config.storageProvider,
      cloudinaryConfigured: !!(config.cloudinary.cloudName && config.cloudinary.apiKey),
      awsConfigured: !!(config.aws.accessKeyId && config.aws.bucket),
      maxUploadMb: config.maxUploadMb,
    },
    services: {
      stripeConfigured: !!config.stripe.secretKey,
      stripeWebhookConfigured: !!config.stripe.webhookSecret,
      resendConfigured: !!config.resend.apiKey,
      emailFrom: config.resend.from,
      redisConfigured: !!process.env.REDIS_URL,
    },
    planLimits: {
      free: { ...config.planLimits.free, users: freeUsers },
      pro: { ...config.planLimits.pro, users: proUsers },
      enterprise: { ...config.planLimits.enterprise, users: enterpriseUsers },
    },
    stats: { totalUsers, proUsers, freeUsers, enterpriseUsers },
  };
}

async function getBillingSettings() {
  const settings = await BillingSetting.getSettings();
  return {
    creditsPerDollar: settings.creditsPerDollar,
    minimumPaymentUsd: settings.minimumPaymentUsd,
    welcomeCredits: settings.welcomeCredits,
    welcomeCreditUsd: settings.welcomeCreditUsd,
  };
}

async function updateBillingSettings(userId, data) {
  const settings = await BillingSetting.getSettings();
  if (data.creditsPerDollar !== undefined) settings.creditsPerDollar = Number(data.creditsPerDollar);
  if (data.minimumPaymentUsd !== undefined) settings.minimumPaymentUsd = Number(data.minimumPaymentUsd);
  if (data.welcomeCredits !== undefined) {
    const wc = Number(data.welcomeCredits);
    settings.welcomeCredits = Math.min(Math.max(0, wc), 10000); // Cap at 10,000
  }
  if (data.welcomeCreditUsd !== undefined) {
    const wu = Number(data.welcomeCreditUsd);
    settings.welcomeCreditUsd = Math.min(Math.max(0, wu), 1.00); // Cap at $1.00
  }
  settings.updatedBy = userId;
  await settings.save();
  
  return {
    creditsPerDollar: settings.creditsPerDollar,
    minimumPaymentUsd: settings.minimumPaymentUsd,
    welcomeCredits: settings.welcomeCredits,
    welcomeCreditUsd: settings.welcomeCreditUsd,
  };
}

async function addCredits(userId, adminId, { credits, note, usdAmount }) {
  const amount = Number(credits);
  if (!amount || amount <= 0 || !Number.isFinite(amount)) {
    throw Object.assign(new Error("Credits must be a positive number"), { statusCode: 400 });
  }

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const grantUsd = Number(usdAmount) || 0;

  user.totalCredits += amount;
  user.creditsRemaining += amount;
  if (grantUsd > 0) user.totalPayments += grantUsd;

  const upgradedToPro = grantUsd >= 5 && user.plan !== "pro" && user.plan !== "enterprise"
    || (user.totalPayments >= 5 && user.plan !== "pro" && user.plan !== "enterprise");
  if (upgradedToPro) user.plan = "pro";

  await user.save();

  await Payment.create({
    user: user._id,
    reference: `admin_grant_${Date.now()}_${userId}`,
    amountPaid: 0,
    currency: "NGN",
    usdAmount: grantUsd,
    creditsAdded: amount,
    status: "success",
    processedAt: new Date(),
    providerResponse: { source: "admin_grant", adminId: adminId.toString(), note: note || "" },
  });

  await ActivityLog.create({
    user: adminId,
    action: "add_credits",
    message: `Added ${amount} credits ($${grantUsd.toFixed(2)} USD) to ${user.email}${upgradedToPro ? " — upgraded to Pro" : ""}${note ? ` — ${note}` : ""}`,
    metadata: { targetUserId: userId, credits: amount, usdAmount: grantUsd, upgradedToPro, note },
    level: "info",
  });

  return {
    userId: user._id.toString(),
    email: user.email,
    creditsAdded: amount,
    newBalance: user.creditsRemaining,
    totalCredits: user.totalCredits,
    upgradedToPro,
    plan: user.plan,
  };
}

async function getTtsAnalytics(period = "24h") {
  const now = new Date();
  let startDate;

  switch (period) {
    case "24h": startDate = new Date(now - 24 * 60 * 60 * 1000); break;
    case "7d": startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
    case "30d": startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
    case "90d": startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
    default: startDate = new Date(now - 24 * 60 * 60 * 1000);
  }

  // Free TTS (Edge) = charactersUsed = 0
  // xAI TTS = charactersUsed > 0
  const [
    freeTtsStats,
    xaiTtsStats,
    dailyBreakdown,
    topFreeUsers,
    topXaiUsers
  ] = await Promise.all([
    // Free TTS stats (Edge TTS)
    AudioGeneration.aggregate([
      { $match: { charactersUsed: 0, status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
          totalCharacters: { $sum: { $strLenCP: "$text" } }
        }
      }
    ]),
    // xAI TTS stats (paid API calls)
    AudioGeneration.aggregate([
      { $match: { charactersUsed: { $gt: 0 }, status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
          totalCharacters: { $sum: "$charactersUsed" }
        }
      }
    ]),
    // Daily breakdown for charts
    AudioGeneration.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: { $cond: { if: { $eq: ["$charactersUsed", 0] }, then: "free", else: "xai" } }
          },
          requests: { $sum: 1 },
          characters: { $sum: { $cond: { if: { $eq: ["$charactersUsed", 0] }, then: { $strLenCP: "$text" }, else: "$charactersUsed" } } }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]),
    // Top users by Free TTS usage
    AudioGeneration.aggregate([
      { $match: { charactersUsed: 0, status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$user",
          requests: { $sum: 1 },
          characters: { $sum: { $strLenCP: "$text" } }
        }
      },
      { $sort: { requests: -1 } },
      { $limit: 10 }
    ]),
    // Top users by xAI TTS usage
    AudioGeneration.aggregate([
      { $match: { charactersUsed: { $gt: 0 }, status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$user",
          requests: { $sum: 1 },
          characters: { $sum: "$charactersUsed" }
        }
      },
      { $sort: { requests: -1 } },
      { $limit: 10 }
    ])
  ]);

  // Populate user details for top users
  const userIds = [...topFreeUsers.map(u => u._id), ...topXaiUsers.map(u => u._id)];
  const users = await User.find({ _id: { $in: userIds } }, "name email plan").lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const populateUsers = (list) => list.map(u => ({
    ...u,
    user: userMap.get(u._id.toString()) || { name: "Unknown", email: "", plan: "free" }
  }));

  // Format daily breakdown
  const dailyStats = {};
  dailyBreakdown.forEach(day => {
    if (!dailyStats[day._id.date]) {
      dailyStats[day._id.date] = { date: day._id.date, free: 0, xai: 0, freeChars: 0, xaiChars: 0 };
    }
    if (day._id.type === "free") {
      dailyStats[day._id.date].free = day.requests;
      dailyStats[day._id.date].freeChars = day.characters;
    } else {
      dailyStats[day._id.date].xai = day.requests;
      dailyStats[day._id.date].xaiChars = day.characters;
    }
  });

  const freeStats = freeTtsStats[0] || { totalRequests: 0, uniqueUsers: [], totalCharacters: 0 };
  const xaiStats = xaiTtsStats[0] || { totalRequests: 0, uniqueUsers: [], totalCharacters: 0 };

  return {
    period,
    periodStart: startDate,
    periodEnd: now,
    summary: {
      freeTts: {
        requests: freeStats.totalRequests || 0,
        uniqueUsers: freeStats.uniqueUsers?.length || 0,
        characters: freeStats.totalCharacters || 0,
        label: "Free TTS (Edge)"
      },
      xaiTts: {
        requests: xaiStats.totalRequests || 0,
        uniqueUsers: xaiStats.uniqueUsers?.length || 0,
        characters: xaiStats.totalCharacters || 0,
        label: "xAI TTS (API)"
      },
      total: {
        requests: (freeStats.totalRequests || 0) + (xaiStats.totalRequests || 0),
        uniqueUsers: new Set([...(freeStats.uniqueUsers || []), ...(xaiStats.uniqueUsers || [])]).size,
        characters: (freeStats.totalCharacters || 0) + (xaiStats.totalCharacters || 0)
      }
    },
    dailyBreakdown: Object.values(dailyStats),
    topUsers: {
      free: populateUsers(topFreeUsers),
      xai: populateUsers(topXaiUsers)
    }
  };
}

async function resetAllUserCredits(adminId) {
  // Reset all users' credits to 0 and give them the correct welcome bonus
  const BillingSetting = require("../models/BillingSetting");
  
  const settings = await BillingSetting.getSettings();
  
  // Use the direct welcomeCredits value from settings (default 2380)
  // NEVER calculate from USD — that caused the 1,588,095 credit bug
  const MAX_WELCOME_CREDITS = 2380;
  let welcomeCredits = Math.min(settings.welcomeCredits || MAX_WELCOME_CREDITS, MAX_WELCOME_CREDITS);
  
  if (!welcomeCredits || welcomeCredits <= 0) {
    welcomeCredits = MAX_WELCOME_CREDITS;
  }

  // Update all users: reset credits to 0, then give welcome bonus
  const result = await User.updateMany(
    {}, // all users
    {
      $set: {
        totalCredits: welcomeCredits,
        creditsUsed: 0,
        creditsRemaining: welcomeCredits,
      },
    }
  );

  console.log(`[Admin] Reset credits for ${result.modifiedCount} users. New welcome bonus: ${welcomeCredits} credits`);
  
  return {
    resetCount: result.modifiedCount,
    welcomeCreditsGiven: welcomeCredits,
    message: `Reset credits for ${result.modifiedCount} users. Each user now has ${welcomeCredits} welcome credits.`,
  };
}

module.exports = { getDashboard, listUsers, getSystemHealth, getBilling, updateUser, banUser, restrictUser, unbanUser, unrestrictUser, deleteUser, getSettings, getBillingSettings, updateBillingSettings, addCredits, getTtsAnalytics, resetAllUserCredits };
