const { User, ProfessionalMembership } = require("../models");
const config = require("../config");
const paymentService = require("./paymentService");

/**
 * Professional Membership Service
 * Dedicated flows for $2.99/mo Professional plan (ElevenLabs + cloning unlock).
 * Does NOT touch wallet/credits for the subscription fee itself (handled in payment verify).
 * Existing $2.99 deposit flow remains fully functional (backward compat).
 */

const PROFESSIONAL_PRICE = 2.99;

/**
 * Initialize a Professional subscription payment (fixed $2.99/mo).
 * Reuses the Paystack flow so webhooks/verify work unchanged.
 * Returns same shape as payments/paystack/initialize .
 */
async function subscribe(userId, email, { refundPolicyAccepted = true } = {}) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }

  // Record refund policy acceptance (same as generic checkout flow)
  if (refundPolicyAccepted) {
    user.refundPolicyAccepted = true;
    user.refundPolicyAcceptedAt = new Date();
    await user.save();
  }

  // If already has active membership, still allow "renew" payment (extends on success)
  const active = await ProfessionalMembership.findOne({ user: userId, status: "active" });
  if (active && active.endDate > new Date()) {
    // Allow renew anyway; verify will extend
  }

  // Force exactly 2.99 (subscription fee, not credits)
  const amount = PROFESSIONAL_PRICE;

  // Delegate to payment initialize (metadata will carry userId)
  // The payment verify special-cases amount ~2.99 to activate membership + set plan=professional
  const init = await paymentService.initializePaystackTransaction(userId, email, amount);

  // Attach hint for client
  return {
    ...init,
    subscription: true,
    amount,
    plan: "professional",
  };
}

/**
 * Get current Professional membership status for user.
 */
async function getStatus(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }

  const mem = await ProfessionalMembership.findOne({ user: userId }).sort({ createdAt: -1 });

  const now = new Date();
  let isActive = false;
  let daysRemaining = 0;
  let endDate = null;

  if (mem) {
    isActive = mem.status === "active" && mem.endDate > now;
    if (mem.endDate) {
      endDate = mem.endDate;
      if (isActive) {
        daysRemaining = Math.max(0, Math.ceil((mem.endDate - now) / (1000 * 60 * 60 * 24)));
      }
    }
  } else if (user.plan === "professional") {
    // Legacy users with plan set but no membership doc (pre full system) - treat as active until we expire
    isActive = true;
    // No endDate known, assume 30d from now for UI (will be corrected on next payment/renew)
    endDate = new Date(now.getTime() + 30 * 86400000);
    daysRemaining = 30;
  }

  const effectivePlan = user.plan || "free";

  return {
    plan: effectivePlan,
    isProfessional: effectivePlan === "professional" || isActive,
    membership: mem
      ? {
          id: mem._id.toString(),
          status: mem.status,
          startDate: mem.startDate,
          endDate: mem.endDate,
          autoRenew: mem.autoRenew,
          amountPaid: mem.amountPaid,
          currency: mem.currency,
        }
      : null,
    isActive,
    daysRemaining,
    endDate,
    canAccessElevenLabs: effectivePlan === "professional" || isActive,
    canCloneVoices: effectivePlan === "professional" || isActive,
  };
}

/**
 * Manually expire memberships past endDate (idempotent).
 * Called by daily job.
 */
async function expirePastDue() {
  const now = new Date();
  const result = await ProfessionalMembership.updateMany(
    {
      status: "active",
      endDate: { $lte: now },
    },
    {
      $set: { status: "expired", updatedAt: now },
    }
  );
  if (result.modifiedCount > 0) {
    console.log(`[Professional] Expired ${result.modifiedCount} memberships.`);
  }
  return result.modifiedCount || 0;
}

/**
 * Ensure a membership doc exists for a professional plan user (defensive).
 */
async function ensureMembershipForProfessionalUser(userId) {
  const user = await User.findById(userId);
  if (!user || user.plan !== "professional") return null;

  let mem = await ProfessionalMembership.findOne({ user: userId });
  if (!mem) {
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    mem = await ProfessionalMembership.create({
      user: userId,
      status: "active",
      startDate: new Date(),
      endDate: end,
      autoRenew: true,
      provider: "paystack",
      amountPaid: PROFESSIONAL_PRICE,
    });
  }
  return mem;
}

module.exports = {
  subscribe,
  getStatus,
  expirePastDue,
  ensureMembershipForProfessionalUser,
  PROFESSIONAL_PRICE,
};
