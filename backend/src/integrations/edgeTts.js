const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

/**
 * Maps voice IDs to distinct Microsoft Edge neural voices.
 * Every entry here is a real, distinct Edge TTS neural voice.
 */
const XAI_TO_EDGE_VOICE = {
  // ─── Real xAI TTS voice names → Edge TTS neural fallback ────────────────
  Aria:      "en-US-JennyNeural",
  Roger:     "en-US-GuyNeural",
  Sarah:     "en-US-JennyNeural",
  Laura:     "en-US-AvaNeural",
  Charlie:   "en-US-ChristopherNeural",
  George:    "en-GB-RyanNeural",
  River:     "en-US-AriaNeural",
  Liam:      "en-US-SteffanNeural",
  Charlotte: "en-US-AvaNeural",
  Alice:     "en-US-MichelleNeural",
  Matilda:   "en-GB-SoniaNeural",
  Will:      "en-US-ChristopherNeural",
  Jessica:   "en-US-AnaNeural",
  Eric:      "en-US-GuyNeural",
  Chris:     "en-US-ChristopherNeural",
  Brian:     "en-GB-RyanNeural",
  Daniel:    "en-GB-RyanNeural",
  Lily:      "en-US-AvaNeural",
  Bill:      "en-US-GuyNeural",

  // ─── Legacy xAI stock name aliases ───────────────────────────────────────
  Onyx:    "en-US-ChristopherNeural",
  Echo:    "en-GB-RyanNeural",
  Nova:    "en-US-AriaNeural",
  Shimmer: "en-US-MichelleNeural",
  Alloy:   "en-US-AnaNeural",
  Fable:   "en-GB-SoniaNeural",

  // ─── xAI multilingual native names ───────────────────────────────────────
  Ara:    "en-US-JennyMultilingualNeural",
  Eve:    "en-US-AvaMultilingualNeural",
  Leo:    "en-US-AndrewMultilingualNeural",
  Rex:    "en-US-BrianMultilingualNeural",
  Sal:    "en-US-SteffanNeural",

  // ─── English ──────────────────────────────────────────────────────────────
  Antoni: "en-US-ChristopherNeural",
  Bella:  "en-US-MichelleNeural",
  Rachel: "en-US-AnaNeural",
  Luna:   "en-US-AriaNeural",
  Sarah:  "en-US-JennyNeural",
  Marcus: "en-GB-RyanNeural",
  James:  "en-US-GuyNeural",
  Sophia: "en-US-AvaNeural",

  // ─── Chinese / Mandarin ───────────────────────────────────────────────────
  Jian:  "zh-CN-YunjianNeural",
  Hao:   "zh-CN-YunxiNeural",
  Yue:   "zh-CN-XiaoyiNeural",
  Xia:   "zh-CN-XiaoxiaoNeural",
  Wei:   "zh-CN-YunfengNeural",
  Mei:   "zh-CN-XiaohanNeural",
  Chen:  "zh-CN-YunhaoNeural",
  Lin:   "zh-CN-XiaoruiNeural",

  // ─── Russian ──────────────────────────────────────────────────────────────
  Pavel:   "ru-RU-DmitryNeural",
  Andrei:  "ru-RU-DmitryNeural",
  Dmitri:  "ru-RU-DmitryNeural",
  Irina:   "ru-RU-SvetlanaNeural",
  Natasha: "ru-RU-SvetlanaNeural",
  Sergei:  "ru-RU-DmitryNeural",
  Olga:    "ru-RU-SvetlanaNeural",
  Boris:   "ru-RU-DmitryNeural",

  // ─── Italian ──────────────────────────────────────────────────────────────
  Enzo:       "it-IT-DiegoNeural",
  Matteo:     "it-IT-GiuseppeNeural",
  Luca:       "it-IT-DiegoNeural",
  Alessandro: "it-IT-GiuseppeNeural",
  Giulia:     "it-IT-ElsaNeural",
  "Sofia-it": "it-IT-IsabellaNeural",
  Franco:     "it-IT-GiuseppeNeural",
  Chiara:     "it-IT-IsabellaNeural",

  // ─── Hindi ────────────────────────────────────────────────────────────────
  Vikram:  "hi-IN-MadhurNeural",
  Karan:   "hi-IN-MadhurNeural",
  Arjun:   "hi-IN-MadhurNeural",
  Ananya:  "hi-IN-SwaraNeural",
  Priya:   "hi-IN-SwaraNeural",
  Rahul:   "hi-IN-MadhurNeural",
  Aisha:   "hi-IN-SwaraNeural",
  Rohan:   "hi-IN-MadhurNeural",

  // ─── French ───────────────────────────────────────────────────────────────
  Remi:    "fr-FR-HenriNeural",
  Hugo:    "fr-FR-HenriNeural",
  Antoine: "fr-FR-HenriNeural",
  Camille: "fr-FR-DeniseNeural",
  Claire:  "fr-FR-DeniseNeural",
  Pierre:  "fr-FR-HenriNeural",
  Marie:   "fr-FR-DeniseNeural",
  Julien:  "fr-FR-HenriNeural",

  // ─── Spanish ──────────────────────────────────────────────────────────────
  Manuel:  "es-ES-AlvaroNeural",
  Javier:  "es-ES-AlvaroNeural",
  Diego:   "es-ES-AlvaroNeural",
  Andres:  "es-MX-JorgeNeural",
  Elena:   "es-ES-ElviraNeural",
  Lucia:   "es-ES-ElviraNeural",
  "Sofia-es": "es-ES-ElviraNeural",
  Carlos:  "es-MX-JorgeNeural",

  // ─── Danish ───────────────────────────────────────────────────────────────
  Kasper:  "da-DK-JeppeNeural",
  Lars:    "da-DK-JeppeNeural",
  Sigrid:  "da-DK-ChristelNeural",
  Astrid:  "da-DK-ChristelNeural",
  Erik:    "da-DK-JeppeNeural",

  // ─── German ───────────────────────────────────────────────────────────────
  Hans:   "de-DE-ConradNeural",
  Dieter: "de-DE-BerndNeural",
  Hannah: "de-DE-KatjaNeural",
  Greta:  "de-DE-KatjaNeural",
  Klara:  "de-DE-AmalaNeural",
  Max:    "de-DE-ConradNeural",
  Bernd:  "de-DE-KasperNeural",
  Ingrid: "de-DE-AmalaNeural",

  // ─── Portuguese ───────────────────────────────────────────────────────────
  "Carlos-pt": "pt-BR-AntonioNeural",
  Pedro:       "pt-BR-AntonioNeural",
  Ana:         "pt-BR-FranciscaNeural",
  Maria:       "pt-BR-FranciscaNeural",
  Joao:        "pt-PT-DuarteNeural",
  Ines:        "pt-PT-RaquelNeural",
  Ricardo:     "pt-BR-AntonioNeural",
  Beatriz:     "pt-BR-FranciscaNeural",

  // ─── Japanese ─────────────────────────────────────────────────────────────
  Kenji:   "ja-JP-KeitaNeural",
  Yuto:    "ja-JP-KeitaNeural",
  Sakura:  "ja-JP-NanamiNeural",
  Hana:    "ja-JP-NanamiNeural",
  Takeshi: "ja-JP-KeitaNeural",
  Yuki:    "ja-JP-NanamiNeural",
  Ryo:     "ja-JP-KeitaNeural",
  Akiko:   "ja-JP-NanamiNeural",

  // ─── Korean ───────────────────────────────────────────────────────────────
  Minjun:  "ko-KR-InJoonNeural",
  Jisoo:   "ko-KR-SunHiNeural",
  Hyun:    "ko-KR-InJoonNeural",
  Soyeon:  "ko-KR-SunHiNeural",
  Junho:   "ko-KR-InJoonNeural",
  Minji:   "ko-KR-SunHiNeural",

  // ─── Arabic ───────────────────────────────────────────────────────────────
  Omar:   "ar-SA-HamedNeural",
  Khalid: "ar-SA-HamedNeural",
  Fatima: "ar-SA-ZariyahNeural",
  Layla:  "ar-SA-ZariyahNeural",
  Hassan: "ar-EG-ShakirNeural",
  Yasmin: "ar-EG-SalmaNeural",
  Ahmed:  "ar-EG-ShakirNeural",
  Nour:   "ar-EG-SalmaNeural",

  // ─── Dutch ────────────────────────────────────────────────────────────────
  Jan:    "nl-NL-MaartenNeural",
  Pieter: "nl-NL-MaartenNeural",
  Anna:   "nl-NL-ColetteNeural",
  Lotte:  "nl-NL-ColetteNeural",
  Dirk:   "nl-NL-MaartenNeural",

  // ─── Swedish ──────────────────────────────────────────────────────────────
  Bjorn:  "sv-SE-MattiasNeural",
  Frida:  "sv-SE-SofieNeural",
  Saga:   "sv-SE-SofieNeural",

  // ─── Norwegian ────────────────────────────────────────────────────────────
  Olav:   "nb-NO-FinnNeural",
  Tor:    "nb-NO-FinnNeural",

  // ─── Finnish ──────────────────────────────────────────────────────────────
  Mikko:  "fi-FI-HarriNeural",
  Eero:   "fi-FI-HarriNeural",
  Aino:   "fi-FI-NooraNeural",
  Siiri:  "fi-FI-NooraNeural",

  // ─── Polish ───────────────────────────────────────────────────────────────
  Marek:  "pl-PL-MarekNeural",
  Tomasz: "pl-PL-MarekNeural",
  Zofia:  "pl-PL-ZofiaNeural",
  Kasia:  "pl-PL-ZofiaNeural",
  Piotr:  "pl-PL-MarekNeural",

  // ─── Turkish ──────────────────────────────────────────────────────────────
  Mehmet: "tr-TR-AhmetNeural",
  Ali:    "tr-TR-AhmetNeural",
  Ayse:   "tr-TR-EmelNeural",
  Zeynep: "tr-TR-EmelNeural",

  // ─── Greek ────────────────────────────────────────────────────────────────
  Nikos:  "el-GR-NestorasNeural",
  Kostas: "el-GR-NestorasNeural",
  "Elena-gr": "el-GR-AthinaNeural",
  "Sofia-gr": "el-GR-AthinaNeural",

  // ─── Czech ────────────────────────────────────────────────────────────────
  Jiri:   "cs-CZ-AntoninNeural",
  Petr:   "cs-CZ-AntoninNeural",
  Tereza: "cs-CZ-VlastaNeural",
  Lucie:  "cs-CZ-VlastaNeural",

  // ─── Hungarian ────────────────────────────────────────────────────────────
  Istvan: "hu-HU-TamasNeural",
  Agnes:  "hu-HU-NoemiNeural",
  Zoltan: "hu-HU-TamasNeural",

  // ─── Romanian ─────────────────────────────────────────────────────────────
  Ioana:  "ro-RO-AlinaNeural",
  Mihai:  "ro-RO-EmilNeural",

  // ─── Ukrainian ────────────────────────────────────────────────────────────
  Mykola: "uk-UA-OstapNeural",
  Olena:  "uk-UA-PolinaNeural",
  Taras:  "uk-UA-OstapNeural",

  // ─── Vietnamese ───────────────────────────────────────────────────────────
  Minh: "vi-VN-NamMinhNeural",
  Linh: "vi-VN-HoaiMyNeural",
  Tuan: "vi-VN-NamMinhNeural",
  Mai:  "vi-VN-HoaiMyNeural",

  // ─── Thai ─────────────────────────────────────────────────────────────────
  Somchai: "th-TH-NiwatNeural",
  Nida:    "th-TH-PremwadeeNeural",
  Prem:    "th-TH-NiwatNeural",

  // ─── Indonesian ───────────────────────────────────────────────────────────
  Budi:  "id-ID-ArdiNeural",
  Siti:  "id-ID-GadisNeural",
  Rizky: "id-ID-ArdiNeural",
  Dewi:  "id-ID-GadisNeural",

  // ─── Hebrew ───────────────────────────────────────────────────────────────
  Noam:  "he-IL-AvriNeural",
  Tamar: "he-IL-HilaNeural",
  Avi:   "he-IL-AvriNeural",

  // ─── Catalan ──────────────────────────────────────────────────────────────
  Pau:    "ca-ES-EnricNeural",
  Montse: "ca-ES-JoanaNeural",

  // ─── Slovak ───────────────────────────────────────────────────────────────
  Lukas: "sk-SK-LukasNeural",
  Jana:  "sk-SK-ViktoriaNeural",

  // ─── Slovenian ────────────────────────────────────────────────────────────
  Luka: "sl-SI-RokNeural",
  Maja: "sl-SI-PetraNeural",

  // ─── Croatian ─────────────────────────────────────────────────────────────
  Ivan:    "hr-HR-SreckoNeural",
  "Ana-hr": "hr-HR-GabrijelaNeural",

  // ─── Serbian ──────────────────────────────────────────────────────────────
  Nikola: "sr-RS-NicholasNeural",
  Milica: "sr-RS-SophieNeural",

  // ─── Bulgarian ────────────────────────────────────────────────────────────
  Georgi:    "bg-BG-BorislavNeural",
  "Elena-bg": "bg-BG-KalinaNeural",
};

const DEFAULT_EDGE_VOICE = "en-US-JennyNeural";

// Maximum characters per Edge TTS request (keep under 3000 for stability)
const EDGE_CHUNK_SIZE = 2500;

/**
 * Split text into chunks at sentence boundaries, respecting maxLen per chunk.
 */
function chunkText(text, maxLen = EDGE_CHUNK_SIZE) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Try to split at sentence boundary (. ! ? followed by space)
    let splitAt = -1;
    for (let i = maxLen; i > maxLen * 0.4; i--) {
      if (".!?".includes(remaining[i]) && (i + 1 >= remaining.length || remaining[i + 1] === " " || remaining[i + 1] === "\n")) {
        splitAt = i + 1;
        break;
      }
    }
    // Fallback: split at last space
    if (splitAt === -1) {
      splitAt = remaining.lastIndexOf(" ", maxLen);
    }
    // Fallback: hard cut
    if (splitAt <= 0) {
      splitAt = maxLen;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

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

function isValidEdgeVoiceName(name) {
  // Edge neural voices look like: en-US-AriaNeural, en-GB-RyanNeural, etc.
  return typeof name === "string" && /^[a-z]{2}-[A-Z]{2}-.+Neural$/.test(name);
}

/**
 * Synthesize a single chunk of text via Edge TTS.
 */
async function synthesizeChunkEdge(ttsInstance, voiceName, text, speed) {
  return new Promise((resolve, reject) => {
    try {
      let audioStream;
      if (Math.abs(speed - 1) < 0.01) {
        ({ audioStream } = ttsInstance.toStream(text));
      } else {
        const ssml = buildSSML(voiceName, text, speed);
        ({ audioStream } = ttsInstance.rawToStream(ssml));
      }
      const chunks = [];

      audioStream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      audioStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      audioStream.on("error", (err) => {
        console.error("[Edge TTS] stream error:", err.message);
        reject(Object.assign(new Error("Edge TTS failed: " + err.message), { statusCode: 500 }));
      });
    } catch (err) {
      console.error("[Edge TTS] chunk error:", err.message);
      reject(Object.assign(new Error("Edge TTS error: " + err.message), { statusCode: 500 }));
    }
  });
}

async function synthesizeSpeechEdge({ text, xaiVoiceId, speed = 1, stability = 0.75 }) {
  const mapped = XAI_TO_EDGE_VOICE[xaiVoiceId];
  const voiceName = mapped || (isValidEdgeVoiceName(xaiVoiceId) ? xaiVoiceId : DEFAULT_EDGE_VOICE);

  const textChunks = chunkText(text, EDGE_CHUNK_SIZE);
  console.log(`[Edge TTS] voice=${voiceName} speed=${speed} chunks=${textChunks.length} totalChars=${text.length}`);

  const audioBuffers = [];

  for (let i = 0; i < textChunks.length; i++) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const buf = await synthesizeChunkEdge(tts, voiceName, textChunks[i], speed);
    audioBuffers.push(buf);
    if (textChunks.length > 1) {
      console.log(`[Edge TTS] chunk ${i + 1}/${textChunks.length} done (${textChunks[i].length} chars)`);
    }
  }

  return {
    type: "audio",
    buffer: Buffer.concat(audioBuffers),
    contentType: "audio/mpeg",
    voiceName,
  };
}

module.exports = { synthesizeSpeechEdge, XAI_TO_EDGE_VOICE };

