const mongoose = require("mongoose");

const grokApiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    encryptedKey: { type: String, required: true },
    keyPrefix: { type: String, required: true }, // First 8 chars for display
    status: { 
      type: String, 
      enum: ["active", "inactive", "revoked"],
      default: "active"
    },
    lastUsedAt: { type: Date, default: null },
    totalSpend: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
    rateLimitPerMinute: { type: Number, default: 60 },
    rateLimitPerHour: { type: Number, default: 1000 },
    allowedModels: [{ type: String }], // Empty = all models allowed
    allowedServices: [{ type: String }], // Empty = all services allowed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes
grokApiKeySchema.index({ status: 1 });
grokApiKeySchema.index({ createdBy: 1 });
grokApiKeySchema.index({ keyPrefix: 1 });

module.exports = mongoose.model("GrokApiKey", grokApiKeySchema);
