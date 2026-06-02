const paymentService = require("../services/paymentService");
const { User } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const initialize = asyncHandler(async (req, res) => {
  const { amount, refundPolicyAccepted } = req.body;
  if (!amount || amount <= 0) {
    throw Object.assign(new Error("Valid amount is required"), { statusCode: 400 });
  }
  
  // Validate refund policy acceptance
  if (!refundPolicyAccepted) {
    throw Object.assign(new Error("You must acknowledge that all purchases are final and non-refundable before proceeding with payment."), { statusCode: 400 });
  }
  
  // Update user's refund policy acceptance
  const user = await User.findById(req.user._id);
  if (user) {
    user.refundPolicyAccepted = true;
    user.refundPolicyAcceptedAt = new Date();
    await user.save();
  }
  
  const data = await paymentService.initializePaystackTransaction(req.user._id, req.user.email, amount);
  sendSuccess(res, data, "Transaction initialized", 200);
});

const verify = asyncHandler(async (req, res) => {
  const { reference } = req.body;
  if (!reference) {
    throw Object.assign(new Error("Reference is required"), { statusCode: 400 });
  }
  const data = await paymentService.verifyPaystackTransaction(reference);
  sendSuccess(res, data, "Payment verified successfully", 200);
});

const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  // For webhooks we need the raw body, express.raw() is configured in server.js ideally
  // Assuming req.body is buffer or string handled by raw middleware
  await paymentService.handlePaystackWebhook(signature, req.body);
  res.status(200).send("Webhook received");
});

const getBalance = asyncHandler(async (req, res) => {
  const data = await paymentService.getCreditBalance(req.user._id);
  sendSuccess(res, data);
});

const claimGift = asyncHandler(async (req, res) => {
  const adminService = require("../services/adminService");
  const { token } = req.body;
  if (!token) {
    throw Object.assign(new Error("Claim token is required"), { statusCode: 400 });
  }
  const data = await adminService.claimGiftCredits(req.user._id, token);
  sendSuccess(res, data, data.message);
});

const estimate = asyncHandler(async (req, res) => {
  const { calculateCreditsFromPayment, calculateEstimatedApiCost, getBillingSettings, getProviderProfile } = require("../utils/creditCalc");
  const amount = parseFloat(req.query.amount);
  const provider = req.query.provider || "xai"; // support professional for elevenlabs/professional deposits
  if (!amount || amount <= 0) {
    throw Object.assign(new Error("Valid amount is required"), { statusCode: 400 });
  }

  const credits = await calculateCreditsFromPayment(amount, provider);
  const profile = await getProviderProfile(provider);
  const apiCost = await calculateEstimatedApiCost(
    (amount * profile.apiShare / profile.costPerMillionCharacters) * 1_000_000,
    provider
  );

  sendSuccess(res, {
    amount,
    provider,
    credits,
    estimatedApiCost: apiCost,
    profile,
    // Also return current settings so frontend can show breakdown
    settings: await getBillingSettings(),
  });
});

module.exports = { initialize, verify, webhook, getBalance, claimGift, estimate };
