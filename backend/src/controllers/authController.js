const authService = require("../services/authService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  res.cookie("token", data.accessToken, COOKIE_OPTIONS);
  sendSuccess(res, data, "Account created successfully.", 201);
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  res.cookie("token", data.accessToken, COOKIE_OPTIONS);
  sendSuccess(res, data, "Signed in successfully.");
});

const logout = asyncHandler(async (req, res) => {
  // Revoke refresh token if exists
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    const { RefreshToken } = require("../models");
    await RefreshToken.updateOne(
      { token: refreshToken },
      { revokedAt: new Date() }
    );
  }
  
  // Clear all auth cookies
  res.clearCookie("token", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  
  sendSuccess(res, null, "Signed out successfully.");
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email);
  sendSuccess(res, data, data.message);
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = await authService.resetPassword(req.body);
  sendSuccess(res, data, data.message);
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user._id);
  sendSuccess(res, { user: data });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const data = await authService.verifyEmail(token, req.ip);
  sendSuccess(res, data, data.message);
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await authService.resendVerificationEmail(email);
  sendSuccess(res, data, data.message);
});

module.exports = { register, login, logout, forgotPassword, resetPassword, me, verifyEmail, resendVerification };
