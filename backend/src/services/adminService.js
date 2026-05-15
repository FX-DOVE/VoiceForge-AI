const mongoose = require("mongoose");
const {
  User,
  AudioGeneration,
  TrainingJob,
  UsageRecord,
  ActivityLog,
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

  return {
    items: users.map((u) => ({
      ...u.toPublicJSON(),
      createdAt: u.createdAt,
    })),
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
  const [totalUsers, freeUsers, proUsers, enterpriseUsers, recentRecords] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: "free" }),
      User.countDocuments({ plan: "pro" }),
      User.countDocuments({ plan: "enterprise" }),
      UsageRecord.find({ type: "tts" })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("user", "name email plan")
        .lean(),
    ]);

  const mrr = proUsers * 19 + enterpriseUsers * 99;
  const activeSubscriptions = proUsers + enterpriseUsers;
  const total = totalUsers || 1;

  const transactions = recentRecords.map((r, i) => ({
    id: `#TXN-${String(r._id).slice(-4).toUpperCase()}`,
    customer: r.user?.name || r.user?.email || "Unknown",
    email: r.user?.email || "",
    plan: r.user?.plan
      ? r.user.plan.charAt(0).toUpperCase() + r.user.plan.slice(1)
      : "Free",
    amount: r.user?.plan === "enterprise" ? "$99.00" : r.user?.plan === "pro" ? "$19.00" : "$0.00",
    date: new Date(r.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: r.user?.plan === "free" ? "Free" : "Paid",
    characters: r.amount,
  }));

  return {
    mrr,
    activeSubscriptions,
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

module.exports = { getDashboard, listUsers, getSystemHealth, getBilling, updateUser, getSettings };
