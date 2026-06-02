const mongoose = require("mongoose");

const billingSettingSchema = new mongoose.Schema(
  {
    // Revenue split (must always sum to 1.0)
    platformShare: { type: Number, default: 0.50, min: 0, max: 1 },
    apiShare: { type: Number, default: 0.50, min: 0, max: 1 },

    // xAI real pricing - this is the source of truth for cost
    ttsCostPerMillionCharacters: { type: Number, default: 15.00, min: 0.01 },

    // Accounting unit: how many credits represent 1 character
    creditsPerCharacter: { type: Number, default: 2, min: 1 },

    // Deposit limits
    minimumDepositUsd: { type: Number, default: 1, min: 0.5 },
    maximumDepositUsd: { type: Number, default: 500, min: 10 },

    // Welcome / onboarding
    welcomeCredits: { type: Number, default: 2380, min: 0 },
    welcomeCreditUsdValue: { type: Number, default: 0.01, min: 0 }, // Accounting value only

    // Legacy field kept for migration / backward compatibility (will be phased out)
    creditsPerDollar: { type: Number, default: 1500 },

    // Multi-provider billing profiles (new for xai + elevenlabs)
    providerProfiles: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        xai: {
          costPerMillionCharacters: 15.00,
          creditsPerCharacter: 2,
          platformShare: 0.50,
          apiShare: 0.50,
        },
        elevenlabs: {
          costPerMillionCharacters: 50.00,
          creditsPerCharacter: 7,
          platformShare: 0.50,
          apiShare: 0.50,
        },
        free: {
          costPerMillionCharacters: 0,
          creditsPerCharacter: 0,
          platformShare: 0,
          apiShare: 0,
        }
      }
    },

    // ElevenLabs specific config
    elevenlabs: {
      costPerMillionCharacters: { type: Number, default: 50.00 },
      creditsPerCharacter: { type: Number, default: 7 },
      platformShare: { type: Number, default: 0.50 },
      apiShare: { type: Number, default: 0.50 },
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Enforce that platformShare + apiShare === 1.0
billingSettingSchema.pre("save", function (next) {
  const sum = (this.platformShare || 0) + (this.apiShare || 0);
  if (Math.abs(sum - 1.0) > 0.0001) {
    return next(new Error("platformShare + apiShare must equal exactly 1.0"));
  }
  next();
});

// Singleton getter with sensible defaults
billingSettingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      platformShare: 0.50,
      apiShare: 0.50,
      ttsCostPerMillionCharacters: 15.00,
      creditsPerCharacter: 2,
      minimumDepositUsd: 1,
      maximumDepositUsd: 500,
      welcomeCredits: 2380,
      welcomeCreditUsdValue: 0.01,
    });
  }
  return settings;
};

// Helper to get fully normalized settings (used by credit calculations)
billingSettingSchema.statics.getNormalized = async function () {
  const s = await this.getSettings();
  const profiles = s.providerProfiles || {};
  return {
    platformShare: Number(s.platformShare),
    apiShare: Number(s.apiShare),
    ttsCostPerMillionCharacters: Number(s.ttsCostPerMillionCharacters),
    creditsPerCharacter: Number(s.creditsPerCharacter),
    minimumDepositUsd: Number(s.minimumDepositUsd),
    maximumDepositUsd: Number(s.maximumDepositUsd),
    welcomeCredits: Number(s.welcomeCredits),
    welcomeCreditUsdValue: Number(s.welcomeCreditUsdValue),
    // Multi provider
    providerProfiles: {
      xai: profiles.xai || { costPerMillionCharacters: 15, creditsPerCharacter: 2, platformShare: 0.5, apiShare: 0.5 },
      elevenlabs: profiles.elevenlabs || { costPerMillionCharacters: 15, creditsPerCharacter: 2, platformShare: 0.5, apiShare: 0.5 },
      free: profiles.free || { costPerMillionCharacters: 0, creditsPerCharacter: 0, platformShare: 0, apiShare: 0 },
    },
    elevenlabs: s.elevenlabs || {},
  };
};

module.exports = mongoose.model("BillingSetting", billingSettingSchema);
