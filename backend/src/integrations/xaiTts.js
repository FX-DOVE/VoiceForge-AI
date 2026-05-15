const config = require("../config");

async function synthesizeSpeech({ text, voiceId, language, codec, sampleRate, bitRate }) {
  if (!config.xai.apiKey) {
    throw Object.assign(new Error("Text-to-speech is not configured. Contact support."), {
      statusCode: 503,
    });
  }

  const payload = {
    text,
    voice_id: voiceId || config.xai.defaultVoiceId,
    language: language || config.xai.defaultLanguage,
    codec: codec || config.xai.defaultCodec,
    sample_rate: sampleRate || config.xai.defaultSampleRate,
    bit_rate: bitRate || config.xai.defaultBitRate,
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
    try {
      const errBody = await response.json();
      message = errBody.error?.message || errBody.message || message;
    } catch {
      /* ignore parse errors */
    }
    throw Object.assign(new Error(message), { statusCode: response.status });
  }

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return { type: "json", data };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return { type: "audio", buffer, contentType };
}

module.exports = { synthesizeSpeech };
