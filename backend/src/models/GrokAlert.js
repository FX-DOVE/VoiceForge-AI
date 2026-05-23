const mongoose = require("mongoose");

const grokAlertSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: ["low_balance", "zero_balance", "high_usage", "api_error", "funding_added", "system"]
    },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["unread", "read", "acknowledged", "resolved"],
      default: "unread"
    },
    severity: { 
      type: String, 
      enum: ["info", "warning", "critical"],
      default: "info"
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    sentVia: [{ 
      type: String, 
      enum: ["email", "telegram", "whatsapp", "sms", "push"]
    }],
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Indexes
grokAlertSchema.index({ type: 1 });
grokAlertSchema.index({ status: 1 });
grokAlertSchema.index({ severity: 1 });
grokAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("GrokAlert", grokAlertSchema);
