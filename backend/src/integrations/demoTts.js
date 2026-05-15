const gtts = require("node-gtts");

/**
 * Free TTS fallback using Google Translate's speech endpoint.
 * No API key required. Used when XAI_API_KEY has no credits.
 */
async function synthesizeSpeechDemo({ text, language = "en" }) {
  return new Promise((resolve, reject) => {
    const tts = gtts(language || "en");
    const stream = tts.stream(text);
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      resolve({
        type: "audio",
        buffer: Buffer.concat(chunks),
        contentType: "audio/mpeg",
      });
    });
    stream.on("error", (err) => {
      reject(Object.assign(new Error("Demo TTS failed: " + err.message), { statusCode: 500 }));
    });
  });
}

module.exports = { synthesizeSpeechDemo };
