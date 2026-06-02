const mongoose = require("mongoose");

// ProfessionalMembership = membership for "VoiceForge Professional" plan ($2.99/mo unlock for ElevenLabs voices + cloning)
const professionalMembershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    provider: { type: String, default: "paystack" }, // or stripe, etc.
    amountPaid: { type: Number, default: 2.99 },
    currency: { type: String, default: "USD" },
    reference: { type: String, default: null }, // payment reference
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for quick active check
professionalMembershipSchema.index({ user: 1, status: 1, endDate: 1 });

professionalMembershipSchema.methods.isActive = function () {
  return this.status === "active" && this.endDate > new Date();
};

module.exports = mongoose.model("ProfessionalMembership", professionalMembershipSchema);
