const mongoose = require("mongoose");

const trainingJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    voiceClone: { type: mongoose.Schema.Types.ObjectId, ref: "VoiceClone", required: true },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    steps: [
      {
        key: String,
        label: String,
        status: { type: String, enum: ["pending", "active", "done", "failed"], default: "pending" },
      },
    ],
    bullJobId: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingJob", trainingJobSchema);
