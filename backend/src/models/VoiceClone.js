const mongoose = require("mongoose");

const voiceCloneSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    visibility: { type: String, enum: ["private", "public"], default: "private" },
    status: {
      type: String,
      enum: ["draft", "uploading", "configured", "training", "ready", "failed"],
      default: "draft",
    },
    voice: { type: mongoose.Schema.Types.ObjectId, ref: "Voice", default: null },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoiceClone", voiceCloneSchema);
