const mongoose = require("mongoose");

const grokFundingSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: { 
      type: String, 
      required: true,
      enum: ["credit_card", "bank_transfer", "crypto", "paypal", "other"]
    },
    referenceNumber: { type: String, default: null },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed"
    },
  },
  { timestamps: true }
);

// Index for fast lookup by date
grokFundingSchema.index({ date: -1 });
grokFundingSchema.index({ status: 1 });
grokFundingSchema.index({ createdBy: 1 });

module.exports = mongoose.model("GrokFunding", grokFundingSchema);
