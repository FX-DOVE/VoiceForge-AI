#!/usr/bin/env node
/**
 * generateElevenLabsPreviews.js
 *
 * For VoiceForge Professional (ElevenLabs) voices:
 * - Calls ElevenLabs TTS for each (or specific like Samuel) to generate preview MP3
 * - Saves to backend/uploads/voice-previews/<id>.mp3
 * - Updates the Voice doc with previewUrl
 *
 * This way, when users preview "Samuel" (or others) in /studio or /voices library,
 * it plays the LOCAL file — ZERO ElevenLabs API calls, no credits consumed for previews.
 *
 * Usage:
 *   node scripts/generateElevenLabsPreviews.js
 *   node scripts/generateElevenLabsPreviews.js --force
 *   node scripts/generateElevenLabsPreviews.js --voice samuel   # only Samuel
 *
 * Requires ELEVENLABS_API_KEY in backend/.env
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectDB } = require("../src/config/db");
const { Voice } = require("../src/models");
const elevenlabs = require("../src/integrations/elevenlabsService");

const PREVIEWS_DIR = path.join(__dirname, "../uploads/voice-previews");
const DEMO_TEXT = "Welcome to VoiceForge AI. Create natural sounding speech in seconds.";

function ensureDir() {
  if (!fs.existsSync(PREVIEWS_DIR)) fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

function getPath(id) {
  return path.join(PREVIEWS_DIR, `${id}.mp3`);
}

function getPublicUrl(id) {
  return `/uploads/voice-previews/${id}.mp3`;
}

async function generateForVoice(voice, { force = false }) {
  const vid = voice.elevenlabsVoiceId || voice.xaiVoiceId || voice.slug;
  if (!vid) return { skipped: true, reason: "no id" };

  const filePath = getPath(vid);
  if (!force && fs.existsSync(filePath)) {
    console.log(`  ↷  ${voice.name} — exists (local preview)`);
    // ensure db has url
    const pub = getPublicUrl(vid);
    if (voice.previewUrl !== pub) {
      await Voice.findByIdAndUpdate(voice._id, { previewUrl: pub });
    }
    return { skipped: true, voice: voice.name };
  }

  console.log(`  ▶  ${voice.name} (${vid}) — calling ElevenLabs for preview...`);
  try {
    const elModelId = (voice.model || "").includes("v3") ? "eleven_multilingual_v2" : "eleven_flash_v2_5";
    const result = await elevenlabs.generateSpeech({
      text: DEMO_TEXT,
      voiceId: vid,
      modelId: elModelId,
    });

    if (!result.buffer) throw new Error("No buffer");

    ensureDir();
    fs.writeFileSync(filePath, result.buffer);

    const pub = getPublicUrl(vid);
    await Voice.findByIdAndUpdate(voice._id, { previewUrl: pub });

    const kb = (result.buffer.length / 1024).toFixed(1);
    console.log(`    ✔ saved ${kb} KB → ${pub} (local, no future API cost for this sample)`);
    return { generated: true, voice: voice.name };
  } catch (e) {
    const msg = e.message || "";
    console.log(`    ✖ FAILED: ${msg}`);
    // If ElevenLabs free/starter plan blocks this "library" voice for TTS, remove it from our catalog
    // so users don't see unusable voices in filters. (User can upgrade EL plan and re-sync.)
    if (msg.includes("paid_plan_required") || msg.includes("402") || msg.includes("payment_required")) {
      try {
        await Voice.findByIdAndDelete(voice._id);
        console.log(`      → Removed from catalog (requires paid ElevenLabs plan for this voice)`);
        return { error: true, removed: true, voice: voice.name };
      } catch (delErr) {
        console.warn(`      → Failed to remove: ${delErr.message}`);
      }
    }
    return { error: true, voice: voice.name };
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const onlyVoice = (process.argv.find(a => a.startsWith("--voice=")) || "").split("=")[1] || null;

  await connectDB();

  console.log("=".repeat(60));
  console.log("  VoiceForge — Professional Voice Preview Generator");
  console.log("  (Pre-generate so Samuel & others play locally in /studio & /voices — no credits burned)");
  console.log("=".repeat(60));

  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("✖ ELEVENLABS_API_KEY not set in backend/.env");
    process.exit(1);
  }

  const query = { provider: "elevenlabs", isActive: true };
  if (onlyVoice) {
    query.$or = [
      { name: new RegExp(onlyVoice, "i") },
      { elevenlabsVoiceId: new RegExp(onlyVoice, "i") },
      { slug: new RegExp(onlyVoice, "i") }
    ];
  }

  const voices = await Voice.find(query);
  console.log(`Found ${voices.length} VoiceForge Professional voices to process.`);

  let gen = 0, skip = 0, err = 0, removed = 0;

  for (const v of voices) {
    const r = await generateForVoice(v, { force });
    if (r.generated) gen++;
    else if (r.skipped) skip++;
    else if (r.error) err++;
    if (r.removed) removed++;
    await new Promise(r => setTimeout(r, 400)); // polite delay
  }

  console.log(`\nDone. Generated: ${gen}, Skipped (local): ${skip}, Errors: ${err}, Removed (unusable on current EL plan): ${removed}`);
  console.log("Local previews will now be served directly for these voices in studio/voices library.");
}

main().catch(console.error);
