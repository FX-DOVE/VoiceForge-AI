const PLATFORM_SHARE = 0.50;
const USER_SHARE = 1 - PLATFORM_SHARE; // 0.50
const XAI_COST_PER_MILLION = 4.20;
const CREDITS_PER_CHARACTER = 2;

/**
 * Calculate credits to add from a payment amount.
 * $1 = ~238,095 credits. Uses floor() to round down (favor the platform).
 */
function calculateCreditsFromPayment(paymentAmount) {
  const apiValue = paymentAmount * USER_SHARE;
  const characters = (apiValue / XAI_COST_PER_MILLION) * 1_000_000;
  return Math.floor(characters * CREDITS_PER_CHARACTER);
}

/**
 * Calculate credits to charge for a TTS usage.
 * 1 character = 2 credits. Uses ceil() to round up (favor the platform).
 */
function calculateCreditsForUsage(characterCount) {
  return Math.ceil(characterCount * CREDITS_PER_CHARACTER);
}

/**
 * Calculate the dollar payment required to obtain a given number of credits.
 * Inverse of calculateCreditsFromPayment.
 */
function calculatePaymentForCredits(credits) {
  const characters = credits / CREDITS_PER_CHARACTER;
  const apiValue = (characters / 1_000_000) * XAI_COST_PER_MILLION;
  return apiValue / USER_SHARE;
}

module.exports = {
  calculateCreditsFromPayment,
  calculateCreditsForUsage,
  calculatePaymentForCredits,
  PLATFORM_SHARE,
  USER_SHARE,
  XAI_COST_PER_MILLION,
  CREDITS_PER_CHARACTER,
};
