const mongoose = require("mongoose");
const {
  User,
  AudioGeneration,
  TrainingJob,
  UsageRecord,
  ActivityLog,
  BillingSetting,
  BillingProfile,
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
    User.countDocuments({ plan: { $in: ["pro", "professional", "enterprise"] } }),
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
    // Total revenue from real payments only (exclude admin grants)
    Payment.aggregate([
      { $match: { status: "success", reference: { $not: /^admin_grant_/ } } },
      { $group: { _id: null, total: { $sum: "$usdAmount" } } },
    ]),
    // Revenue from last 30 days (exclude admin grants)
    Payment.aggregate([
      { $match: { status: "success", reference: { $not: /^admin_grant_/ }, processedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$usdAmount" } } },
    ]),
    // Recent successful payments (show all including admin grants)
    Payment.find({ status: "success" })
      .sort({ processedAt: -1 })
      .limit(50)
      .populate("user", "name email plan")
      .lean(),
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  const payingCustomers = await Payment.distinct("user", { status: "success", reference: { $not: /^admin_grant_/ } });
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
  const [totalUsers, proUsers, freeUsers, enterpriseUsers, professionalUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ plan: "pro" }),
    User.countDocuments({ plan: "free" }),
    User.countDocuments({ plan: "enterprise" }),
    User.countDocuments({ plan: "professional" }),
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
      professional: { ...config.planLimits.professional, users: professionalUsers },
      enterprise: { ...config.planLimits.enterprise, users: enterpriseUsers },
    },
    stats: { totalUsers, proUsers, freeUsers, enterpriseUsers, professionalUsers },
  };
}

async function getBillingSettings() {
  const settings = await BillingSetting.getNormalized();
  const { calculateCreditsFromPayment } = require("../utils/creditCalc");

  // Calculate example previews using current settings and new per-provider method (defensive)
  let examples = { xai: {}, professional: {} };
  try {
    examples = {
      xai: {
        deposit1: await calculateCreditsFromPayment(1, "xai"),
        deposit5: await calculateCreditsFromPayment(5, "xai"),
        deposit10: await calculateCreditsFromPayment(10, "xai"),
      },
      professional: {
        deposit1: await calculateCreditsFromPayment(1, "elevenlabs"),
        deposit5: await calculateCreditsFromPayment(5, "elevenlabs"),
        deposit10: await calculateCreditsFromPayment(10, "elevenlabs"),
      },
    };
  } catch (e) {
    console.warn("[getBillingSettings] failed to compute live examples (non-fatal):", e.message);
  }

  return {
    platformShare: settings.platformShare,
    apiShare: settings.apiShare,
    ttsCostPerMillionCharacters: settings.ttsCostPerMillionCharacters,
    creditsPerCharacter: settings.creditsPerCharacter,
    minimumDepositUsd: settings.minimumDepositUsd,
    maximumDepositUsd: settings.maximumDepositUsd,
    welcomeCredits: settings.welcomeCredits,
    welcomeCreditUsdValue: settings.welcomeCreditUsdValue,
    // Legacy
    creditsPerDollar: settings.creditsPerDollar,
    // Multi-provider
    providerProfiles: settings.providerProfiles,
    elevenlabs: settings.elevenlabs || settings.providerProfiles?.elevenlabs || {},
    professional: settings.providerProfiles?.elevenlabs || settings.elevenlabs || {},
    // Live previews per provider using new credit calc
    examples,
  };
}

async function updateBillingSettings(userId, data) {
  const settings = await BillingSetting.getSettings();

  if (data.platformShare !== undefined) settings.platformShare = Number(data.platformShare);
  if (data.apiShare !== undefined) settings.apiShare = Number(data.apiShare);
  if (data.ttsCostPerMillionCharacters !== undefined) settings.ttsCostPerMillionCharacters = Number(data.ttsCostPerMillionCharacters);
  if (data.creditsPerCharacter !== undefined) settings.creditsPerCharacter = Number(data.creditsPerCharacter);

  // Sync legacy xAI fields into providerProfiles.xai for dynamic engine
  if (!settings.providerProfiles) settings.providerProfiles = {};
  settings.providerProfiles.xai = {
    costPerMillionCharacters: Number(settings.ttsCostPerMillionCharacters || 15),
    creditsPerCharacter: Number(settings.creditsPerCharacter || 2),
    platformShare: Number(settings.platformShare || 0.5),
    apiShare: Number(settings.apiShare || 0.5),
  };
  if (data.minimumDepositUsd !== undefined) settings.minimumDepositUsd = Number(data.minimumDepositUsd);
  if (data.maximumDepositUsd !== undefined) settings.maximumDepositUsd = Number(data.maximumDepositUsd);
  if (data.welcomeCredits !== undefined) settings.welcomeCredits = Number(data.welcomeCredits);
  if (data.welcomeCreditUsdValue !== undefined) settings.welcomeCreditUsdValue = Number(data.welcomeCreditUsdValue);

  // Keep legacy field for now
  if (data.creditsPerDollar !== undefined) settings.creditsPerDollar = Number(data.creditsPerDollar);

  // Multi-provider support
  if (data.providerProfiles) settings.providerProfiles = data.providerProfiles;
  if (data.elevenlabs) {
    settings.elevenlabs = data.elevenlabs;
    // Also mirror to the profiles for the credit engine
    if (!settings.providerProfiles) settings.providerProfiles = {};
    settings.providerProfiles.elevenlabs = {
      costPerMillionCharacters: Number(data.elevenlabs.costPerMillionCharacters || 50),
      creditsPerCharacter: Number(data.elevenlabs.creditsPerCharacter || 7),
      platformShare: Number(data.elevenlabs.platformShare || 0.5),
      apiShare: Number(data.elevenlabs.apiShare || 0.5),
    };
  }
  if (data.professional) {
    // Support professional key from frontend
    settings.elevenlabs = data.professional;
    if (!settings.providerProfiles) settings.providerProfiles = {};
    settings.providerProfiles.elevenlabs = {
      costPerMillionCharacters: Number(data.professional.costPerMillionCharacters || 50),
      creditsPerCharacter: Number(data.professional.creditsPerCharacter || 7),
      platformShare: Number(data.professional.platformShare || 0.5),
      apiShare: Number(data.professional.apiShare || 0.5),
    };
  }

  settings.updatedBy = userId;
  await settings.save();

  // Return fresh normalized data + previews
  return await getBillingSettings();
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

  const upgradedToPro = grantUsd >= 5 && user.plan !== "pro" && user.plan !== "professional" && user.plan !== "enterprise"
    || (user.totalPayments >= 5 && user.plan !== "pro" && user.plan !== "professional" && user.plan !== "enterprise");
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

  // New billing-aware metrics (post 2026 refactor)
  const billingStats = await AudioGeneration.aggregate([
    { $match: { status: "completed", createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalCreditsCharged: { $sum: { $ifNull: ["$creditsCharged", 0] } },
        totalEstimatedApiCost: { $sum: { $ifNull: ["$estimatedApiCostUsd", 0] } },
        totalCharactersBilled: { $sum: "$charactersUsed" }
      }
    }
  ]);

  const billing = billingStats[0] || { totalCreditsCharged: 0, totalEstimatedApiCost: 0, totalCharactersBilled: 0 };

  // Rough gross margin calculation (API cost vs what we charged in value)
  // Note: True revenue attribution would come from Payment collection, this is usage-side view
  const estimatedApiCost = billing.totalEstimatedApiCost || 0;

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
    billing: {
      totalCreditsCharged: billing.totalCreditsCharged || 0,
      estimatedApiCostUsd: estimatedApiCost,
      totalCharactersBilled: billing.totalCharactersBilled || 0,
      // Note: Real revenue comes from payments. This is usage cost view.
      note: "estimatedApiCostUsd reflects real xAI cost for billed generations in the period."
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

// ─── Gift Email Campaign ────────────────────────────────────────────
async function sendGiftEmail(adminId, { subject, heading, body, imageUrl, gifUrl, buttonText, usdAmount, recipients, specificUserIds, expiryDays, campaignName }) {
  const { calculateCreditsFromPayment } = require("../utils/creditCalc");
  const { sendCreditGiftEmail } = require("../integrations/email");
  const { CreditGift } = require("../models/CreditGift");

  // Calculate credits from USD amount
  const credits = calculateCreditsFromPayment(usdAmount);
  if (!credits || credits <= 0) {
    throw Object.assign(new Error("USD amount too low to generate credits."), { statusCode: 400 });
  }

  // Determine expiry
  const days = expiryDays || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Create gift campaign record
  const token = CreditGift.generateToken();
  const gift = await CreditGift.create({
    token,
    createdBy: adminId,
    recipients: recipients || "all",
    specificUsers: specificUserIds || [],
    usdAmount,
    credits,
    subject: subject || "You've Got Free Credits!",
    heading: heading || "",
    body,
    imageUrl: imageUrl || "",
    gifUrl: gifUrl || "",
    buttonText: buttonText || "Claim Your Free Credits",
    campaignName: campaignName || "",
    expiresAt,
    status: "sent",
  });

  // Determine who to send to
  let users;
  if (recipients === "specific" && specificUserIds && specificUserIds.length > 0) {
    users = await User.find({ _id: { $in: specificUserIds }, status: { $ne: "banned" } }).select("email name");
  } else {
    users = await User.find({ status: { $ne: "banned" } }).select("email name");
  }

  // Build claim URL
  const config = require("../config");
  const claimBaseUrl = `${config.clientUrl}/claim-credits?token=${token}`;
  const expiresInLabel = days === 1 ? "24 hours" : `${days} days`;

  // Send emails in batches
  let sent = 0;
  let failed = 0;
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((user) =>
        sendCreditGiftEmail({
          to: user.email,
          name: user.name || "",
          subject: gift.subject,
          heading: gift.heading,
          body: gift.body,
          imageUrl: gift.imageUrl,
          gifUrl: gift.gifUrl,
          credits,
          usdAmount,
          claimUrl: claimBaseUrl,
          buttonText: gift.buttonText,
          expiresIn: expiresInLabel,
        })
      )
    );
    results.forEach((r) => (r.status === "fulfilled" ? sent++ : failed++));
  }

  // Update campaign stats
  gift.totalSent = sent;
  await gift.save();

  await ActivityLog.create({
    user: adminId,
    action: "send_gift_email",
    message: `Sent gift email campaign "${campaignName || subject}" to ${sent} users (${credits} credits / $${usdAmount} each)`,
    metadata: { giftId: gift._id, sent, failed, credits, usdAmount },
    level: "info",
  });

  return {
    giftId: gift._id,
    token: gift.token,
    credits,
    usdAmount,
    totalSent: sent,
    totalFailed: failed,
    expiresAt,
  };
}

async function getGiftCampaigns() {
  const { CreditGift } = require("../models/CreditGift");
  const campaigns = await CreditGift.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("createdBy", "name email")
    .lean();

  // Mark expired campaigns
  const now = new Date();
  return campaigns.map((c) => ({
    ...c,
    status: c.expiresAt < now && c.status !== "expired" ? "expired" : c.status,
  }));
}

async function claimGiftCredits(userId, token) {
  const { CreditGift, CreditGiftClaim } = require("../models/CreditGift");

  const gift = await CreditGift.findOne({ token });
  if (!gift) {
    throw Object.assign(new Error("Invalid or expired gift link."), { statusCode: 404 });
  }

  if (gift.expiresAt < new Date()) {
    throw Object.assign(new Error("This gift has expired."), { statusCode: 410 });
  }

  // Check if specific users only
  if (gift.recipients === "specific" && gift.specificUsers.length > 0) {
    const isAllowed = gift.specificUsers.some((id) => id.toString() === userId.toString());
    if (!isAllowed) {
      throw Object.assign(new Error("This gift is not available for your account."), { statusCode: 403 });
    }
  }

  // Check if already claimed
  const existing = await CreditGiftClaim.findOne({ gift: gift._id, user: userId });
  if (existing) {
    throw Object.assign(new Error("You have already claimed this gift."), { statusCode: 409 });
  }

  // Add credits to user
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }

  user.totalCredits += gift.credits;
  user.creditsRemaining += gift.credits;
  await user.save();

  // Record claim
  await CreditGiftClaim.create({
    gift: gift._id,
    user: userId,
    token: gift.token,
    credits: gift.credits,
  });

  // Update campaign claimed count
  gift.totalClaimed += 1;
  await gift.save();

  return {
    credits: gift.credits,
    usdAmount: gift.usdAmount,
    newBalance: user.creditsRemaining,
    message: `Successfully claimed ${gift.credits.toLocaleString()} credits!`,
  };
}

/**
 * Billing Profiles (per provider + model) management
 */
async function listBillingProfiles() {
  // Ensure defaults exist
  await seedDefaultBillingProfiles();
  return BillingProfile.listAll();
}

async function updateBillingProfile(userId, { provider, model, updates }) {
  if (!provider || !model) {
    throw Object.assign(new Error("provider and model required"), { statusCode: 400 });
  }
  let profile = await BillingProfile.findOne({ provider, model });
  if (!profile) {
    profile = new BillingProfile({ provider, model });
  }
  if (updates.costPerMillionCharacters !== undefined) profile.costPerMillionCharacters = Number(updates.costPerMillionCharacters);
  if (updates.creditsPerCharacter !== undefined) profile.creditsPerCharacter = Number(updates.creditsPerCharacter);
  if (updates.platformShare !== undefined) profile.platformShare = Number(updates.platformShare);
  if (updates.apiShare !== undefined) profile.apiShare = Number(updates.apiShare);
  if (updates.costTier !== undefined) profile.costTier = updates.costTier;
  if (updates.displayName !== undefined) profile.displayName = updates.displayName;
  if (updates.active !== undefined) profile.active = !!updates.active;

  profile.updatedBy = userId;
  await profile.save();
  return profile;
}

async function seedDefaultBillingProfiles() {
  const defaults = [
    {
      provider: "xai",
      model: "voice_api",
      displayName: "voice forge pro",
      costTier: "low",
      costPerMillionCharacters: 15,
      creditsPerCharacter: 2,
      platformShare: 0.5,
      apiShare: 0.5,
    },
    {
      provider: "elevenlabs",
      model: "flash",
      displayName: "voiceforge Premium v2",
      costTier: "medium",
      costPerMillionCharacters: 50,
      creditsPerCharacter: 7,
      platformShare: 0.5,
      apiShare: 0.5,
    },
    {
      provider: "elevenlabs",
      model: "multilingual_v3",
      displayName: "voiceforge Premium v3",
      costTier: "high",
      costPerMillionCharacters: 100,
      creditsPerCharacter: 14,
      platformShare: 0.5,
      apiShare: 0.5,
    },
    {
      provider: "free",
      model: "default",
      displayName: "free",
      costTier: "low",
      costPerMillionCharacters: 0,
      creditsPerCharacter: 0,
      platformShare: 0,
      apiShare: 0,
    }
  ];

  for (const d of defaults) {
    const existing = await BillingProfile.findOne({ provider: d.provider, model: d.model });
    if (!existing) {
      await BillingProfile.create(d);
    }
  }
}

module.exports = { getDashboard, listUsers, getSystemHealth, getBilling, updateUser, banUser, restrictUser, unbanUser, unrestrictUser, deleteUser, getSettings, getBillingSettings, updateBillingSettings, addCredits, getTtsAnalytics, resetAllUserCredits, sendGiftEmail, getGiftCampaigns, claimGiftCredits, listBillingProfiles, updateBillingProfile, seedDefaultBillingProfiles };
