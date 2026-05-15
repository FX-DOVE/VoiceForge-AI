const config = require("../config");

const XAI_BASE = "https://api.x.ai/v1";

async function fetchXaiVoices() {
  if (!config.xai.apiKey) return null;
  try {
    const res = await fetch(`${XAI_BASE}/audio/voices`, {
      headers: {
        Authorization: `Bearer ${config.xai.apiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.warn(`[xAI Voices] HTTP ${res.status} — cannot fetch voice library`);
      return null;
    }
    const data = await res.json();
    return data.voices || data.data || null;
  } catch (err) {
    console.warn("[xAI Voices] Fetch error:", err.message);
    return null;
  }
}

async function synthesizeSpeech({ text, voiceId, codec, speed }) {
  if (!config.xai.apiKey) {
    throw Object.assign(new Error("Text-to-speech is not configured. Contact support."), {
      statusCode: 503,
    });
  }

  const payload = {
    model: config.xai.model,
    input: text,
    voice: voiceId || config.xai.defaultVoiceId,
    response_format: codec || config.xai.defaultCodec,
    speed: speed ?? 1,
  };

  const response = await fetch(config.xai.ttsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.xai.apiKey}`,
      "Content-Type": "application/json",
      Accept: "audio/*, application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let message = "Voice generation failed. Please try again.";
    let rawDetail = "";
    let isCreditOrAuth = false;
    try {
      const errBody = await response.json();
      console.error("[xAI TTS] API error:", response.status, JSON.stringify(errBody));
      rawDetail = errBody.error?.message || errBody.message || JSON.stringify(errBody);
      if (response.status === 402 || response.status === 429) {
        message = "xAI credits exhausted or rate-limited. Please top up your xAI account to continue using Pro voices.";
        isCreditOrAuth = true;
      } else if (response.status === 401 || response.status === 403) {
        message = "xAI API key is invalid or unauthorised. Check your XAI_API_KEY setting.";
        isCreditOrAuth = true;
      } else {
        message = rawDetail || message;
      }
    } catch {
      rawDetail = await response.text().catch(() => "");
      console.error("[xAI TTS] Non-JSON error:", response.status, rawDetail);
    }
    throw Object.assign(new Error(message), {
      statusCode: response.status,
      isCreditOrAuth,
      xaiDetail: rawDetail,
    });
  }

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return { type: "json", data };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return { type: "audio", buffer, contentType };
}

module.exports = { synthesizeSpeech, fetchXaiVoices };
