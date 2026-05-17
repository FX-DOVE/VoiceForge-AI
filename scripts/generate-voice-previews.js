#!/usr/bin/env node
/**
 * generate-voice-previews.js
 *
 * Calls the xAI Grok TTS API for each curated voice, saves the resulting
 * MP3 to backend/uploads/previews/, then prints the URL paths to use.
 *
 * Usage (from repo root):
 *   node scripts/generate-voice-previews.js
 *   node scripts/generate-voice-previews.js --force    # overwrite existing
 *
 * Reads XAI_API_KEY from backend/.env automatically.
 */

// Load dotenv from backend/node_modules (that's where it's installed)
const dotenvPath = require("path").resolve(__dirname, "../backend/node_modules/dotenv");
require(dotenvPath).config({ path: require("path").resolve(__dirname, "../backend/.env") });

const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEMO_TEXT =
  "Welcome to VoiceForge AI. Create natural sounding speech in seconds.";

const OUTPUT_DIR = path.resolve(__dirname, "../backend/uploads/previews");

// Always use the correct speech endpoint regardless of what .env says
const XAI_TTS_URL = "https://api.x.ai/v1/audio/speech";
const XAI_MODEL   = process.env.XAI_MODEL   || "grok-tts-beta";
const XAI_API_KEY = process.env.XAI_API_KEY  || "";

/** Voices to generate — id must match frontend/lib/voiceSamples.js */
const VOICES = [
  { id: "aria",    xaiVoiceId: "Aria",    displayName: "Aria"    },
  { id: "onyx",    xaiVoiceId: "Onyx",    displayName: "Onyx"    },
  { id: "nova",    xaiVoiceId: "Nova",    displayName: "Nova"    },
  { id: "shimmer", xaiVoiceId: "Shimmer", displayName: "Shimmer" },
  { id: "alloy",   xaiVoiceId: "Alloy",   displayName: "Alloy"   },
  { id: "echo",    xaiVoiceId: "Echo",    displayName: "Echo"    },
];

// Map xAI voice IDs → Edge TTS neural voices (same mapping as backend/src/integrations/edgeTts.js)
const XAI_TO_EDGE = {
  Aria:    "en-US-JennyNeural",
  Onyx:    "en-US-ChristopherNeural",
  Nova:    "en-US-AriaNeural",
  Shimmer: "en-US-MichelleNeural",
  Alloy:   "en-US-AnaNeural",
  Echo:    "en-GB-RyanNeural",
};

// ---------------------------------------------------------------------------
// xAI TTS
// ---------------------------------------------------------------------------

async function tryXaiAudio(voiceId) {
  const res = await fetch(XAI_TTS_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${XAI_API_KEY}`,
      "Content-Type":  "application/json",
      "Accept":        "audio/*, application/json",
    },
    body: JSON.stringify({
      model:           XAI_MODEL,
      input:           DEMO_TEXT,
      voice:           voiceId,
      response_format: "mp3",
      speed:           1,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try   { const b = await res.json(); detail = JSON.stringify(b); }
    catch { detail = await res.text().catch(() => String(res.status)); }
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("audio")) {
    const body = await res.text();
    throw new Error(`Non-audio response: ${body.slice(0, 200)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Edge TTS fallback (uses msedge-tts installed in backend/node_modules)
// ---------------------------------------------------------------------------

async function edgeAudio(xaiVoiceId) {
  const edgePath  = path.resolve(__dirname, "../backend/node_modules/msedge-tts");
  const { MsEdgeTTS, OUTPUT_FORMAT } = require(edgePath);

  const voiceName = XAI_TO_EDGE[xaiVoiceId] || "en-US-JennyNeural";
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  return new Promise((resolve, reject) => {
    const { audioStream } = tts.toStream(DEMO_TEXT);
    const chunks = [];
    audioStream.on("data",  (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    audioStream.on("end",   ()  => resolve(Buffer.concat(chunks)));
    audioStream.on("error", (e) => reject(e));
  });
}

// ---------------------------------------------------------------------------
// Combined generator: xAI first, Edge TTS fallback
// ---------------------------------------------------------------------------

async function generateAudio(xaiVoiceId, label) {
  if (XAI_API_KEY && XAI_API_KEY !== "your-xai-api-key") {
    try {
      const buf = await tryXaiAudio(xaiVoiceId);
      process.stdout.write(" [xAI]");
      return buf;
    } catch (err) {
      process.stdout.write(` [xAI ✖ ${err.message.slice(0, 60)}] → Edge TTS`);
    }
  }
  // Edge TTS fallback
  const buf = await edgeAudio(xaiVoiceId);
  process.stdout.write(" [Edge TTS]");
  return buf;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const force = process.argv.includes("--force");

  console.log("=".repeat(62));
  console.log("  VoiceForge AI — xAI Voice Preview Generator");
  console.log("=".repeat(62));
  console.log(`TTS URL    : ${XAI_TTS_URL}`);
  console.log(`Model      : ${XAI_MODEL}`);
  console.log(`Output dir : ${OUTPUT_DIR}`);
  console.log(`Demo text  : "${DEMO_TEXT}"`);
  console.log(`Force      : ${force}`);
  console.log("-".repeat(62));

  if (!XAI_API_KEY || XAI_API_KEY === "your-xai-api-key") {
    console.error(
      "\n✖  XAI_API_KEY not set in backend/.env\n" +
      "   Add:  XAI_API_KEY=xai-...\n"
    );
    process.exit(1);
  }
  console.log("✔  API key found.\n");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0, skipped = 0, failed = 0;
  const results = [];

  for (const voice of VOICES) {
    const filename = `${voice.id}-preview.mp3`;
    const outFile  = path.join(OUTPUT_DIR, filename);
    const urlPath  = `/uploads/previews/${filename}`;

    if (!force && fs.existsSync(outFile)) {
      const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
      console.log(`  ↷  ${voice.displayName.padEnd(10)} — exists (${kb} KB) → ${urlPath}`);
      results.push({ id: voice.id, urlPath });
      skipped++;
      continue;
    }

    process.stdout.write(`  ▶  ${voice.displayName.padEnd(10)} — calling xAI...`);
    try {
      const buf = await generateAudio(voice.xaiVoiceId, voice.displayName);
      fs.writeFileSync(outFile, buf);
      const kb = (buf.length / 1024).toFixed(1);
      console.log(` ✔  ${kb} KB → ${urlPath}`);
      results.push({ id: voice.id, urlPath });
      generated++;
    } catch (err) {
      console.log(` ✖  FAILED: ${err.message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 350));
  }

  console.log("\n" + "-".repeat(62));
  console.log(`Generated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);

  if (failed > 0) {
    console.error("\n⚠  Some voices failed. Check your xAI API key and TTS permissions.\n");
    process.exit(1);
  }

  console.log("\n✔  Done! Update frontend/lib/voiceSamples.js audioPath values:\n");
  for (const r of results) {
    console.log(`   { id: "${r.id}", audioPath: "${r.urlPath}" }`);
  }
  console.log(
    "\n   Backend serves these at http://localhost:<PORT>" + results[0]?.urlPath + "\n" +
    "   The frontend NEXT_PUBLIC_API_URL must point to your backend.\n"
  );
}

main().catch((err) => {
  console.error("\n✖  Fatal:", err.message);
  process.exit(1);
});
