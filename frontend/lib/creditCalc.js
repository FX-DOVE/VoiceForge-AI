/**
 * DEPRECATED - DO NOT USE
 * 
 * All credit calculations must come from the backend via:
 *   - paymentsApi.estimate(amount)
 *   - adminApi.billingSettings()
 * 
 * This file previously contained hardcoded $4.20 pricing.
 * It has been neutralized during the 2026 billing refactor.
 */

export function calculateCreditsFromPayment() {
  console.warn("[DEPRECATED] calculateCreditsFromPayment called from frontend/lib/creditCalc.js. Use backend estimate instead.");
  return 0;
}

export function calculateCreditsForUsage() {
  console.warn("[DEPRECATED] calculateCreditsForUsage called from frontend. Use backend.");
  return 0;
}

export const PLATFORM_SHARE = 0.5;
export const CREDITS_PER_CHARACTER = 2; // legacy reference only
