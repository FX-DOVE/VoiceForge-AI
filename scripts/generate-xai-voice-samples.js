#!/usr/bin/env node
/**
 * generate-xai-voice-samples.js
 *
 * Generates demo MP3 files for the landing page voice samples section using
 * the xAI Grok TTS API and saves them to /frontend/public/audio/voices/.
 *
 * Usage:
 *   node scripts/generate-xai-voice-samples.js
 *   node scripts/generate-xai-voice-samples.js --force   # overwrite existing files
 *
 * Requirements:
 *   - XAI_API_KEY must be set in backend/.env or as an environment variable.
 *   - Node 18+ (uses native fetch).
 *
 * The script never touches user credits — it runs as a build-time utility.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEMO_TEXT =
  "Welcome to our AI voice platform. Create natural sounding speech in seconds.";

const OUTPUT_DIR = path.resolve(
  __dirname,
  "..",
  "frontend",
  "public",
  "audio",
  "voices"
);

// These are resolved from the env file below (after loadEnv runs)
let XAI_TTS_URL = "https://api.x.ai/v1/audio/speech";
let XAI_MODEL = "grok-tts-beta";

/** Curated voices — must match /frontend/lib/voiceSamples.js */
const VOICES = [
  { id: "aria",    xaiVoiceId: "Aria",    displayName: "Aria" },
  { id: "onyx",    xaiVoiceId: "Onyx",    displayName: "Onyx" },
  { id: "nova",    xaiVoiceId: "Nova",    displayName: "Nova" },
  { id: "shimmer", xaiVoiceId: "Shimmer", displayName: "Shimmer" },
  { id: "alloy",   xaiVoiceId: "Alloy",   displayName: "Alloy" },
  { id: "echo",    xaiVoiceId: "Echo",    displayName: "Echo" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadEnv() {
  const result = { apiKey: process.env.XAI_API_KEY || null };

  const envPath = path.resolve(__dirname, "..", "backend", ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const kv = line.match(/^([A-Z_]+)\s*=\s*(.+)$/);
      if (!kv) continue;
      const [, k, v] = kv;
      const val = v.trim().replace(/^["']|["']$/g, "");
      if (k === "XAI_API_KEY" && val && val !== "your-xai-api-key") result.apiKey = val;
      if (k === "XAI_TTS_URL" && val) XAI_TTS_URL = val;
      if (k === "XAI_MODEL" && val) XAI_MODEL = val;
    }
  }
  return result;
}

function loadApiKey() {
  return loadEnv().apiKey;
}

async function generateAudio(apiKey, voiceId, text) {
  const payload = {
    model: XAI_MODEL,
    input: text,
    voice: voiceId,
    response_format: "mp3",
    speed: 1,
  };

  const response = await fetch(XAI_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "audio/*, application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.error?.message || body.message || JSON.stringify(body);
    } catch {
      detail = await response.text().catch(() => String(response.status));
    }
    throw new Error(`xAI API error ${response.status}: ${detail}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("audio")) {
    const body = await response.text();
    throw new Error(`Unexpected content-type "${contentType}": ${body.slice(0, 200)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const forceFlag = process.argv.includes("--force");

  console.log("=".repeat(60));
  console.log(" VoiceForge AI — xAI Voice Sample Generator");
  console.log("=".repeat(60));
  console.log(`Output directory : ${OUTPUT_DIR}`);
  console.log(`Demo text        : "${DEMO_TEXT}"`);
  console.log(`Force overwrite  : ${forceFlag}`);
  console.log("-".repeat(60));

  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error(
      "\n✖  XAI_API_KEY not found.\n" +
      "   Set it in backend/.env or as an environment variable:\n" +
      "   XAI_API_KEY=xai-... node scripts/generate-xai-voice-samples.js\n"
    );
    process.exit(1);
  }
  console.log("✔  API key loaded.");

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const voice of VOICES) {
    const outFile = path.join(OUTPUT_DIR, `${voice.id}.mp3`);

    if (!forceFlag && fs.existsSync(outFile)) {
      const size = fs.statSync(outFile).size;
      console.log(`  ↷  ${voice.displayName.padEnd(10)} — already exists (${(size / 1024).toFixed(1)} KB), skipping`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ▶  ${voice.displayName.padEnd(10)} — generating...`);

    try {
      const buffer = await generateAudio(apiKey, voice.xaiVoiceId, DEMO_TEXT);
      fs.writeFileSync(outFile, buffer);
      console.log(` ✔  saved (${(buffer.length / 1024).toFixed(1)} KB)`);
      generated++;
    } catch (err) {
      console.log(` ✖  FAILED: ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("-".repeat(60));
  console.log(`Done. Generated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);

  if (failed > 0) {
    console.warn("\n⚠  Some voices failed. Re-run with --force to retry.");
    process.exit(1);
  }

  if (generated > 0) {
    console.log(
      "\n✔  All audio files saved to:\n" +
      `   ${OUTPUT_DIR}\n\n` +
      "   These are served as static assets — no API calls during playback.\n"
    );
  }
}

main().catch((err) => {
  console.error("\n✖  Fatal error:", err.message);
  process.exit(1);
});
