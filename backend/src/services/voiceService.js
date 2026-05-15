const { Voice } = require("../models");
const { synthesizeSpeechEdge } = require("../integrations/edgeTts");
const { synthesizeSpeech, fetchXaiVoices } = require("../integrations/xaiTts");
const { uploadBuffer } = require("../integrations/storage");
const config = require("../config");

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
    languages: v.languages,
    description: v.description,
    rating: v.rating,
    usage: v.usageLabel,
    creator: v.creator,
    type: v.type,
    img: v.img,
    previewUrl: v.previewUrl,
    xaiVoiceId: v.xaiVoiceId,
    tier: v.tier || "free",
  };
}

async function listVoices(filters = {}) {
  const query = { isActive: true };
  if (filters.type) query.type = filters.type;
  if (filters.tier) query.tier = filters.tier;
  if (filters.owner) query.owner = filters.owner;
  if (filters.gender) query.gender = new RegExp(filters.gender, "i");
  if (filters.language) query.languages = filters.language;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const voices = await Voice.find(query).sort({ type: 1, name: 1 });
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

async function getVoicePreview(slug) {
  const voice = await Voice.findOne({ slug, isActive: true });
  if (!voice) return null;

  if (voice.previewUrl) {
    return { url: voice.previewUrl, cached: true };
  }

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
      return { url: match.preview_url, cached: false };
    }
  }

  const voiceTier = voice.tier || "free";
  const xaiVoiceId = voice.xaiVoiceId || "Aria";
  const text =
    voice.previewSample ||
    `Hi, I'm ${voice.name}. This is a sample of my voice on VoiceForge.`;

  let result;

  if (voiceTier === "pro" && config.xai.apiKey) {
    // Pro voice: generate preview using real xAI TTS
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
      result = await synthesizeSpeechEdge({ text, xaiVoiceId });
    }
  } else {
    // Free voice or no xAI key: use Edge TTS
    console.log(`[Voice Preview] Generating Edge TTS preview for ${slug} → ${xaiVoiceId}`);
    result = await synthesizeSpeechEdge({ text, xaiVoiceId });
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

  return { url: uploaded.url, cached: false };
}

module.exports = { listVoices, getVoiceBySlug, getVoicePreview, createVoice, formatVoice };
