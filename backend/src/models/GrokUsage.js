const mongoose = require("mongoose");

const grokUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    serviceType: { 
      type: String, 
      required: true,
      enum: ["tts", "image", "video", "chat", "other"]
    },
    model: { type: String, required: true },
    charactersUsed: { type: Number, default: 0 },
    requestCount: { type: Number, default: 1 },
    costUsd: { type: Number, required: true },
    costInUsdTicks: { type: Number, default: 0 }, // Raw xAI cost ticks
    status: { 
      type: String, 
      enum: ["success", "failed", "pending", "cancelled"],
      default: "success"
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: "GrokApiKey", default: null },
    requestId: { type: String, default: null }, // xAI request ID
  },
  { timestamps: true }
);

// Indexes for fast queries
grokUsageSchema.index({ createdAt: -1 });
grokUsageSchema.index({ serviceType: 1 });
grokUsageSchema.index({ userId: 1 });
grokUsageSchema.index({ model: 1 });
grokUsageSchema.index({ status: 1 });

module.exports = mongoose.model("GrokUsage", grokUsageSchema);
