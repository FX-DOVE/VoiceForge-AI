const path = require("path");
const {
  Voice,
  AudioGeneration,
  UsageRecord,
  User,
} = require("../models");
const config = require("../config");
const { synthesizeSpeech } = require("../integrations/xaiTts");
const { uploadBuffer } = require("../integrations/storage");
const { getCharactersLimit } = require("../utils/planLimits");

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

async function generateTts(userId, options) {
  const user = await User.findById(userId);
  const limit = getCharactersLimit(user.plan);
  const charCount = options.text.length;

  if (user.charactersUsed + charCount > limit) {
    throw Object.assign(
      new Error("You have reached your character limit for this billing period."),
      { statusCode: 402 }
    );
  }

  const voice = await resolveVoice(options);
  const xaiVoiceId =
    voice?.xaiVoiceId || options.xaiVoiceId || config.xai.defaultVoiceId;

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
    status: "processing",
    charactersUsed: charCount,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  try {
    const result = await synthesizeSpeech({
      text: options.text,
      voiceId: xaiVoiceId,
      language: generation.language,
      codec: generation.codec,
      sampleRate: generation.sampleRate,
      bitRate: generation.bitRate,
    });

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

    user.charactersUsed += charCount;
    await user.save();

    await UsageRecord.create({
      user: userId,
      type: "tts",
      amount: charCount,
      unit: "characters",
      referenceId: generation._id,
      referenceModel: "AudioGeneration",
    });

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

module.exports = { generateTts, getGeneration, getHistory, formatGeneration };
