const PLATFORM_SHARE = 0.40;
const USER_SHARE = 1 - PLATFORM_SHARE; // 0.60
const XAI_COST_PER_MILLION = 4.20;
const CREDITS_PER_CHARACTER = 2;

/**
 * Calculate credits to add from a payment amount.
 * Uses floor() to round down (favor the platform).
 */
function calculateCreditsFromPayment(paymentAmount) {
  const apiValue = paymentAmount * USER_SHARE;
  const characters = (apiValue / XAI_COST_PER_MILLION) * 1_000_000;
  return Math.floor(characters * CREDITS_PER_CHARACTER);
}

/**
 * Calculate credits to charge for a TTS usage.
 * Uses ceil() to round up (favor the platform).
 */
function calculateCreditsForUsage(characterCount) {
  return Math.ceil(characterCount * CREDITS_PER_CHARACTER);
}

module.exports = {
  calculateCreditsFromPayment,
  calculateCreditsForUsage,
  PLATFORM_SHARE,
  USER_SHARE,
  XAI_COST_PER_MILLION,
  CREDITS_PER_CHARACTER,
};
