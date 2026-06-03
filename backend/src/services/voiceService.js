const fs = require("fs");
const path = require("path");
const { Voice, VoiceSample, VoiceClone } = require("../models");
const { synthesizeSpeechEdge } = require("../integrations/edgeTts");
const { synthesizeSpeech, fetchXaiVoices } = require("../integrations/xaiTts");
const elevenlabs = require("../integrations/elevenlabsService");
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

// --- Rebrand-safe display mapping (NEVER expose provider/model names to clients) ---
// Internal fields (provider, model, costTier, xaiVoiceId, elevenlabsVoiceId) remain for
// backend charging, filtering, admin, and compat but are NOT rendered in user UI.
// Frontend receives displayTier/displayName/quality for all labels.

function getDisplayTier(v) {
  // Cloned voices are always VoiceForge Premium (they are created via ElevenLabs
  // under the professional tier). Force premium even for legacy records that may
  // have had tier/provider not set correctly at creation time.
  if (v && v.type === "cloned") {
    return "premium";
  }
  const tier = (v.tier || "free").toLowerCase();
  const prov = (v.provider || v.source || "").toLowerCase();
  const hasEl = !!v.elevenlabsVoiceId;
  if (tier === "free" || prov === "free" || prov === "edge" || prov === "edgetts") return "free";
  if (hasEl || prov === "elevenlabs" || prov === "professional" || prov === "voiceforge-premium") return "premium";
  // default for pro/paygo voices (xai etc)
  return "pro";
}

function getDisplayName(displayTier) {
  if (displayTier === "free") return "VoiceForge Free";
  if (displayTier === "pro") return "VoiceForge Pro";
  return "VoiceForge Premium";
}

function getVoiceQualityLabel(v, displayTier) {
  if (displayTier === "free") return "Basic";
  const costTier = (v.costTier || "").toLowerCase();
  const model = (v.model || "").toLowerCase();
  if (displayTier === "premium") {
    const isStudio = costTier === "high" || model.includes("v3") || model.includes("premium") || model.includes("multilingual");
    return isStudio ? "Studio" : "Enhanced";
  }
  return "Enhanced";
}

function formatVoice(v) {
  const base = {
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
    tier: v.tier || "free",
    isCoreVoice: v.isCoreVoice || false,
    source: v.source || "manual",
    // Internal impl details (kept for logic/gating/charging; never displayed to end users)
    provider: v.provider || "xai",
    model: v.model || "voice_api",
    costTier: v.costTier || "low",
    xaiVoiceId: v.xaiVoiceId,
    elevenlabsVoiceId: v.elevenlabsVoiceId || null,
  };
  const displayTier = getDisplayTier(v);
  base.displayTier = displayTier;
  base.displayName = getDisplayName(displayTier);
  base.quality = getVoiceQualityLabel(v, displayTier);
  return base;
}

// Back-compat alias for any callers expecting the old mapper name
const formatVoiceForClient = formatVoice;

async function listVoices(filters = {}, user = null) {
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
  let providerFilter = filters.provider;
  if (providerFilter === "professional") providerFilter = "elevenlabs";
  const modelFilter = filters.model;
  if (providerFilter === "my-clones" || providerFilter === "cloned" || providerFilter === "my") {
    // Special filter for authenticated user's own cloned voices (ignore public only)
    delete query.isPublic;
    if (user) {
      query.owner = user._id || user.id || user;
      query.type = "cloned";
    } else {
      // unauth cannot see private clones
      query.owner = null;
    }
    providerFilter = null; // do not set provider filter
  }
  if (providerFilter) {
    query.provider = providerFilter;
    // Strict: for elevenlabs / Professional filter, only real EL voices (those with a real external id)
    // This prevents polluted legacy data (xai/edge voices that were wrongly tagged) from appearing.
    if (providerFilter === "elevenlabs") {
      query.elevenlabsVoiceId = { $exists: true, $ne: null, $ne: "" };
    }
  }
  if (modelFilter) {
    query.model = modelFilter;
  }
  if (filters.coreOnly === "true") query.isCoreVoice = true;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { country: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Enforce provider access based on user plan/membership.
  // Only restrict the *default* list (when no specific provider requested).
  // If user explicitly filters to "elevenlabs", respect it so the tab always shows the voices
  // (browsing is allowed; generation/cloning is separately gated).
  if (user && !providerFilter && !filters.provider?.match(/my|cloned/)) {
    const plan = user.plan || "free";
    let isProf = user.plan === "professional";
    if (!isProf && typeof user.isProfessional === "function") {
      try {
        isProf = await user.isProfessional();
      } catch (e) {
        console.error("[voiceService] isProfessional check failed:", e.message);
        isProf = false;
      }
    }
    if (!isProf && plan !== "professional") {
      if (plan === "pro") {
        if (!query.provider || (typeof query.provider === "string" && !["free", "xai"].includes(query.provider))) {
          query.provider = { $in: ["free", "xai"] };
        }
      } else if (!query.provider || query.provider === "elevenlabs") {
        query.provider = "free";
      }
    }
    // professional sees all (including elevenlabs provider)
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

  // For xAI or VoiceForge Professional voices: check local cached preview MP3 first (no API call, saves credits)
  const isXaiOrVf = voice.source === "xai" || voice.source === "elevenlabs" || voice.provider === "elevenlabs" || voice.xaiVoiceId || voice.elevenlabsVoiceId;
  if (isXaiOrVf) {
    const voiceId = voice.elevenlabsVoiceId || voice.xaiVoiceId || voice.slug;
    const localFile = getPreviewPath(voiceId);
    if (fs.existsSync(localFile)) {
      const publicUrl = getPreviewPublicUrl(voiceId);
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
  if (voice.source === "xai" || voice.xaiVoiceId) {
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
  }

  const voiceTier = voice.tier || "free";
  const isCloned = voice.type === "cloned";
  const xaiVoiceId = voice.xaiVoiceId || "Aria";
  const edgeTtsVoiceId = isCloned ? "Aria" : xaiVoiceId;
  const text =
    voice.previewSample ||
    `Hi, I'm ${voice.name}. This is a sample of my voice on VoiceForge.`;

  let result;

  if (voice.source === "elevenlabs" || voice.elevenlabsVoiceId || voice.provider === "elevenlabs") {
    // VoiceForge Professional: use ElevenLabs for preview generation (first time only; prefer pre-generated local)
    const elId = voice.elevenlabsVoiceId || voice.xaiVoiceId;
    console.log(`[Voice Preview] Generating VoiceForge Professional (ElevenLabs) preview for ${slug} → ${elId}`);
    try {
      const elModelId = (voice.model || "").includes("v3") ? "eleven_multilingual_v2" : "eleven_flash_v2_5";
      result = await elevenlabs.generateSpeech({
        text,
        voiceId: elId,
        modelId: elModelId,
      });
    } catch (err) {
      console.warn(`[Voice Preview] ElevenLabs failed for ${slug}: ${err.message} — falling back`);
      // fallback to edge if needed. Use safe default for EL voices (xaiVoiceId may be EL id, not valid Edge name)
      const fallbackEdge = (voice.source === "elevenlabs" || voice.provider === "elevenlabs" || voice.elevenlabsVoiceId) ? "en-US-AriaNeural" : edgeTtsVoiceId;
      result = await synthesizeSpeechEdge({ text, xaiVoiceId: fallbackEdge });
    }
  } else if (config.xai.apiKey && (voiceTier === "pro" || isCloned)) {
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

module.exports = {
  listVoices,
  getVoiceBySlug,
  getVoicePreview,
  createVoice,
  formatVoice,
  formatVoiceForClient,
  getDisplayTier,
  getDisplayName,
  getVoiceQualityLabel,
};
