const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    resource: { type: String, default: "" },
    resourceId: { type: String, default: "" },
    message: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
