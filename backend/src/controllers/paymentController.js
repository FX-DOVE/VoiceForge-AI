const paymentService = require("../services/paymentService");
const { calculateCreditsFromPayment } = require("../utils/creditCalc");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const purchaseCredits = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const data = await paymentService.processPayment(req.user._id, amount);
  sendSuccess(res, data, "Credits purchased successfully.", 200);
});

const estimateCredits = asyncHandler(async (req, res) => {
  const amount = parseFloat(req.query.amount);
  if (!amount || amount <= 0) {
    return sendSuccess(res, { estimatedCredits: 0, amount: 0 });
  }
  const estimatedCredits = calculateCreditsFromPayment(amount);
  sendSuccess(res, { estimatedCredits, amount });
});

const getBalance = asyncHandler(async (req, res) => {
  const data = await paymentService.getCreditBalance(req.user._id);
  sendSuccess(res, data);
});

module.exports = { purchaseCredits, estimateCredits, getBalance };
