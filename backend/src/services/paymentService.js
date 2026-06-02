const crypto = require("crypto");
const { User, Payment, BillingSetting } = require("../models");
const config = require("../config");

/**
 * Initialize a Paystack transaction
 */
async function initializePaystackTransaction(userId, email, amountUsd) {
  const settings = await BillingSetting.getNormalized();
  const minPayment = settings.minimumDepositUsd || 1;
  if (amountUsd < minPayment) {
    throw Object.assign(new Error(`Minimum deposit is $${minPayment}.`), { statusCode: 400 });
  }
  if (settings.maximumDepositUsd && amountUsd > settings.maximumDepositUsd) {
    throw Object.assign(new Error(`Maximum deposit is $${settings.maximumDepositUsd}.`), { statusCode: 400 });
  }

  const USD_TO_NGN_RATE = 1550;

  // Convert USD to NGN
  const amountNgn = amountUsd * USD_TO_NGN_RATE;
  
  // Paystack expects amount in Kobo for NGN
  const amountKobo = Math.round(amountNgn * 100);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency: "NGN",
      metadata: { userId: userId.toString() },
      callback_url: `${config.clientUrl}/checkout/verify`,
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw Object.assign(new Error(data.message || "Failed to initialize Paystack transaction"), { statusCode: 400 });
  }

  return data.data; // { authorization_url, access_code, reference }
}

/**
 * Verify a Paystack transaction and credit user if successful and not a duplicate
 */
async function verifyPaystackTransaction(reference) {
  if (!reference) {
    throw Object.assign(new Error("Reference is required."), { statusCode: 400 });
  }

  // 1. Check if already processed
  const existingPayment = await Payment.findOne({ reference });
  if (existingPayment && existingPayment.status === "success") {
    return await getCreditBalance(existingPayment.user);
  }

  // 2. Fetch from Paystack
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
    },
  });

  const data = await response.json();
  if (!data.status) {
    throw Object.assign(new Error(data.message || "Failed to verify transaction"), { statusCode: 400 });
  }

  const tx = data.data;
  
  if (tx.status !== "success") {
    throw Object.assign(new Error(`Transaction status is ${tx.status}`), { statusCode: 400 });
  }

  const userId = tx.metadata?.userId;
  if (!userId) {
    throw Object.assign(new Error("No user ID found in transaction metadata"), { statusCode: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }

  // 3. Calculate credits from ACTUAL amount paid (using new dynamic system)
  const USD_TO_NGN_RATE = 1550;
  let actualUsdAmount = 0;

  if (tx.currency === "NGN") {
    const actualNgnAmount = tx.amount / 100;
    actualUsdAmount = actualNgnAmount / USD_TO_NGN_RATE;
  } else if (tx.currency === "USD") {
    actualUsdAmount = tx.amount / 100;
  } else {
    throw Object.assign(new Error(`Unsupported currency: ${tx.currency}`), { statusCode: 400 });
  }

  const { calculateCreditsFromPayment, getBillingSettings } = require("../utils/creditCalc");

  // Determine provider profile for this deposit's credits
  // If user has Professional membership, their deposits buy credits at elevenlabs rates
  const isVfPro = user.plan === "professional" || (await (async () => {
    const { ProfessionalMembership } = require("../models");
    const m = await ProfessionalMembership.findOne({ user: user._id, status: "active" });
    return m && m.endDate > new Date();
  })());

  const depositProvider = isVfPro ? "elevenlabs" : "xai";
  let creditsToAdd = await calculateCreditsFromPayment(actualUsdAmount, depositProvider);

  // The $2.99 is subscription unlock only — do not add credits for the membership fee itself
  if (Math.abs(actualUsdAmount - 2.99) < 0.1 || actualUsdAmount === 2.99) {
    creditsToAdd = 0;
  }

  // 4. Update or create Payment record idempotently
  const paymentRecord = existingPayment || new Payment({ reference });
  paymentRecord.user = user._id;
  paymentRecord.amountPaid = tx.amount;
  paymentRecord.currency = tx.currency;
  paymentRecord.usdAmount = actualUsdAmount;
  paymentRecord.creditsAdded = creditsToAdd;
  paymentRecord.status = "success";
  paymentRecord.providerResponse = tx;
  paymentRecord.processedAt = new Date();

  await paymentRecord.save();

  // 5. Add credits to user and upgrade to Pro if $5+ total paid
  user.totalCredits += creditsToAdd;
  user.creditsRemaining += creditsToAdd;
  user.totalPayments += actualUsdAmount;

  // Professional membership activation for ~$2.99 payments (ElevenLabs + cloning)
  if (Math.abs(actualUsdAmount - 2.99) < 0.1 || actualUsdAmount === 2.99) {
    const { ProfessionalMembership } = require("../models");
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await ProfessionalMembership.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          status: "active",
          endDate: end,
          startDate: new Date(),
          autoRenew: true,
          provider: "paystack",
          amountPaid: actualUsdAmount,
          reference,
        }
      },
      { upsert: true }
    );
    user.plan = "professional";
    console.log(`[Payment] Activated Professional membership for ${user.email}`);
  } else if (user.totalPayments >= 5 && user.plan !== "pro" && user.plan !== "professional" && user.plan !== "enterprise") {
    user.plan = "pro";
    console.log(`[Payment] Upgraded ${user.email} to Pro (totalPayments: $${user.totalPayments.toFixed(2)})`);
  }
  await user.save();

  return await getCreditBalance(user._id);
}

/**
 * Handle Paystack webhook
 */
async function handlePaystackWebhook(signature, bodyBuffer) {
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(bodyBuffer).digest("hex");
  if (hash !== signature) {
    throw Object.assign(new Error("Invalid signature"), { statusCode: 400 });
  }

  const event = JSON.parse(bodyBuffer.toString());
  
  if (event.event === "charge.success") {
    const reference = event.data.reference;
    try {
      await verifyPaystackTransaction(reference);
      console.log(`[Webhook] Successfully processed payment ${reference}`);
    } catch (err) {
      console.error(`[Webhook] Error processing payment ${reference}:`, err.message);
    }
  }
}

/**
 * Get credit balance for a user
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

module.exports = {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  handlePaystackWebhook,
  getCreditBalance,
};
