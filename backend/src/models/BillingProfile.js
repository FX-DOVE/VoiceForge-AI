const mongoose = require("mongoose");

const billingProfileSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, enum: ["free", "xai", "elevenlabs"], index: true },
    model: { type: String, required: true, default: "default", index: true }, // e.g. "voice_api", "flash", "multilingual_v3"

    displayName: { type: String, default: "" }, // e.g. "voice forge pro", "voiceforge Premium v2"

    costTier: { type: String, enum: ["low", "medium", "high"], default: "low" },

    // Real API cost
    costPerMillionCharacters: { type: Number, default: 0, min: 0 },

    // Credits charged to user wallet per character
    creditsPerCharacter: { type: Number, default: 0, min: 0 },

    // Revenue split (must sum to 1.0)
    platformShare: { type: Number, default: 0.50, min: 0, max: 1 },
    apiShare: { type: Number, default: 0.50, min: 0, max: 1 },

    active: { type: Boolean, default: true },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Compound unique index for provider + model
billingProfileSchema.index({ provider: 1, model: 1 }, { unique: true });

// Enforce platformShare + apiShare === 1.0
billingProfileSchema.pre("save", function (next) {
  const sum = (this.platformShare || 0) + (this.apiShare || 0);
  if (Math.abs(sum - 1.0) > 0.0001) {
    return next(new Error("platformShare + apiShare must equal exactly 1.0"));
  }
  next();
});

// Get or create billing profile for provider + model
billingProfileSchema.statics.getProfile = async function (provider = "xai", model = "default") {
  let profile = await this.findOne({ provider, model, active: true });
  if (!profile) {
    // Fallback to defaults if not found (for backward compat)
    const defaults = {
      "xai": { costPerMillionCharacters: 15, creditsPerCharacter: 2, platformShare: 0.5, apiShare: 0.5, costTier: "low", displayName: "voice forge pro" },
      "elevenlabs": { costPerMillionCharacters: 50, creditsPerCharacter: 7, platformShare: 0.5, apiShare: 0.5, costTier: "medium", displayName: "voiceforge Premium v2" },
      "free": { costPerMillionCharacters: 0, creditsPerCharacter: 0, platformShare: 0, apiShare: 0, costTier: "low", displayName: "free" }
    };
    const d = defaults[provider] || defaults["xai"];
    profile = {
      provider,
      model,
      displayName: d.displayName,
      costTier: d.costTier,
      costPerMillionCharacters: d.costPerMillionCharacters,
      creditsPerCharacter: d.creditsPerCharacter,
      platformShare: d.platformShare,
      apiShare: d.apiShare,
      active: true
    };
  }
  return profile;
};

// Admin list all profiles
billingProfileSchema.statics.listAll = async function () {
  return this.find({}).sort({ provider: 1, model: 1 }).lean();
};

module.exports = mongoose.model("BillingProfile", billingProfileSchema);
