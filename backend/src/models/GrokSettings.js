const mongoose = require("mongoose");

const grokSettingsSchema = new mongoose.Schema(
  {
    lowBalanceThreshold: { type: Number, default: 2.0 }, // USD
    ttsCostPerHour: { type: Number, default: 0.25 }, // USD
    autoPauseAtZero: { type: Boolean, default: true },
    autoPauseBelowThreshold: { type: Boolean, default: false },
    apiPollingInterval: { type: Number, default: 300000 }, // 5 minutes in ms
    defaultCurrency: { type: String, default: "USD" },
    
    // Notification settings
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        recipients: [{ type: String }], // Email addresses
        lowBalanceEnabled: { type: Boolean, default: true },
        zeroBalanceEnabled: { type: Boolean, default: true },
        dailyReportEnabled: { type: Boolean, default: false },
      },
      telegram: {
        enabled: { type: Boolean, default: false },
        botToken: { type: String, default: "" },
        chatId: { type: String, default: "" },
        lowBalanceEnabled: { type: Boolean, default: true },
        zeroBalanceEnabled: { type: Boolean, default: true },
      },
      whatsapp: {
        enabled: { type: Boolean, default: false },
        phoneNumbers: [{ type: String }],
        lowBalanceEnabled: { type: Boolean, default: true },
        zeroBalanceEnabled: { type: Boolean, default: true },
      },
    },
    
    // Alert thresholds
    alertThresholds: {
      lowBalance: { type: Number, default: 2.0 },
      highUsage: { type: Number, default: 100.0 }, // USD per day
      consecutiveErrors: { type: Number, default: 5 },
    },
    
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Singleton pattern - only one settings document
grokSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("GrokSettings", grokSettingsSchema);
