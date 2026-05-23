const { UsageRecord, User, AudioGeneration, TrainingJob, WelcomeGrant, BillingSetting } = require("../models");
const { getCharactersLimit } = require("../utils/planLimits");
const { calculateCreditsFromPayment } = require("../utils/creditCalc");
const config = require("../config");

async function getUsageSummary(userId) {
  const user = await User.findById(userId);
  let limit = getCharactersLimit(user.plan);

  // Auto-grant welcome credits retroactively if missing (Fixes existing bugged users)
  if (user.totalCredits === 0) {
    const existingGrant = await WelcomeGrant.findOne({ email: user.email });
    if (!existingGrant) {
      const settings = await BillingSetting.getSettings();
      const welcomeUsd = settings.welcomeCreditUsd || 0.01;
      const credits = Math.floor(calculateCreditsFromPayment(welcomeUsd));
      if (credits > 0) {
        user.totalCredits += credits;
        user.creditsRemaining += credits;
        await user.save();
        await WelcomeGrant.create({
          email: user.email,
          ipAddress: "retroactive-usage-fix",
          user: user._id,
          creditsGranted: credits,
        });
      }
    }
  }

  const [ttsCount, freeCount, cloneCount, recentUsage] = await Promise.all([
    AudioGeneration.countDocuments({ user: userId, status: "completed" }),
    AudioGeneration.countDocuments({ user: userId, status: "completed", charactersUsed: 0 }),
    TrainingJob.countDocuments({ user: userId, status: "completed" }),
    UsageRecord.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    plan: user.plan,
    name: user.name || "",
    email: user.email || "",
    charactersUsed: user.charactersUsed,
    charactersLimit: limit,
    charactersRemaining: Math.max(0, limit - user.charactersUsed),
    resetAt: user.usageResetAt,
    totalCredits: user.totalCredits,
    creditsUsed: user.creditsUsed,
    creditsRemaining: user.creditsRemaining,
    totalPayments: user.totalPayments,
    generations: ttsCount,
    freeGenerations: freeCount,
    proGenerations: ttsCount - freeCount,
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
