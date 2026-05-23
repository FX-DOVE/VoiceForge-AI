const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { getCharactersLimit } = require("../utils/planLimits");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    name: { type: String, trim: true, default: "" },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    status: { type: String, enum: ["active", "suspended", "invited", "banned", "restricted"], default: "active" },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    restrictionReason: { type: String, default: null },
    restrictedAt: { type: Date, default: null },
    restrictedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    restrictions: { type: [String], default: [] }, // e.g., ["tts", "cloning", "payments"]
    charactersUsed: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    totalCredits: { type: Number, default: 0 },
    creditsUsed: { type: Number, default: 0 },
    creditsRemaining: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    stripeCustomerId: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    emailVerifiedAt: { type: Date, default: null },
    // Welcome credits tracking - only awarded after email verification
    hasReceivedWelcomeCredits: { type: Boolean, default: false },
    welcomeCreditsAwardedAt: { type: Date, default: null },
    welcomeModalSeen: { type: Boolean, default: false },
    // Legal acceptance tracking
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, default: null },
    termsVersion: { type: String, default: null },
    refundPolicyAccepted: { type: Boolean, default: false },
    refundPolicyAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    avatarUrl: this.avatarUrl,
    role: this.role,
    plan: this.plan,
    status: this.status,
    banReason: this.banReason,
    bannedAt: this.bannedAt,
    restrictionReason: this.restrictionReason,
    restrictedAt: this.restrictedAt,
    restrictions: this.restrictions || [],
    totalCredits: this.totalCredits || 0,
    creditsUsed: this.creditsUsed || 0,
    creditsRemaining: this.creditsRemaining || 0,
    totalPayments: this.totalPayments || 0,
    emailVerified: this.emailVerified || false,
    emailVerifiedAt: this.emailVerifiedAt || null,
    hasReceivedWelcomeCredits: this.hasReceivedWelcomeCredits || false,
    welcomeModalSeen: this.welcomeModalSeen || false,
  };
};

module.exports = mongoose.model("User", userSchema);
