const mongoose = require("mongoose");

const welcomeGrantSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    ipAddress: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creditsGranted: { type: Number, required: true },
  },
  { timestamps: true }
);

welcomeGrantSchema.index({ email: 1 }, { unique: true });
welcomeGrantSchema.index({ ipAddress: 1 });

module.exports = mongoose.model("WelcomeGrant", welcomeGrantSchema);
