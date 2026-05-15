const usageService = require("../services/usageService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const summary = asyncHandler(async (req, res) => {
  const data = await usageService.getUsageSummary(req.user._id);
  sendSuccess(res, data);
});

module.exports = { summary };
