const voiceService = require("../services/voiceService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const voices = await voiceService.listVoices(req.query, req.user || null);
  sendSuccess(res, { voices });
});

const getBySlug = asyncHandler(async (req, res) => {
  const voice = await voiceService.getVoiceBySlug(req.params.slug);
  if (!voice) throw Object.assign(new Error("Voice not found."), { statusCode: 404 });
  sendSuccess(res, { voice });
});

const listByProvider = asyncHandler(async (req, res) => {
  const provider = req.params.provider;
  // Map friendly names (internal only)
  const prov = provider === "eleven" || provider === "professional" ? "elevenlabs" : provider;
  const voices = await voiceService.listVoices({ provider: prov }, req.user || null);
  // Do not expose raw provider string in envelope for end-user routes; use display from first voice or generic
  const displayName = voices[0]?.displayName || "VoiceForge";
  sendSuccess(res, { voices, displayName });
});

const listByModel = asyncHandler(async (req, res) => {
  const model = req.params.model;
  const voices = await voiceService.listVoices({ model }, req.user || null);
  const displayName = voices[0]?.displayName || "VoiceForge";
  sendSuccess(res, { voices, displayName });
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

module.exports = { list, getBySlug, preview, create, listByProvider, listByModel };
