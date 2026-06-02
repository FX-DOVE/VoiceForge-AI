const professionalService = require("../services/professionalService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const subscribe = asyncHandler(async (req, res) => {
  const { refundPolicyAccepted = true } = req.body || {};
  const data = await professionalService.subscribe(
    req.user._id,
    req.user.email,
    { refundPolicyAccepted }
  );
  sendSuccess(res, data, "Professional subscription payment initialized. Complete payment to activate.", 200);
});

const status = asyncHandler(async (req, res) => {
  const data = await professionalService.getStatus(req.user._id);
  sendSuccess(res, data);
});

// Optional: allow frontend to trigger manual renew/init without going through generic checkout
const renew = asyncHandler(async (req, res) => {
  const data = await professionalService.subscribe(
    req.user._id,
    req.user.email,
    { refundPolicyAccepted: true }
  );
  sendSuccess(res, data, "Renewal payment initialized.", 200);
});

module.exports = { subscribe, status, renew };
