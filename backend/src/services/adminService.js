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

module.exports = { getDashboard, listUsers, getSystemHealth };
