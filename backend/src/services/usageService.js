const { UsageRecord, User, AudioGeneration, TrainingJob, WelcomeGrant, BillingSetting, ProfessionalMembership } = require("../models");
const { getCharactersLimit } = require("../utils/planLimits");

async function getUsageSummary(userId) {
  const user = await User.findById(userId);
  let limit = getCharactersLimit(user.plan);

  // Auto-grant welcome credits retroactively if missing (Fixes existing bugged users)
  if (user.totalCredits === 0 && !user.hasReceivedWelcomeCredits) {
    const existingGrant = await WelcomeGrant.findOne({ email: user.email });
    if (!existingGrant) {
      const settings = await BillingSetting.getSettings();
      // Use the direct welcomeCredits value (default 2380), NOT calculateCreditsFromPayment
      const MAX_WELCOME_CREDITS = 2380;
      const credits = Math.min(settings.welcomeCredits || MAX_WELCOME_CREDITS, MAX_WELCOME_CREDITS);
      if (credits > 0) {
        user.totalCredits += credits;
        user.creditsRemaining += credits;
        user.hasReceivedWelcomeCredits = true;
        user.welcomeCreditsAwardedAt = new Date();
        await user.save();
        await WelcomeGrant.create({
          email: user.email,
          ipAddress: "retroactive-usage-fix",
          user: user._id,
          creditsGranted: credits,
        });
      }
    } else {
      // WelcomeGrant exists but user flag not set — fix the flag
      user.hasReceivedWelcomeCredits = true;
      user.welcomeCreditsAwardedAt = existingGrant.createdAt;
      await user.save();
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
      creditsCharged: r.meta?.creditsCharged || 0,
      estimatedApiCostUsd: r.meta?.estimatedApiCostUsd || 0,
      createdAt: r.createdAt,
    })),
    // Professional membership status (for dashboard / renew UI)
    professional: await (async () => {
      const mem = await ProfessionalMembership.findOne({ user: userId }).sort({ createdAt: -1 });
      const now = new Date();
      const isMemActive = !!(mem && mem.status === "active" && mem.endDate > now);
      const isPlanPro = user.plan === "professional";
      const isActive = isPlanPro || isMemActive;
      let days = 0;
      if (isActive && mem?.endDate) {
        days = Math.max(0, Math.ceil((mem.endDate - now) / (1000 * 60 * 60 * 24)));
      }
      return {
        isProfessional: isActive,
        plan: user.plan,
        membershipStatus: mem?.status || (isPlanPro ? "active" : "none"),
        endDate: mem?.endDate || null,
        daysRemaining: days,
        canAccessElevenLabs: isActive,
        canClone: isActive,
      };
    })(),
  };
}

module.exports = { getUsageSummary };
