const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

/**
 * Maps xAI voice IDs to distinct Microsoft Edge neural voices.
 * Edge TTS is free with no API key — uses Microsoft's neural voice infrastructure.
 */
const XAI_TO_EDGE_VOICE = {
  Onyx: "en-US-ChristopherNeural",   // Deep, professional male (Antoni)
  Echo: "en-GB-RyanNeural",           // Rich British male (Marcus)
  Aria: "en-US-JennyNeural",          // Clear, articulate female (Sarah)
  Nova: "en-US-AriaNeural",           // Warm, conversational female (Luna)
  Shimmer: "en-US-JennyNeural",       // Friendly, soft female (Bella) — confirmed
  Alloy: "en-US-AriaNeural",          // Energetic, clear female (Rachel) — confirmed
  Fable: "en-GB-SoniaNeural",
};

const DEFAULT_EDGE_VOICE = "en-US-JennyNeural";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSSML(voiceName, text, speed = 1) {
  const speedPct = Math.round((speed - 1) * 100);
  const lang = voiceName.split("-").slice(0, 2).join("-");
  const escaped = escapeXml(text);

  const inner =
    speedPct !== 0
      ? `<prosody rate="${speedPct > 0 ? "+" : ""}${speedPct}%">${escaped}</prosody>`
      : escaped;

  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'><voice name='${voiceName}'>${inner}</voice></speak>`;
}

async function synthesizeSpeechEdge({ text, xaiVoiceId, speed = 1, stability = 0.75 }) {
  const voiceName = XAI_TO_EDGE_VOICE[xaiVoiceId] || xaiVoiceId || DEFAULT_EDGE_VOICE;

  return new Promise(async (resolve, reject) => {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      console.log(`[Edge TTS] voice=${voiceName} speed=${speed}`);
      let audioStream;
      if (Math.abs(speed - 1) < 0.01) {
        // Default speed — use toStream (most reliable voice selection)
        ({ audioStream } = tts.toStream(text));
      } else {
        // Custom speed — use rawToStream with SSML prosody
        const ssml = buildSSML(voiceName, text, speed);
        ({ audioStream } = tts.rawToStream(ssml));
      }
      const chunks = [];

      audioStream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      audioStream.on("end", () => {
        resolve({
          type: "audio",
          buffer: Buffer.concat(chunks),
          contentType: "audio/mpeg",
          voiceName,
        });
      });
      audioStream.on("error", (err) => {
        console.error("[Edge TTS] stream error:", err.message);
        reject(Object.assign(new Error("Edge TTS failed: " + err.message), { statusCode: 500 }));
      });
    } catch (err) {
      console.error("[Edge TTS] setup error:", err.message);
      reject(Object.assign(new Error("Edge TTS error: " + err.message), { statusCode: 500 }));
    }
  });
}

module.exports = { synthesizeSpeechEdge, XAI_TO_EDGE_VOICE };
