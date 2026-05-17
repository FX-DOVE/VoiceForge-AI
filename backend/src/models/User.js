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
    status: { type: String, enum: ["active", "suspended", "invited"], default: "active" },
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
  const limit = getCharactersLimit(this.plan);
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    avatarUrl: this.avatarUrl,
    role: this.role,
    plan: this.plan,
    status: this.status,
    usage: {
      charactersUsed: this.charactersUsed,
      charactersLimit: limit,
      resetAt: this.usageResetAt,
    },
    totalCredits: this.totalCredits,
    creditsUsed: this.creditsUsed,
    creditsRemaining: this.creditsRemaining,
    totalPayments: this.totalPayments,
  };
};

module.exports = mongoose.model("User", userSchema);
