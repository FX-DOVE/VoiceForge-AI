const fs = require("fs");
const path = require("path");
const { Voice, VoiceSample, VoiceClone } = require("../models");
const { synthesizeSpeechEdge } = require("../integrations/edgeTts");
const { synthesizeSpeech, fetchXaiVoices } = require("../integrations/xaiTts");
const { uploadBuffer } = require("../integrations/storage");
const config = require("../config");
const { getPreviewPath, getPreviewPublicUrl } = require("../utils/generateVoicePreviews");

// Helper to ensure URLs are absolute (for local dev where relative URLs break audio playback)
function ensureAbsoluteUrl(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Convert relative URL to absolute
  const baseUrl = config.serverUrl?.replace(/\/+$/, "") || `http://localhost:${config.port || 5000}`;
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function formatVoice(v) {
  return {
    id: v.slug,
    _id: v._id.toString(),
    slug: v.slug,
    name: v.name,
    tags: v.tags,
    gender: v.gender,
    accent: v.accent,
    age: v.age,
    country: v.country || "",
    style: v.style || "",
    languages: v.languages,
    description: v.description,
    rating: v.rating,
    usage: v.usageLabel,
    creator: v.creator,
    type: v.type,
    img: v.img,
    previewUrl: ensureAbsoluteUrl(v.previewUrl),
    xaiVoiceId: v.xaiVoiceId,
    tier: v.tier || "free",
    isCoreVoice: v.isCoreVoice || false,
    source: v.source || "manual",
  };
}

async function listVoices(filters = {}) {
  const query = { isActive: true };
  // If not filtering by a specific owner, only show public voices in the library
  if (!filters.owner) {
    query.isPublic = true;
  }
  if (filters.type) query.type = filters.type;
  if (filters.tier) query.tier = filters.tier;
  if (filters.owner) query.owner = filters.owner;
  if (filters.gender) query.gender = new RegExp(filters.gender, "i");
  if (filters.language) query.languages = filters.language;
  if (filters.country) query.country = new RegExp(filters.country, "i");
  if (filters.age) query.age = new RegExp(filters.age, "i");
  if (filters.source) query.source = filters.source;
  if (filters.coreOnly === "true") query.isCoreVoice = true;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { country: { $regex: filters.search, $options: "i" } },
    ];
  }

  const voices = await Voice.find(query).sort({ isCoreVoice: -1, type: 1, name: 1 });
  return voices.map(formatVoice);
}

async function getVoiceBySlug(slug) {
  const voice = await Voice.findOne({ slug, isActive: true });
  if (!voice) return null;
  return formatVoice(voice);
}

async function createVoice(userId, data) {
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
  const voice = await Voice.create({
    ...data,
    slug,
    owner: userId,
    type: data.type || "cloned",
  });
  return formatVoice(voice);
}

// In-memory lock: prevents duplicate generation when multiple requests arrive simultaneously for the same slug
const _previewInFlight = new Map();

async function getVoicePreview(slug) {
  const voice = await Voice.findOne({ slug, isActive: true });
  if (!voice) return null;

  // For xAI voices: check local cached preview MP3 first (no API call)
  if (voice.source === "xai" || voice.xaiVoiceId) {
    const voiceId = voice.xaiVoiceId || voice.slug;
    const localFile = getPreviewPath(voiceId);
    if (fs.existsSync(localFile)) {
      const publicUrl = getPreviewPublicUrl(voiceId);
      // Update DB if not already set
      if (voice.previewUrl !== publicUrl) {
        voice.previewUrl = publicUrl;
        await voice.save().catch(() => {});
      }
      return { url: ensureAbsoluteUrl(publicUrl), cached: true };
    }
  }

  // For cloned voices: serve the uploaded sample audio directly as the preview
  // This plays the user's actual recorded voice, not a stock TTS voice
  if (voice.type === "cloned") {
    // Use cached previewUrl if already set to a sample URL
    if (voice.previewUrl) {
      return { url: ensureAbsoluteUrl(voice.previewUrl), cached: true };
    }

    // Resolve the VoiceClone reference (handle old records without voiceCloneRef)
    let cloneId = voice.voiceCloneRef || null;
    if (!cloneId && voice.owner) {
      const slugSuffix = voice.slug?.replace(/^clone-/, "");
      let clone = null;
      if (slugSuffix) {
        const ownerClones = await VoiceClone.find({ user: voice.owner });
        clone = ownerClones.find((c) => c._id.toString().slice(-8) === slugSuffix);
      }
      if (!clone) {
        clone = await VoiceClone.findOne({ user: voice.owner, status: "ready" }).sort({ updatedAt: -1 });
      }
      if (clone) {
        cloneId = clone._id;
        voice.voiceCloneRef = cloneId;
        await voice.save().catch(() => {});
      }
    }

    if (cloneId) {
      const sample = await VoiceSample.findOne({ voiceClone: cloneId }).sort({ sizeBytes: -1 });
      if (sample?.url) {
        // Cache on voice so next call is instant
        voice.previewUrl = sample.url;
        await voice.save().catch(() => {});
        return { url: ensureAbsoluteUrl(sample.url), cached: false };
      }
    }
    // No sample found — fall through to normal TTS preview generation
  }

  if (voice.previewUrl) {
    return { url: ensureAbsoluteUrl(voice.previewUrl), cached: true };
  }

  // If generation is already in progress for this slug, wait for it
  if (_previewInFlight.has(slug)) {
    return _previewInFlight.get(slug);
  }

  const promise = _generateAndCachePreview(voice, slug).finally(() => {
    _previewInFlight.delete(slug);
  });
  _previewInFlight.set(slug, promise);
  return promise;
}

async function _generateAndCachePreview(voice, slug) {
  // Re-check after acquiring the lock — another request may have saved it already
  const fresh = await Voice.findOne({ slug, isActive: true });
  if (fresh?.previewUrl) return { url: ensureAbsoluteUrl(fresh.previewUrl), cached: true };

  // Try to get sample URL from xAI voice library first
  const xaiVoices = await fetchXaiVoices();
  if (xaiVoices && Array.isArray(xaiVoices)) {
    const match = xaiVoices.find(
      (v) =>
        v.voice_id?.toLowerCase() === voice.xaiVoiceId?.toLowerCase() ||
        v.name?.toLowerCase() === voice.xaiVoiceId?.toLowerCase()
    );
    if (match?.preview_url) {
      voice.previewUrl = match.preview_url;
      await voice.save();
      console.log(`[Voice Preview] Using xAI sample for ${slug}: ${match.preview_url}`);
      return { url: ensureAbsoluteUrl(match.preview_url), cached: false };
    }
  }

  const voiceTier = voice.tier || "free";
  const isCloned = voice.type === "cloned";
  const xaiVoiceId = voice.xaiVoiceId || "Aria";
  // Edge TTS needs a real voice name — for cloned voices xaiVoiceId may be an xAI custom ID
  // which Edge TTS doesn't understand; use a safe fallback instead
  const edgeTtsVoiceId = isCloned ? "Aria" : xaiVoiceId;
  const text =
    voice.previewSample ||
    `Hi, I'm ${voice.name}. This is a sample of my voice on VoiceForge.`;

  let result;

  if (config.xai.apiKey && (voiceTier === "pro" || isCloned)) {
    // Pro or cloned voice: try real xAI TTS with the stored voice ID
    console.log(`[Voice Preview] Generating xAI TTS preview for ${slug} → ${xaiVoiceId}`);
    try {
      result = await synthesizeSpeech({
        text,
        voiceId: xaiVoiceId,
        codec: "mp3",
        speed: 1,
      });
    } catch (err) {
      console.warn(`[Voice Preview] xAI TTS failed for ${slug}: ${err.message} — falling back to Edge TTS`);
      result = await synthesizeSpeechEdge({ text, xaiVoiceId: edgeTtsVoiceId });
    }
  } else {
    // Free voice or no xAI key: use Edge TTS with a safe voice name
    console.log(`[Voice Preview] Generating Edge TTS preview for ${slug} → ${edgeTtsVoiceId}`);
    result = await synthesizeSpeechEdge({ text, xaiVoiceId: edgeTtsVoiceId });
  }

  if (result.type !== "audio" || !result.buffer) {
    throw new Error(`Preview generation produced no audio for ${slug}`);
  }

  const uploaded = await uploadBuffer(result.buffer, {
    folder: "previews",
    filename: `${slug}-preview.mp3`,
    mimeType: "audio/mpeg",
  });

  voice.previewUrl = uploaded.url;
  await voice.save();

  return { url: ensureAbsoluteUrl(uploaded.url), cached: false };
}

module.exports = { listVoices, getVoiceBySlug, getVoicePreview, createVoice, formatVoice };
