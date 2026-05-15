const mongoose = require("mongoose");

const usageRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["tts", "clone_training", "api", "upload"],
      required: true,
    },
    amount: { type: Number, default: 0 },
    unit: { type: String, enum: ["characters", "seconds", "bytes", "requests"], default: "characters" },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    referenceModel: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsageRecord", usageRecordSchema);
