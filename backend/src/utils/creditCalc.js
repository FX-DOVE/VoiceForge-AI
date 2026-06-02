/**
 * VoiceForge AI - Dynamic Credit & Cost Calculation Engine (Multi-Provider)
 *
 * Supports independent billing profiles per provider: free, xai, elevenlabs.
 *
 * Core Principles:
 * - Credits are ONLY an accounting/display unit.
 * - Profitability per provider from apiBudget + provider cost + actual characters.
 * - 50/50 gross margin enforced per provider profile.
 * - No global rate assumptions.
 */

const BillingSetting = require("../models/BillingSetting");
const BillingProfile = require("../models/BillingProfile");

/**
 * Get current normalized billing settings + provider profiles.
 */
async function getBillingSettings() {
  return await BillingSetting.getNormalized();
}

/**
 * Get the billing profile for a specific provider + model.
 * Falls back to legacy providerProfiles or defaults for backward compat.
 */
async function getBillingProfile(provider = "xai", model = "default") {
  try {
    // Prefer new granular BillingProfile collection
    const profile = await BillingProfile.getProfile(provider, model);
    if (profile && profile.costPerMillionCharacters !== undefined) {
      return {
        costPerMillionCharacters: Number(profile.costPerMillionCharacters),
        creditsPerCharacter: Number(profile.creditsPerCharacter),
        platformShare: Number(profile.platformShare),
        apiShare: Number(profile.apiShare),
        costTier: profile.costTier || "low",
        displayName: profile.displayName || provider,
      };
    }
  } catch (e) {
    // ignore, fallback
  }

  // Fallback to legacy BillingSetting
  const settings = await getBillingSettings();
  const profiles = settings.providerProfiles || {};
  let base = profiles[provider] || profiles.xai || {
    costPerMillionCharacters: provider === "free" ? 0 : (provider === "elevenlabs" ? 50 : 15),
    creditsPerCharacter: provider === "free" ? 0 : (provider === "elevenlabs" ? 7 : 2),
    platformShare: 0.5,
    apiShare: 0.5,
  };

  // For specific models, apply multipliers if not in new profile
  if (model === "multilingual_v3" || model === "premium") {
    base = {
      ...base,
      costPerMillionCharacters: (base.costPerMillionCharacters || 50) * 2,
      creditsPerCharacter: Math.ceil((base.creditsPerCharacter || 7) * 2),
      costTier: "high",
    };
  } else if (model === "flash" || model === "v2") {
    base = { ...base, costTier: "medium" };
  } else if (provider === "xai") {
    base.costTier = "low";
  }

  return {
    costPerMillionCharacters: Number(base.costPerMillionCharacters),
    creditsPerCharacter: Number(base.creditsPerCharacter),
    platformShare: Number(base.platformShare),
    apiShare: Number(base.apiShare),
    costTier: base.costTier || "low",
    displayName: base.displayName || provider,
  };
}

// Backward compat
async function getProviderProfile(provider = "xai") {
  return getBillingProfile(provider, "default");
}

/**
 * Calculate credits from deposit for a specific provider (model optional for future).
 */
async function calculateCreditsFromPayment(paymentAmountUsd, provider = "xai", model = "default") {
  const profile = await getBillingProfile(provider, model);
  const amount = Number(paymentAmountUsd);
  if (!amount || amount <= 0) return 0;

  const apiBudget = amount * profile.apiShare;
  const characters = (apiBudget / profile.costPerMillionCharacters) * 1_000_000;
  const credits = Math.floor(characters * profile.creditsPerCharacter);
  return Math.max(0, credits);
}

/**
 * Calculate credits to charge for usage on a specific provider+model.
 */
async function calculateCreditsForUsage(characterCount, provider = "xai", model = "default") {
  const profile = await getBillingProfile(provider, model);
  const count = Number(characterCount) || 0;
  return Math.ceil(count * profile.creditsPerCharacter);
}

/**
 * Calculate estimated real API cost for a provider+model.
 */
async function calculateEstimatedApiCost(characterCount, provider = "xai", model = "default") {
  const profile = await getBillingProfile(provider, model);
  const count = Number(characterCount) || 0;
  return (count / 1_000_000) * profile.costPerMillionCharacters;
}

/**
 * Credits to characters using provider+model profile.
 */
async function creditsToCharacters(credits, provider = "xai", model = "default") {
  const profile = await getBillingProfile(provider, model);
  return Math.floor(credits / profile.creditsPerCharacter);
}

module.exports = {
  calculateCreditsFromPayment,
  calculateCreditsForUsage,
  calculateEstimatedApiCost,
  creditsToCharacters,
  getProviderProfile,
  getBillingProfile,
  getBillingSettings,
};
