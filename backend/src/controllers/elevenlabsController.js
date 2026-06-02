const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { User, Voice, ProfessionalMembership, UsageRecord, AudioGeneration } = require("../models");
const elevenlabs = require("../integrations/elevenlabsService");
const { calculateCreditsForUsage, calculateEstimatedApiCost } = require("../utils/creditCalc");
const { uploadBuffer } = require("../integrations/storage");

/**
 * Dedicated VoiceForge Premium (studio) generate endpoint (Professional only).
 * Voice must be a registered elevenlabs provider voice (or pass external voiceId).
 * Still charges credits from the single wallet.
 * Existing /tts/generate remains the primary and fully compatible path.
 */
const generate = asyncHandler(async (req, res) => {
  const { text, voiceId, voiceSlug, modelId } = req.body || {};
  if (!text || typeof text !== "string" || text.length === 0) {
    throw Object.assign(new Error("text is required"), { statusCode: 400 });
  }
  if (text.length > 10000) {
    throw Object.assign(new Error("Text too long (max 10000 chars for direct EL)"), { statusCode: 400 });
  }

  const user = await User.findById(req.user._id);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  // Enforce Professional
  const isPlanPro = user.plan === "professional";
  let isMemActive = false;
  if (!isPlanPro) {
    const mem = await ProfessionalMembership.findOne({ user: user._id, status: "active" });
    isMemActive = !!(mem && mem.endDate > new Date());
  }
  if (!isPlanPro && !isMemActive) {
    throw Object.assign(new Error("VoiceForge Premium membership required for studio generation and cloning."), { statusCode: 403 });
  }

  // Resolve voice if slug or id provided (to get elevenlabsVoiceId)
  let elVoiceId = voiceId;
  let voiceDoc = null;
  if (!elVoiceId && voiceSlug) {
    voiceDoc = await Voice.findOne({ slug: voiceSlug, isActive: true });
    elVoiceId = voiceDoc?.elevenlabsVoiceId || voiceDoc?.xaiVoiceId || voiceDoc?.metadata?.elevenlabsVoiceId;
  } else if (voiceId) {
    voiceDoc = await Voice.findOne({ $or: [{ _id: voiceId }, { slug: voiceId }], isActive: true });
    if (voiceDoc) {
      elVoiceId = voiceDoc.elevenlabsVoiceId || voiceDoc.xaiVoiceId || elVoiceId;
    }
  }
  if (!elVoiceId) {
    // Allow direct external voice id for Professional users (they manage their clones)
    elVoiceId = voiceId;
  }
  if (!elVoiceId) {
    throw Object.assign(new Error("voiceId or voiceSlug is required"), { statusCode: 400 });
  }

  const charCount = text.length;
  const provider = "elevenlabs";
  const model = req.body.model || "flash";
  const creditsRequired = await calculateCreditsForUsage(charCount, provider, model);

  if (user.creditsRemaining < creditsRequired) {
    throw Object.assign(new Error("Insufficient credits"), { statusCode: 402 });
  }

  // Create generation record
  const generation = await AudioGeneration.create({
    user: user._id,
    text,
    voice: voiceDoc?._id || null,
    voiceSlug: voiceDoc?.slug || voiceSlug || "",
    voiceLabel: voiceDoc?.name || "VoiceForge Premium Voice",
    xaiVoiceId: elVoiceId, // reuse field for el id
    provider: "elevenlabs",
    model,
    status: "processing",
    charactersUsed: charCount,
    expiresAt: new Date(Date.now() + 28 * 60 * 60 * 1000),
  });

  try {
    const result = await elevenlabs.generateSpeech({
      text,
      voiceId: elVoiceId,
      modelId: modelId || "eleven_multilingual_v2",
    });

    let audioUrl = null;
    let downloadUrl = null;
    let storageKey = null;
    if (result.type === "audio" && result.buffer) {
      const uploaded = await uploadBuffer(result.buffer, {
        folder: "tts",
        filename: `${generation._id}.mp3`,
        mimeType: "audio/mpeg",
      });
      audioUrl = uploaded.url;
      downloadUrl = uploaded.downloadUrl;
      storageKey = uploaded.storageKey;
    }

    generation.status = "completed";
    generation.audioUrl = audioUrl;
    generation.downloadUrl = downloadUrl;
    generation.storageKey = storageKey;
    generation.durationSeconds = Math.max(1, Math.round(charCount / 15));
    await generation.save();

    // Charge
    const creditsToCharge = creditsRequired;
    const estimatedApiCost = await calculateEstimatedApiCost(charCount, provider, model);

    user.charactersUsed = (user.charactersUsed || 0) + charCount;
    user.creditsUsed = (user.creditsUsed || 0) + creditsToCharge;
    user.creditsRemaining = Math.max(0, (user.creditsRemaining || 0) - creditsToCharge);
    await user.save();

    await UsageRecord.create({
      user: user._id,
      type: "tts",
      amount: charCount,
      unit: "characters",
      meta: {
        creditsCharged: creditsToCharge,
        estimatedApiCostUsd: estimatedApiCost,
        provider,
      },
      referenceId: generation._id,
      referenceModel: "AudioGeneration",
    });

    generation.creditsCharged = creditsToCharge;
    generation.estimatedApiCostUsd = estimatedApiCost;
    await generation.save();

    sendSuccess(res, {
      id: generation._id.toString(),
      audioUrl,
      downloadUrl,
      charactersUsed: charCount,
      creditsCharged: creditsToCharge,
      // provider/model omitted - internal only
    }, "Generated with VoiceForge Premium", 201);
  } catch (err) {
    generation.status = "failed";
    generation.errorMessage = err.message;
    await generation.save();
    throw err;
  }
});

module.exports = { generate };
