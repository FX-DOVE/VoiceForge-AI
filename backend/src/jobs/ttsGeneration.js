const { AudioGeneration, User, UsageRecord, GrokUsage } = require("../models");
const { synthesizeSpeech } = require("../integrations/xaiTts");
const { synthesizeSpeechEdge } = require("../integrations/edgeTts");
const elevenlabs = require("../integrations/elevenlabsService");
const { uploadBuffer } = require("../integrations/storage");
const { calculateCreditsForUsage, calculateEstimatedApiCost } = require("../utils/creditCalc");

/**
 * Local copy to avoid circular dependency with ttsService
 */
async function recordXaiUsageLocal({ userId, result, voiceId, text, status = "success" }) {
  try {
    const usage = result?.usage || {};
    const charCount = text?.length || 0;
    const costUsd = usage.costUsd || (usage.costInUsdTicks ? usage.costInUsdTicks / 10000000000 : 0);
    const estimatedCost = costUsd || (await calculateEstimatedApiCost(charCount));

    await GrokUsage.create({
      userId,
      serviceType: "tts",
      model: usage.modelUsed || voiceId || "tts-1",
      charactersUsed: usage.charactersProcessed || charCount,
      requestCount: 1,
      costUsd: estimatedCost,
      costInUsdTicks: usage.costInUsdTicks || 0,
      status,
      requestId: usage.requestId || null,
      metadata: { voiceId, characters: charCount },
    });
  } catch (err) {
    console.error("[Grok Usage] Failed to record usage in job:", err.message);
  }
}

/**
 * Core synthesis + persistence logic used by both sync and queued paths.
 * This function assumes the AudioGeneration document already exists with status "processing".
 */
async function runTtsGeneration(generationId) {
  const generation = await AudioGeneration.findById(generationId);
  if (!generation) {
    throw new Error(`AudioGeneration ${generationId} not found`);
  }

  const user = await User.findById(generation.user);
  if (!user) {
    throw new Error("User not found for generation");
  }

  const charCount = generation.text?.length || 0;
  const isCloned = !!generation.voice && (await isClonedVoice(generation.voice));
  const voiceProvider = generation.provider || "xai";
  const voiceModel = generation.model || (voiceProvider === "elevenlabs" ? "flash" : "voice_api");

  let result;
  const xaiVoiceId = generation.xaiVoiceId;
  const edgeVoiceId = xaiVoiceId || "en-US-JennyNeural";

  const t0 = Date.now();

  try {
    if (voiceProvider === "elevenlabs") {
      console.log(`[TTS Job] Synthesizing ${charCount} chars via ElevenLabs model=${voiceModel} for generation ${generationId}`);
      const elVoiceId = generation.xaiVoiceId || generation.elevenlabsVoiceId || "21m00Tcm4TlvDq8ikWAM";
      const elModel = voiceModel === "multilingual_v3" ? "eleven_multilingual_v2" : "eleven_flash_v2_5";
      result = await elevenlabs.generateSpeech({
        text: generation.text,
        voiceId: elVoiceId,
        modelId: elModel,
      });
      console.log(`[TTS Job] ElevenLabs synthesis done`);
    } else {
      console.log(`[TTS Job] Synthesizing ${charCount} chars via xAI for generation ${generationId}`);
      const synthStart = Date.now();

      result = await synthesizeSpeech({
        text: generation.text,
        voiceId: xaiVoiceId,
        language: generation.language || "auto",
      });

      const synthDuration = Date.now() - synthStart;
      console.log(`[TTS Job] xAI synthesis done in ${(synthDuration / 1000).toFixed(1)}s`);

      await recordXaiUsageLocal({
        userId: generation.user,
        result,
        voiceId: xaiVoiceId,
        text: generation.text,
        status: "success",
      });
    }
  } catch (err) {
    if (err.usage) {
      await recordXaiUsageLocal({
        userId: generation.user,
        result: { usage: err.usage },
        voiceId: xaiVoiceId,
        text: generation.text,
        status: "failed",
      });
    }

    const isNetworkError =
      err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT";

    if (isNetworkError) {
      console.warn(`[TTS Job] xAI network error — falling back to Edge TTS for ${generationId}`);
      result = await synthesizeSpeechEdge({
        text: generation.text,
        xaiVoiceId: edgeVoiceId,
        speed: generation.speed ?? 1,
        stability: generation.stability ?? 0.75,
      });
    } else {
      throw err;
    }
  }

  // Upload audio
  let audioUrl = null;
  let downloadUrl = null;
  let storageKey = null;
  let durationSeconds = Math.max(1, Math.round(charCount / 15));

  const uploadStart = Date.now();
  if (result?.type === "audio" && result.buffer) {
    const ext = generation.codec === "wav" ? "wav" : "mp3";
    const uploaded = await uploadBuffer(result.buffer, {
      folder: "tts",
      filename: `${generation._id}.${ext}`,
      mimeType: result.contentType || `audio/${ext}`,
    });
    audioUrl = uploaded.url;
    downloadUrl = uploaded.downloadUrl;
    storageKey = uploaded.storageKey;
  } else if (result?.data?.audio_url) {
    audioUrl = result.data.audio_url;
    downloadUrl = result.data.download_url || result.data.audio_url;
    durationSeconds = result.data.duration_seconds || durationSeconds;
  }
  const uploadDuration = Date.now() - uploadStart;
  if (uploadDuration > 500) {
    console.log(`[TTS Job] Upload took ${(uploadDuration / 1000).toFixed(1)}s`);
  }

  // Mark complete
  generation.status = "completed";
  generation.audioUrl = audioUrl;
  generation.downloadUrl = downloadUrl;
  generation.storageKey = storageKey;
  generation.durationSeconds = durationSeconds;
  await generation.save();

  // Charge credits (only if not already charged)
  if (charCount > 0 && user.creditsRemaining > 0) {
    const creditsToCharge = await calculateCreditsForUsage(charCount, voiceProvider, voiceModel);
    const estimatedApiCost = await calculateEstimatedApiCost(charCount, voiceProvider, voiceModel);

    user.charactersUsed = (user.charactersUsed || 0) + charCount;
    user.creditsUsed = (user.creditsUsed || 0) + creditsToCharge;
    user.creditsRemaining = Math.max(0, (user.creditsRemaining || 0) - creditsToCharge);
    await user.save();

    await UsageRecord.create({
      user: generation.user,
      type: "tts",
      amount: charCount,
      unit: "characters",
      meta: {
        creditsCharged: creditsToCharge,
        estimatedApiCostUsd: estimatedApiCost,
        provider: voiceProvider,
        job: "queued",
      },
      referenceId: generation._id,
      referenceModel: "AudioGeneration",
    });

    generation.creditsCharged = creditsToCharge;
    generation.estimatedApiCostUsd = estimatedApiCost;
    if (!generation.provider) generation.provider = voiceProvider;
    if (!generation.model) generation.model = voiceModel;
    await generation.save();
  }

  return generation;
}

// Helper to detect if a voice is cloned (lightweight)
async function isClonedVoice(voiceId) {
  const { Voice } = require("../models");
  const v = await Voice.findById(voiceId).lean();
  return v?.type === "cloned";
}

async function processTtsJob(job) {
  const { generationId } = job.data;
  const startTime = Date.now();

  console.log(`[TTS Job] ▶️ Starting job ${job.id} for generation ${generationId}`);

  try {
    const generation = await runTtsGeneration(generationId);

    const totalDuration = Date.now() - startTime;
    generation.processingTimeMs = totalDuration;
    await generation.save();

    console.log(`[TTS Job] ✅ Generation ${generationId} completed in ${(totalDuration / 1000).toFixed(1)}s`);
  } catch (err) {
    const failDuration = Date.now() - startTime;
    console.error(`[TTS Job] ❌ Generation ${generationId} failed after ${(failDuration / 1000).toFixed(1)}s:`, err.message);

    const generation = await AudioGeneration.findById(generationId);
    if (generation) {
      generation.status = "failed";
      generation.errorMessage = err.message || "Generation failed in background job";
      generation.processingTimeMs = failDuration;
      await generation.save();
    }
    throw err;
  }
}

module.exports = {
  processTtsJob,
  runTtsGeneration, // exported so sync path can potentially reuse in future
};
