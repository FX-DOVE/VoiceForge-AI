const crypto = require("crypto");
const { User, RefreshToken, WelcomeGrant, BillingSetting } = require("../models");
const config = require("../config");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");
const { sendPasswordResetEmail, sendWelcomeEmail, sendVerificationEmail } = require("../integrations/email");

function buildAuthPayload(user) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  return { accessToken, refreshToken, user: user.toPublicJSON() };
}

async function persistRefreshToken(userId, token, meta = {}) {
  const decoded = verifyRefreshToken(token);
  await RefreshToken.create({
    user: userId,
    token,
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: meta.userAgent || "",
    ipAddress: meta.ipAddress || "",
  });
}

async function register({ email, password, name, termsAccepted, termsVersion }, meta = {}) {
  // Validate terms acceptance
  if (!termsAccepted) {
    throw Object.assign(new Error("You must accept the Terms of Service, Privacy Policy, and Refund Policy to create an account."), {
      statusCode: 400,
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(new Error("An account with this email already exists."), {
      statusCode: 409,
    });
  }

  const role = config.adminEmail && email.toLowerCase() === config.adminEmail ? "admin" : "user";
  
  // Create email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  
  const user = await User.create({ 
    email, 
    password, 
    name: name || "", 
    role,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
    termsVersion: termsVersion || "2026-05-18",
    emailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    // Credits will be awarded AFTER email verification
    hasReceivedWelcomeCredits: false,
  });

  // Send welcome email
  try {
    await sendWelcomeEmail({ to: user.email, name: user.name });
  } catch (err) {
    console.error("[auth] Failed to send welcome email:", err.message);
  }

  // Send verification email
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
  try {
    await sendVerificationEmail({ to: user.email, verificationUrl, name: user.name });
    console.log(`[auth] Verification email sent to ${user.email}`);
  } catch (err) {
    console.error("[auth] Failed to send verification email:", err.message);
  }

  const tokens = buildAuthPayload(user);
  await persistRefreshToken(user._id, tokens.refreshToken, meta);
  
  // Note: Welcome credits will be awarded AFTER email verification
  // No credits granted at registration time
  tokens.welcomeCreditsGranted = false;
  tokens.welcomeCreditsAmount = 0;
  
  // Add verification status
  tokens.emailVerified = user.emailVerified;
  tokens.requiresEmailVerification = !user.emailVerified;
  
  return tokens;
}

async function grantWelcomeCredits(user, ipAddress) {
  // Idempotency check: already awarded?
  if (user.hasReceivedWelcomeCredits) {
    console.log(`[Welcome] User ${user.email} already received welcome credits`);
    return 0;
  }

  const settings = await BillingSetting.getSettings();
  const { calculateCreditsFromPayment } = require("../utils/creditCalc");
  const config = require("../config");
  
  // Use config as fallback, ensure reasonable limits (max 5,000 credits)
  const welcomeUsd = settings.welcomeCreditUsd || config.welcomeCreditUsd || 0.01;
  let credits = Math.floor(calculateCreditsFromPayment(welcomeUsd));
  
  // Cap welcome credits at 2,380 (fixed amount)
  const MAX_WELCOME_CREDITS = 2380;
  credits = Math.min(credits, MAX_WELCOME_CREDITS);
  
  // Fixed welcome bonus - always 2,380 credits
  if (!credits || credits <= 0 || credits > MAX_WELCOME_CREDITS) {
    credits = 2380;
  }
  
  if (!credits || credits <= 0) return 0;

  try {
    // Check if this email already received welcome credits (additional safety)
    const existingByEmail = await WelcomeGrant.findOne({ email: user.email });
    if (existingByEmail) {
      // Mark user as already received to prevent future checks
      user.hasReceivedWelcomeCredits = true;
      user.welcomeCreditsAwardedAt = existingByEmail.createdAt;
      await user.save();
      return 0;
    }

    // Check if this IP already received welcome credits (skip if no IP)
    if (ipAddress && process.env.NODE_ENV === "production") {
      const existingByIp = await WelcomeGrant.findOne({ ipAddress });
      if (existingByIp) return 0;
    }

    // Grant credits atomically with flag update
    user.totalCredits += credits;
    user.creditsRemaining += credits;
    user.hasReceivedWelcomeCredits = true;
    user.welcomeCreditsAwardedAt = new Date();
    await user.save();

    await WelcomeGrant.create({
      email: user.email,
      ipAddress: ipAddress || "",
      user: user._id,
      creditsGranted: credits,
    });
    
    console.log(`[Welcome] Granted ${credits} welcome credits to ${user.email} after email verification`);
    return credits;
  } catch (err) {
    // Duplicate key = already granted — silently skip
    if (err.code === 11000) return 0;
    console.error("[Welcome] Failed to grant credits:", err.message);
    return 0;
  }
}

async function login({ email, password }, meta = {}) {
  const user = await User.findOne({ email }).select("+password +emailVerified +emailVerificationToken +emailVerificationExpires");
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error("Invalid email or password."), { statusCode: 401 });
  }
  if (user.status === "suspended") {
    throw Object.assign(new Error("Your account has been suspended."), { statusCode: 403 });
  }

  const tokens = buildAuthPayload(user);
  await persistRefreshToken(user._id, tokens.refreshToken, meta);
  
  // Add email verification status to response
  tokens.user.emailVerified = user.emailVerified;
  tokens.requiresEmailVerification = !user.emailVerified;
  
  return tokens;
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: "If that email exists, we sent reset instructions." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = new Date(
    Date.now() + config.passwordResetExpiresMinutes * 60 * 1000
  );
  await user.save();

  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  
  // Try to send email, but don't fail the request if email fails
  try {
    await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });
  } catch (err) {
    console.error("[auth] Failed to send password reset email:", err.message);
    // Still return success to prevent email enumeration attacks
    // The user will see the reset URL in console logs during development
  }

  return { message: "If that email exists, we sent reset instructions." };
}

async function resetPassword({ token, password }) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) {
    throw Object.assign(new Error("Reset link is invalid or has expired."), { statusCode: 400 });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password updated successfully." };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404 });
  }
  return user.toPublicJSON();
}

async function verifyEmail(token, ipAddress = "") {
  if (!token) {
    throw Object.assign(new Error("Verification token is required."), { statusCode: 400 });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw Object.assign(new Error("Invalid or expired verification link. Please request a new one."), { statusCode: 400 });
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  // Save user first before granting credits to ensure verification is recorded
  await user.save();

  console.log(`[auth] Email verified for ${user.email}`);

  // Award welcome credits ONLY after successful email verification
  let creditsGranted = 0;
  let welcomeBonusAwarded = false;
  
  if (!user.hasReceivedWelcomeCredits) {
    creditsGranted = await grantWelcomeCredits(user, ipAddress);
    welcomeBonusAwarded = creditsGranted > 0;
    
    if (welcomeBonusAwarded) {
      console.log(`[Welcome] Awarded ${creditsGranted} credits to newly verified user ${user.email}`);
    }
  }
  
  return { 
    message: "Email verified successfully! You can now use all features.",
    emailVerified: true,
    welcomeBonusAwarded,
    creditsGranted,
    user: user.toPublicJSON()
  };
}

async function resendVerificationEmail(email) {
  const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");
  
  if (!user) {
    // Don't reveal if email exists
    return { message: "If that email exists, we sent verification instructions." };
  }

  if (user.emailVerified) {
    return { message: "Email is already verified." };
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
  try {
    await sendVerificationEmail({ to: user.email, verificationUrl, name: user.name });
    console.log(`[auth] Verification email resent to ${user.email}`);
  } catch (err) {
    console.error("[auth] Failed to resend verification email:", err.message);
  }

  return { message: "If that email exists, we sent verification instructions." };
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  buildAuthPayload,
  verifyEmail,
  resendVerificationEmail,
};
