const mongoose = require("mongoose");
const crypto = require("crypto");

const creditGiftSchema = new mongoose.Schema(
  {
    // Unique claim token
    token: { type: String, required: true, unique: true, index: true },
    // Admin who created
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Target recipients (null = all users)
    recipients: { type: String, enum: ["all", "specific"], default: "all" },
    specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Credit details
    usdAmount: { type: Number, required: true },
    credits: { type: Number, required: true },
    // Email content
    subject: { type: String, required: true },
    heading: { type: String, default: "" },
    body: { type: String, required: true }, // HTML content from admin
    imageUrl: { type: String, default: "" },
    gifUrl: { type: String, default: "" },
    buttonText: { type: String, default: "Claim Your Free Credits" },
    // Campaign tracking
    campaignName: { type: String, default: "" },
    totalSent: { type: Number, default: 0 },
    totalClaimed: { type: Number, default: 0 },
    // Expiry
    expiresAt: { type: Date, required: true },
    // Status
    status: { type: String, enum: ["draft", "sent", "expired"], default: "draft" },
  },
  { timestamps: true }
);

// Track individual claims
const creditGiftClaimSchema = new mongoose.Schema(
  {
    gift: { type: mongoose.Schema.Types.ObjectId, ref: "CreditGift", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    credits: { type: Number, required: true },
    claimedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a user can only claim a specific gift once
creditGiftClaimSchema.index({ gift: 1, user: 1 }, { unique: true });

// Static: generate a unique token
creditGiftSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

const CreditGift = mongoose.model("CreditGift", creditGiftSchema);
const CreditGiftClaim = mongoose.model("CreditGiftClaim", creditGiftClaimSchema);

module.exports = { CreditGift, CreditGiftClaim };
