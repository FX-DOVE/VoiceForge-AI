const voiceService = require("../services/voiceService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const voices = await voiceService.listVoices(req.query);
  sendSuccess(res, { voices });
});

const getBySlug = asyncHandler(async (req, res) => {
  const voice = await voiceService.getVoiceBySlug(req.params.slug);
  if (!voice) throw Object.assign(new Error("Voice not found."), { statusCode: 404 });
  sendSuccess(res, { voice });
});

const preview = asyncHandler(async (req, res) => {
  const result = await voiceService.getVoicePreview(req.params.slug);
  if (!result) throw Object.assign(new Error("Voice not found."), { statusCode: 404 });
  sendSuccess(res, { url: result.url, cached: result.cached });
});

const create = asyncHandler(async (req, res) => {
  const voice = await voiceService.createVoice(req.user._id, req.body);
  sendSuccess(res, { voice }, "Voice created successfully.", 201);
});

module.exports = { list, getBySlug, preview, create };
