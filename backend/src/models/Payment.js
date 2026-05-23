const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amountPaid: { type: Number, required: true },
    currency: { type: String, required: true },
    usdAmount: { type: Number, required: true },
    creditsAdded: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    providerResponse: { type: mongoose.Schema.Types.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
