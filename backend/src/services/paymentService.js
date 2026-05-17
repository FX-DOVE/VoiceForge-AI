const { User } = require("../models");
const { calculateCreditsFromPayment } = require("../utils/creditCalc");

/**
 * Process a successful payment: add credits to the user.
 * @param {string} userId
 * @param {number} paymentAmount - dollar amount paid
 * @returns {object} updated credit balances
 */
async function processPayment(userId, paymentAmount) {
  if (!paymentAmount || paymentAmount <= 0) {
    throw Object.assign(new Error("Invalid payment amount."), { statusCode: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }

  const creditsToAdd = calculateCreditsFromPayment(paymentAmount);

  user.totalCredits += creditsToAdd;
  user.creditsRemaining += creditsToAdd;
  user.totalPayments += paymentAmount;
  await user.save();

  return {
    creditsAdded: creditsToAdd,
    totalCredits: user.totalCredits,
    creditsUsed: user.creditsUsed,
    creditsRemaining: user.creditsRemaining,
    totalPayments: user.totalPayments,
  };
}

/**
 * Get credit balance for a user.
 */
async function getCreditBalance(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }

  return {
    totalCredits: user.totalCredits,
    creditsUsed: user.creditsUsed,
    creditsRemaining: user.creditsRemaining,
    totalPayments: user.totalPayments,
  };
}

module.exports = { processPayment, getCreditBalance };
