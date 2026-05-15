const authService = require("../services/authService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  sendSuccess(res, data, "Account created successfully.", 201);
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  sendSuccess(res, data, "Signed in successfully.");
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

module.exports = { register, login, forgotPassword, resetPassword, me };
