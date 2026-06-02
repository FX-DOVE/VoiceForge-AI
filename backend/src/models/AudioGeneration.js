const mongoose = require("mongoose");

const audioGenerationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true },
    voice: { type: mongoose.Schema.Types.ObjectId, ref: "Voice", default: null },
    voiceSlug: { type: String, default: "" },
    voiceLabel: { type: String, default: "" },
    xaiVoiceId: { type: String, default: "Eve" },
    language: { type: String, default: "en" },
    codec: { type: String, default: "mp3" },
    sampleRate: { type: Number, default: 44100 },
    bitRate: { type: Number, default: 128000 },
    speed: { type: Number, default: 1 },
    stability: { type: Number, default: 0.5 },
    tone: { type: String, default: "" },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    jobId: { type: String, default: null }, // BullMQ job id when queued
    charactersUsed: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    audioUrl: { type: String, default: null },
    downloadUrl: { type: String, default: null },
    storageKey: { type: String, default: null },
    errorMessage: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    // Metrics
    processingTimeMs: { type: Number, default: null },
    queuedAt: { type: Date, default: null },

    // Billing / Cost tracking (added during 2026 billing refactor)
    creditsCharged: { type: Number, default: 0 },
    estimatedApiCostUsd: { type: Number, default: 0 },
    provider: { type: String, default: "xai" }, // xai or elevenlabs etc
    model: { type: String, default: "voice_api" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AudioGeneration", audioGenerationSchema);
