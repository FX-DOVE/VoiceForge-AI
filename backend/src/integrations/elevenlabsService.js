const config = require("../config");
// Use native fetch (Node.js >=18). Do not require node-fetch (not in deps).
const fs = require("fs");

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

/**
 * ElevenLabs Provider Service
 * Complete integration for Professional plan (provider "elevenlabs").
 * 
 * Pricing and credits are handled via BillingSetting.providerProfiles.elevenlabs
 */

function getApiKey() {
  const key = config.elevenlabs?.apiKey || process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw Object.assign(new Error("Premium voice provider not configured"), { statusCode: 503 });
  }
  return key;
}

async function generateSpeech({ text, voiceId, modelId = "eleven_multilingual_v2", outputFormat = "mp3_44100_128" }) {
  const apiKey = getApiKey();
  const charCount = text?.length || 0;

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
      output_format: outputFormat,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const err = new Error(`Premium TTS failed: ${response.status} ${errText}`);
    err.statusCode = response.status === 401 ? 503 : 500;
    throw err;
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    type: "audio",
    buffer,
    contentType: "audio/mpeg",
    usage: {
      charactersProcessed: charCount,
      modelUsed: modelId,
      provider: "elevenlabs",
    },
  };
}

async function listVoices(opts = {}) {
  const apiKey = getApiKey();
  const { pageSize = 100, showLegacy = true } = opts;

  // Build URL with max page size + legacy to surface as many as the account tier allows
  let url = `${ELEVENLABS_API_BASE}/voices?page_size=${pageSize}`;
  if (showLegacy) url += `&show_legacy=true`;

  const response = await fetch(url, {
    headers: { "xi-api-key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`Failed to list premium voices: ${response.status}`);
  }

  const data = await response.json();
  let voices = data.voices || [];

  // Future-proof pagination: if the API ever returns has_more + next_cursor (or similar)
  // loop to collect all accessible public + premade voices.
  let cursor = data.next_cursor || data.cursor || null;
  let safety = 0;
  while ((data.has_more || cursor) && safety < 10) {
    safety++;
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
    const pageUrl = `${url}${cursorParam}`;
    const pageRes = await fetch(pageUrl, { headers: { "xi-api-key": apiKey } });
    if (!pageRes.ok) break;
    const pageData = await pageRes.json();
    if (pageData.voices && pageData.voices.length) {
      voices = voices.concat(pageData.voices);
    }
    cursor = pageData.next_cursor || pageData.cursor || null;
    if (!pageData.has_more && !cursor) break;
  }

  return voices;
}

async function cloneVoice({ name, description, files, labels = {} }) {
  const apiKey = getApiKey();

  const formData = new FormData();
  formData.append("name", name);
  if (description) formData.append("description", description);

  // ElevenLabs recommended: remove background noise if possible (pass as string "true")
  formData.append("remove_background_noise", "true");

  // Add audio files (support {path} from multer upload or {buffer, name, mimetype})
  // Use Blob wrapper for buffers for maximum compatibility with multipart/form-data
  files.forEach((file, i) => {
    const filename = file.originalname || file.name || `sample-${i}.mp3`;
    const mimetype = file.mimetype || file.mimeType || "audio/mpeg";

    if (file.path) {
      // local file path (from multer) - stream is fine
      formData.append("files", fs.createReadStream(file.path), filename);
    } else if (file.buffer) {
      // buffer from fetch - wrap as Blob for proper file part
      const blob = new Blob([file.buffer], { type: mimetype });
      formData.append("files", blob, filename);
    } else if (file instanceof Blob || file instanceof File) {
      formData.append("files", file, filename);
    } else {
      // fallback
      formData.append("files", file, filename);
    }
  });

  // Optional labels (e.g. { gender: "female", accent: "american", age: "young" })
  Object.keys(labels).forEach(key => {
    if (labels[key] != null) {
      formData.append(`labels[${key}]`, String(labels[key]));
    }
  });

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Voice clone failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  return {
    voiceId: data.voice_id,
    name: data.name,
    status: "ready",
    provider: "elevenlabs",
  };
}

async function deleteVoice(voiceId) {
  const apiKey = getApiKey();
  const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voiceId}`, {
    method: "DELETE",
    headers: { "xi-api-key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete ElevenLabs voice: ${response.status}`);
  }

  return { success: true };
}

async function getVoice(voiceId) {
  const apiKey = getApiKey();
  const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voiceId}`, {
    headers: { "xi-api-key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`Failed to get voice: ${response.status}`);
  }

  return response.json();
}

module.exports = {
  generateSpeech,
  listVoices,
  cloneVoice,
  deleteVoice,
  getVoice,
};
