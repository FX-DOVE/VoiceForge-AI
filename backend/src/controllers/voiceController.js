const voiceService = require("../services/voiceService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const voices = await voiceService.listVoices(req.query);
  sendSuccess(res, { voices });
});

const create = asyncHandler(async (req, res) => {
  const voice = await voiceService.createVoice(req.user._id, req.body);
  sendSuccess(res, { voice }, "Voice created successfully.", 201);
});

module.exports = { list, create };
