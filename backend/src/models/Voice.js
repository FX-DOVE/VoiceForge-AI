const mongoose = require("mongoose");

const voiceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    tags: [{ type: String }],
    gender: { type: String, default: "" },
    accent: { type: String, default: "" },
    age: { type: String, default: "" },
    country: { type: String, default: "" },
    style: { type: String, default: "" },
    languages: [{ type: String }],
    description: { type: String, default: "" },
    rating: { type: Number, default: 4.5 },
    usageLabel: { type: String, default: "" },
    creator: { type: String, default: "VoiceForge Studio" },
    type: { type: String, enum: ["stock", "community", "cloned"], default: "stock" },
    img: { type: String, default: "" },
    previewUrl: { type: String, default: "" },
    xaiVoiceId: { type: String, default: "Aria" },
    edgeVoiceId: { type: String, default: "" },
    previewSample: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    voiceCloneRef: { type: mongoose.Schema.Types.ObjectId, ref: "VoiceClone", default: null },
    tier: { type: String, enum: ["free", "pro"], default: "free" },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isCoreVoice: { type: Boolean, default: false },
    source: { type: String, enum: ["xai", "edge", "manual", "cloned"], default: "manual" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null }, // For fallback messages and extra data
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voice", voiceSchema);
