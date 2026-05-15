const crypto = require("crypto");
const { User, RefreshToken } = require("../models");
const config = require("../config");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");
const { sendPasswordResetEmail } = require("../integrations/email");

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

async function register({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(new Error("An account with this email already exists."), {
      statusCode: 409,
    });
  }

  const user = await User.create({ email, password, name: name || "" });
  const tokens = buildAuthPayload(user);
  await persistRefreshToken(user._id, tokens.refreshToken);
  return tokens;
}

async function login({ email, password }, meta = {}) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error("Invalid email or password."), { statusCode: 401 });
  }
  if (user.status === "suspended") {
    throw Object.assign(new Error("Your account has been suspended."), { statusCode: 403 });
  }

  const tokens = buildAuthPayload(user);
  await persistRefreshToken(user._id, tokens.refreshToken, meta);
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
  await sendPasswordResetEmail({ to: user.email, resetUrl });

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

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  buildAuthPayload,
};
