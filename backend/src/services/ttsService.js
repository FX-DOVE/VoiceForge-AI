const path = require("path");
const fs = require("fs");
const {
  Voice,
  AudioGeneration,
  UsageRecord,
  User,
  GrokUsage,
} = require("../models");
const config = require("../config");
const { synthesizeSpeech } = require("../integrations/xaiTts");
const { synthesizeSpeechEdge } = require("../integrations/edgeTts");
const elevenlabs = require("../integrations/elevenlabsService");
const { enqueueTtsJob, QUEUE_NAME: TTS_QUEUE_NAME } = require("../jobs/ttsQueue");
const { uploadBuffer } = require("../integrations/storage");
const { getCharactersLimit } = require("../utils/planLimits");
const { calculateCreditsForUsage, calculateEstimatedApiCost } = require("../utils/creditCalc");

const LONG_TTS_CHAR_THRESHOLD = 2200; // Above this → use background queue for better UX

/**
 * Record xAI API usage for Grok Management tracking
 */
async function recordXaiUsage({ userId, result, voiceId, text, status = "success" }) {
  try {
    // Extract usage data from xAI response if available
    const usage = result?.usage || {};
    const charCount = text?.length || 0;

    // Use actual cost from xAI if available, otherwise estimate using live billing settings
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
      metadata: {
        voiceId,
        characters: charCount,
        actualCost: costUsd,
        estimatedCost: costUsd === 0 ? estimatedCost : 0,
      },
    });

    console.log(`[Grok Usage] Recorded TTS usage: $${estimatedCost.toFixed(6)} for ${charCount} chars`);
  } catch (err) {
    // Don't fail the TTS request if usage recording fails
    console.error("[Grok Usage] Failed to record usage:", err.message);
  }
}

async function resolveVoice({ voiceId, voiceSlug }) {
  if (voiceId) {
    const byId = await Voice.findById(voiceId);
    if (byId) return byId;
  }
  if (voiceSlug) {
    const bySlug = await Voice.findOne({ slug: voiceSlug, isActive: true });
    if (bySlug) return bySlug;
  }
  return null;
}

async function resolveVoiceWithClone({ voiceId, voiceSlug }) {
  const voice = await resolveVoice({ voiceId, voiceSlug });
  if (!voice) return null;
  if (voice.type === "cloned" && voice.voiceCloneRef) {
    await voice.populate("voiceCloneRef");
  }
  return voice;
}

async function generateTts(userId, options) {
  const user = await User.findById(userId);
  const charCount = options.text.length;

  // Resolve voice first so we can check tier before enforcing limits
  const voice = await resolveVoiceWithClone(options);
  const voiceTier = voice?.tier || "pro";
  const voiceProvider = voice?.provider || (voice?.tier === "free" ? "free" : "xai");
  const voiceModel = voice?.model || (voiceProvider === "elevenlabs" ? "flash" : "voice_api");
  const isClonedCheck = voice?.type === "cloned";
  // Cloned voices use xAI TTS ... (unless elevenlabs clone for professional)
  const isFree = voiceTier === "free" && !isClonedCheck && voiceProvider !== "elevenlabs";

  if (voiceProvider === "elevenlabs") {
    const isPro = user.plan === "professional" || (await (async () => {
      const { ProfessionalMembership } = require("../models");
      const m = await ProfessionalMembership.findOne({ user: userId, status: "active" });
      return m && m.endDate > new Date();
    })());
    if (!isPro) {
      throw Object.assign(new Error("VoiceForge Premium membership required for studio voices"), { statusCode: 403 });
    }
  }

  if (!isFree) {
    const creditsToCharge = await calculateCreditsForUsage(charCount, voiceProvider, voiceModel);
    if (user.creditsRemaining < creditsToCharge) {
      throw Object.assign(
        new Error("Insufficient credits"),
        { statusCode: 402 }
      );
    }
  }

  const isCloned = isClonedCheck;
  const xaiVoiceId =
    voice?.xaiVoiceId || options.xaiVoiceId || config.xai.defaultVoiceId;
  // edgeVoiceId: use the stored Edge voice if explicitly set, otherwise derive from xaiVoiceId
  // so XAI_TO_EDGE_VOICE can map voice names like "Roger" → "en-US-GuyNeural" correctly
  const edgeVoiceId =
    voice?.edgeVoiceId || xaiVoiceId || "en-US-JennyNeural";

  const generation = await AudioGeneration.create({
    user: userId,
    text: options.text,
    voice: voice?._id || null,
    voiceSlug: voice?.slug || options.voiceSlug || "",
    voiceLabel: voice?.name || options.voiceLabel || xaiVoiceId,
    xaiVoiceId,
    language: options.language || config.xai.defaultLanguage,
    codec: options.codec || config.xai.defaultCodec,
    sampleRate: options.sampleRate || config.xai.defaultSampleRate,
    bitRate: options.bitRate || config.xai.defaultBitRate,
    speed: options.speed ?? 1,
    stability: options.stability ?? 0.5,
    tone: options.tone || "",
    status: "queued",
    charactersUsed: isFree ? 0 : charCount,
    expiresAt: new Date(Date.now() + 28 * 60 * 60 * 1000), // 28 hours
    provider: voiceProvider, // New: track which provider was used
    model: voiceModel,
  });

  // Decide: short text or free voice → fast path (synchronous)
  // Long text on paid/cloned voices → background queue for good UX
  const shouldQueue = !isFree && charCount > LONG_TTS_CHAR_THRESHOLD;

  if (shouldQueue) {
    console.log(`[TTS] Long generation (${charCount} chars) → queuing to BullMQ (threshold ${LONG_TTS_CHAR_THRESHOLD})`);

    const bullJob = await enqueueTtsJob({
      generationId: generation._id.toString(),
      userId: userId.toString(),
      voiceId: generation.voice?.toString() || null,
    });

    generation.jobId = bullJob?.id || null;
    generation.status = bullJob?.inline ? "processing" : "queued";
    await generation.save();

    if (bullJob?.inline) {
      // Fallback: run immediately in background
      setImmediate(() => {
        const { processTtsJob } = require("../jobs/ttsGeneration");
        processTtsJob({ data: { generationId: generation._id.toString() } }).catch((e) =>
          console.error("[inline-tts]", e.message)
        );
      });
    }

    return formatGeneration(generation); // Return early — client will poll
  }

  // === Fast path for short text / free voices ===
  console.log(`[TTS] Fast path (${charCount} chars) — processing synchronously`);
  generation.status = "processing";
  await generation.save();

  try {
    let result;

    if (voiceProvider === "elevenlabs") {
      // ElevenLabs path (for PROFESSIONAL plan) - choose model based on voice.model
      const elVoiceId = voice?.xaiVoiceId || voice?.elevenlabsVoiceId || voice?.metadata?.elevenlabsVoiceId || options.voiceId || options.xaiVoiceId;
      const elModel = voiceModel === "multilingual_v3" ? "eleven_multilingual_v2" : "eleven_flash_v2_5";
      console.log(`[TTS] ElevenLabs voice "${voice?.name}" model=${voiceModel} → ElevenLabs (${elVoiceId}) using ${elModel}`);
      result = await elevenlabs.generateSpeech({
        text: options.text,
        voiceId: elVoiceId,
        modelId: elModel,
      });
    } else if (isFree && !isCloned) {
      // Free stock voices → Edge TTS only
      console.log(`[TTS] Free voice "${voice?.name}" → Edge TTS (${edgeVoiceId}) speed=${generation.speed}`);
      result = await synthesizeSpeechEdge({
        text: options.text,
        xaiVoiceId: edgeVoiceId,
        speed: generation.speed ?? 1,
        stability: generation.stability ?? 0.75,
      });
    } else if (isCloned) {
      // Cloned voice: use xAI TTS with the assigned stock voice
      const cloneVoice = xaiVoiceId || config.xai.defaultVoiceId || "ara";
      console.log(`[TTS] Cloned voice "${voice?.name}" → xAI TTS (${cloneVoice})`);
      try {
        result = await synthesizeSpeech({
          text: options.text,
          voiceId: cloneVoice,
          language: options.language || "auto",
        });
        // Record xAI usage for Grok Management
        await recordXaiUsage({ userId, result, voiceId: cloneVoice, text: options.text, status: "success" });
      } catch (err) {
        // Record failed usage attempt
        if (err.usage) {
          await recordXaiUsage({ userId, result: { usage: err.usage }, voiceId: cloneVoice, text: options.text, status: "failed" });
        }
        // Auth errors: throw immediately — never silently serve robotic Edge TTS
        if (err.isCreditOrAuth) throw err;
        // Network-only fallback
        console.warn(`[TTS] xAI network error for cloned voice: ${err.message} — falling back to Edge TTS`);
        result = await synthesizeSpeechEdge({
          text: options.text,
          xaiVoiceId: edgeVoiceId || "en-US-JennyNeural",
          speed: generation.speed ?? 1,
          stability: generation.stability ?? 0.75,
        });
      }
    } else {
      // Pro stock voices → xAI TTS, throw on auth errors
      console.log(`[TTS] Pro voice "${voice?.name}" → xAI TTS (${xaiVoiceId}) language=${options.language || "auto"}`);
      try {
        result = await synthesizeSpeech({
          text: options.text,
          voiceId: xaiVoiceId,
          language: options.language || "auto",
        });
        // Record xAI usage for Grok Management
        await recordXaiUsage({ userId, result, voiceId: xaiVoiceId, text: options.text, status: "success" });
      } catch (err) {
        // Record failed usage attempt
        if (err.usage) {
          await recordXaiUsage({ userId, result: { usage: err.usage }, voiceId: xaiVoiceId, text: options.text, status: "failed" });
        }
        // Auth/credit errors: surface them directly — do NOT fall back to robotic Edge TTS
        if (err.isCreditOrAuth) throw err;
        // Network-only fallback (ECONNREFUSED, ENOTFOUND, timeout)
        const isNetworkError = err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT";
        if (isNetworkError || !config.xai.apiKey) {
          console.warn(`[TTS] xAI network error (${err.message}) — falling back to Edge TTS`);
          result = await synthesizeSpeechEdge({
            text: options.text,
            xaiVoiceId: edgeVoiceId,
            speed: generation.speed ?? 1,
            stability: generation.stability ?? 0.75,
          });
        } else {
          throw err;
        }
      }
    }

    let audioUrl = null;
    let downloadUrl = null;
    let storageKey = null;
    let durationSeconds = Math.max(1, Math.round(charCount / 15));

    if (result.type === "audio") {
      const ext = generation.codec === "wav" ? "wav" : "mp3";
      const uploaded = await uploadBuffer(result.buffer, {
        folder: "tts",
        filename: `${generation._id}.${ext}`,
        mimeType: result.contentType || `audio/${ext}`,
      });
      audioUrl = uploaded.url;
      downloadUrl = uploaded.downloadUrl;
      storageKey = uploaded.storageKey;
    } else if (result.type === "url") {
      // Cloned voice sample served directly
      audioUrl = result.url;
      downloadUrl = result.url;
    } else if (result.data?.audio_url) {
      audioUrl = result.data.audio_url;
      downloadUrl = result.data.download_url || result.data.audio_url;
      durationSeconds = result.data.duration_seconds || durationSeconds;
    }

    generation.status = "completed";
    generation.audioUrl = audioUrl;
    generation.downloadUrl = downloadUrl;
    generation.storageKey = storageKey;
    generation.durationSeconds = durationSeconds;
    await generation.save();

    if (!isFree) {
      const creditsToCharge = await calculateCreditsForUsage(charCount, voiceProvider, voiceModel);
      const estimatedApiCost = await calculateEstimatedApiCost(charCount, voiceProvider, voiceModel);

      user.charactersUsed += charCount;
      user.creditsUsed += creditsToCharge;
      user.creditsRemaining -= creditsToCharge;
      await user.save();

      await UsageRecord.create({
        user: userId,
        type: "tts",
        amount: charCount,
        unit: "characters",
        meta: {
          creditsCharged: creditsToCharge,
          estimatedApiCostUsd: estimatedApiCost,
          provider: voiceProvider,
        },
        referenceId: generation._id,
        referenceModel: "AudioGeneration",
      });

      // Also persist on the generation for easy analytics
      generation.creditsCharged = creditsToCharge;
      generation.estimatedApiCostUsd = estimatedApiCost;
      generation.provider = voiceProvider;
      await generation.save();
    }

    return formatGeneration(generation);
  } catch (err) {
    generation.status = "failed";
    generation.errorMessage = err.message;
    await generation.save();
    throw err;
  }
}

function formatGeneration(doc) {
  return {
    id: doc._id.toString(),
    text: doc.text,
    voiceId: doc.voice?.toString() || null,
    voiceSlug: doc.voiceSlug,
    voiceLabel: doc.voiceLabel,
    status: doc.status,
    durationSeconds: doc.durationSeconds,
    audioUrl: doc.audioUrl,
    downloadUrl: doc.downloadUrl,
    playbackUrl: doc.audioUrl,
    charactersUsed: doc.charactersUsed,
    createdAt: doc.createdAt,
    expiresAt: doc.expiresAt,
    processingTimeMs: doc.processingTimeMs || null,
    jobId: doc.jobId || null,
  };
}

async function getGeneration(userId, id) {
  const doc = await AudioGeneration.findOne({ _id: id, user: userId });
  if (!doc) {
    throw Object.assign(new Error("Generation not found."), { statusCode: 404 });
  }
  return formatGeneration(doc);
}

async function getHistory(userId, { page = 1, limit = 20, search = "" }) {
  const query = { user: userId };
  if (search) query.text = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AudioGeneration.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AudioGeneration.countDocuments(query),
  ]);

  return {
    items: items.map(formatGeneration),
    total,
    page,
    limit,
  };
}

async function deleteGeneration(userId, id) {
  const doc = await AudioGeneration.findOne({ _id: id, user: userId });
  if (!doc) throw Object.assign(new Error("Generation not found."), { statusCode: 404 });

  // Delete local file if stored on disk (storageKey format: "tts/uuid-filename.mp3")
  if (doc.storageKey && !doc.storageKey.startsWith("http")) {
    try {
      const { uploadsDir } = require("../middleware/upload");
      const localPath = path.join(uploadsDir, doc.storageKey);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (e) {
      console.warn(`[TTS Delete] Could not remove file for ${id}:`, e.message);
    }
  }

  await doc.deleteOne();
}

async function cleanupExpired() {
  const expired = await AudioGeneration.find({ expiresAt: { $lte: new Date() }, status: "completed" });
  let deleted = 0;
  for (const doc of expired) {
    try {
      if (doc.storageKey && !doc.storageKey.startsWith("http")) {
        const { uploadsDir } = require("../middleware/upload");
        const localPath = path.join(uploadsDir, doc.storageKey);
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
      await doc.deleteOne();
      deleted++;
    } catch (e) {
      console.warn(`[TTS Cleanup] Failed to delete ${doc._id}:`, e.message);
    }
  }
  if (deleted > 0) console.log(`[TTS Cleanup] Deleted ${deleted} expired generation(s).`);
  return deleted;
}

module.exports = { generateTts, getGeneration, getHistory, deleteGeneration, cleanupExpired, formatGeneration, recordXaiUsage };
