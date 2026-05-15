const mongoose = require("mongoose");

const voiceSampleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    voiceClone: { type: mongoose.Schema.Types.ObjectId, ref: "VoiceClone", required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    durationSeconds: { type: Number, default: 0 },
    storageKey: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoiceSample", voiceSampleSchema);
