const { UsageRecord, User, AudioGeneration, TrainingJob } = require("../models");
const { getCharactersLimit } = require("../utils/planLimits");

async function getUsageSummary(userId) {
  const user = await User.findById(userId);
  const limit = getCharactersLimit(user.plan);

  const [ttsCount, cloneCount, recentUsage] = await Promise.all([
    AudioGeneration.countDocuments({ user: userId, status: "completed" }),
    TrainingJob.countDocuments({ user: userId, status: "completed" }),
    UsageRecord.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    plan: user.plan,
    charactersUsed: user.charactersUsed,
    charactersLimit: limit,
    charactersRemaining: Math.max(0, limit - user.charactersUsed),
    resetAt: user.usageResetAt,
    generations: ttsCount,
    completedClones: cloneCount,
    recent: recentUsage.map((r) => ({
      type: r.type,
      amount: r.amount,
      unit: r.unit,
      createdAt: r.createdAt,
    })),
  };
}

module.exports = { getUsageSummary };
