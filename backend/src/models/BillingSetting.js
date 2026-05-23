const mongoose = require("mongoose");

const billingSettingSchema = new mongoose.Schema(
  {
    creditsPerDollar: { type: Number, default: 1500 },
    minimumPaymentUsd: { type: Number, default: 1 },
    welcomeCredits: { type: Number, default: 2380 },
    welcomeCreditUsd: { type: Number, default: 0.01 }, 
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// We'll use a singleton pattern for settings (only one document)
billingSettingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("BillingSetting", billingSettingSchema);
