const mongoose = require("mongoose");

const voiceCloneSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: false, trim: true, default: "" },
    description: { type: String, default: "" },
    visibility: { type: String, enum: ["private", "public", "unlisted"], default: "private" },
    shareToken: { type: String, default: null, index: true, sparse: true },
    status: {
      type: String,
      enum: ["draft", "uploading", "configured", "training", "ready", "failed"],
      default: "draft",
    },
    provider: { type: String, enum: ["xai", "elevenlabs"], default: "xai" }, // elevenlabs for Professional plan cloning
    model: { type: String, default: "" }, // e.g. "flash", "multilingual_v3" for EL clones
    voice: { type: mongoose.Schema.Types.ObjectId, ref: "Voice", default: null },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    errorMessage: { type: String, default: null },
    // Voice characteristics for matching
    gender: { type: String, enum: ["male", "female", null], default: null }, // User-specified gender
    detectedGender: { type: String, enum: ["male", "female", null], default: null }, // Auto-detected from audio
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoiceClone", voiceCloneSchema);
