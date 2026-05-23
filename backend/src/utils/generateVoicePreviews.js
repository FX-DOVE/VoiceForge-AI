const fs = require("fs");
const path = require("path");
const { Voice } = require("../models");
const { synthesizeSpeech } = require("../integrations/xaiTts");
const config = require("../config");

const PREVIEWS_DIR = path.join(__dirname, "../../uploads/voice-previews");

function ensurePreviewsDir() {
  if (!fs.existsSync(PREVIEWS_DIR)) {
    fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
  }
}

function getPreviewPath(voiceId) {
  return path.join(PREVIEWS_DIR, `${voiceId}.mp3`);
}

function getPreviewPublicUrl(voiceId) {
  return `/uploads/voice-previews/${voiceId}.mp3`;
}

async function generatePreviewForVoice(voice, { force = false } = {}) {
  const voiceId = voice.xaiVoiceId || voice.slug;
  const filePath = getPreviewPath(voiceId);

  if (!force && fs.existsSync(filePath)) {
    return { skipped: true, voiceId, filePath };
  }

  const text = config.voicePreviewText;

  try {
    const result = await synthesizeSpeech({
      text,
      voiceId,
      language: "auto",
    });

    if (result.type !== "audio" || !result.buffer) {
      console.warn(`[Preview Gen] No audio buffer for ${voiceId}`);
      return { error: "No audio buffer", voiceId };
    }

    ensurePreviewsDir();
    fs.writeFileSync(filePath, result.buffer);

    // Update voice record with the local preview URL
    const publicUrl = getPreviewPublicUrl(voiceId);
    await Voice.findByIdAndUpdate(voice._id, { previewUrl: publicUrl });

    return { generated: true, voiceId, filePath, publicUrl };
  } catch (err) {
    console.error(`[Preview Gen] Failed for ${voiceId}: ${err.message}`);
    return { error: err.message, voiceId };
  }
}

async function generateAllPreviews({ force = false, concurrency = 2, source = "xai" } = {}) {
  if (!config.xai.apiKey) {
    console.error("[Preview Gen] XAI_API_KEY is not set. Cannot generate previews.");
    return { generated: 0, skipped: 0, errors: 0 };
  }

  ensurePreviewsDir();

  const query = { isActive: true, source };
  const voices = await Voice.find(query).sort({ isCoreVoice: -1, name: 1 });
  console.log(`[Preview Gen] Found ${voices.length} active ${source} voices to process`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < voices.length; i += concurrency) {
    const batch = voices.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map((v) => generatePreviewForVoice(v, { force }))
    );

    for (const r of results) {
      if (r.skipped) {
        skipped++;
      } else if (r.generated) {
        generated++;
        console.log(`[Preview Gen] ✓ ${r.voiceId}`);
      } else {
        errors++;
      }
    }

    // Small delay between batches to respect rate limits
    if (i + concurrency < voices.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`[Preview Gen] Done: ${generated} generated, ${skipped} skipped, ${errors} errors`);
  return { generated, skipped, errors };
}

module.exports = {
  generateAllPreviews,
  generatePreviewForVoice,
  getPreviewPath,
  getPreviewPublicUrl,
  PREVIEWS_DIR,
  ensurePreviewsDir,
};
