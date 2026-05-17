const PLATFORM_SHARE = 0.40;
const USER_SHARE = 1 - PLATFORM_SHARE;
const XAI_COST_PER_MILLION = 4.20;
const CREDITS_PER_CHARACTER = 2;

export function calculateCreditsFromPayment(paymentAmount) {
  const apiValue = paymentAmount * USER_SHARE;
  const characters = (apiValue / XAI_COST_PER_MILLION) * 1_000_000;
  return Math.floor(characters * CREDITS_PER_CHARACTER);
}

export function calculateCreditsForUsage(characterCount) {
  return Math.ceil(characterCount * CREDITS_PER_CHARACTER);
}
