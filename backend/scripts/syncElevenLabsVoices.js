#!/usr/bin/env node
/**
 * Sync ElevenLabs voices into VoiceForge as "VoiceForge Professional" voices.
 *
 * Usage:
 *   node scripts/syncElevenLabsVoices.js
 *
 * This will:
 * - Fetch all voices from ElevenLabs (using ELEVENLABS_API_KEY)
 * - Create/update Voice docs with provider: "professional"
 * - Set elevenlabsVoiceId
 * - For "Samuel" (or voices matching name), mark for special local preview handling
 *
 * After sync, run preview generator for local cached previews (no repeated API cost for samples).
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { Voice } = require("../src/models");
const elevenlabs = require("../src/integrations/elevenlabsService");

async function syncElevenLabsVoices() {
  console.log("[Professional Sync] Fetching voice catalog from ElevenLabs for Professional plan...");

  let elVoices;
  try {
    elVoices = await elevenlabs.listVoices();
  } catch (e) {
    console.error("[ElevenLabs Sync] Failed to list voices. Is ELEVENLABS_API_KEY set?", e.message);
    return { imported: 0 };
  }

  if (!elVoices || elVoices.length === 0) {
    console.warn("[ElevenLabs Sync] No voices returned.");
    return { imported: 0 };
  }

  console.log(`[Professional Sync] Received ${elVoices.length} voices from ElevenLabs`);

  // Filter to only voices that the current ELEVENLABS_API_KEY can actually use for synthesis.
  // Some "library" voices require a paid ElevenLabs plan (402 paid_plan_required).
  console.log("[Professional Sync] Validating which voices are usable with current key (tiny test TTS)...");
  const usableVoices = [];
  for (const ev of elVoices) {
    const vid = ev.voice_id || ev.id;
    if (!vid) continue;
    try {
      // Tiny test to check access (1 char, fast, low cost)
      await elevenlabs.generateSpeech({ text: "a", voiceId: vid, modelId: "eleven_multilingual_v2" });
      usableVoices.push(ev);
    } catch (e) {
      const m = e.message || "";
      if (m.includes("paid_plan_required") || m.includes("402") || m.includes("payment_required")) {
        console.log(`  ↷  Skipping ${ev.name || vid} (requires paid ElevenLabs plan)`);
      } else {
        console.warn(`  ↷  Skipping ${ev.name || vid} (test failed: ${m.slice(0,100)})`);
      }
    }
  }
  console.log(`[Professional Sync] ${usableVoices.length} voices usable with current key (out of ${elVoices.length}).`);

  let upserted = 0;

  for (const ev of usableVoices) {
    const voiceId = ev.voice_id || ev.id || ev.name;
    if (!voiceId) continue;

    const name = ev.name || voiceId;
    const slug = `vf-${voiceId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    const isSamuel = name.toLowerCase().includes("samuel") || voiceId.toLowerCase().includes("samuel");

    const labels = ev.labels || {};
    const age = labels.age || labels.age_range || "";
    const useCase = labels.use_case || labels.category || "";
    const country = labels.country || labels.accent_country || "";

    const doc = {
      slug,
      name,
      provider: "elevenlabs",
      source: "elevenlabs",
      elevenlabsVoiceId: voiceId,
      xaiVoiceId: voiceId, // for compatibility in some places
      tier: "pro",
      isPublic: true,
      isActive: true,
      isCoreVoice: isSamuel, // treat Samuel as core for special handling
      languages: labels.language ? [labels.language] : ["en"],
      gender: labels.gender ? capitalize(labels.gender) : "",
      accent: labels.accent || "",
      age: age ? capitalize(age) : "",
      country: country || "",
      model: "flash", // default for synced; admin can upgrade some to multilingual_v3
      costTier: "medium",
      description: ev.description || labels.description || `Professional voice powered by ElevenLabs — ${name}`,
      creator: "VoiceForge Professional (ElevenLabs)",
      img: "", // can be filled later
      previewUrl: "", // will be set by preview generator for cached ones
      tags: useCase ? [useCase] : [],
      metadata: {
        elevenlabsLabels: labels,
        category: ev.category || labels.category || "premade",
        use_case: useCase,
        isSamuel: isSamuel,
      },
    };

    await Voice.findOneAndUpdate(
      { slug },
      { $set: doc },
      { upsert: true, new: true }
    );

    upserted++;
    if (isSamuel) {
      console.log(`  ★ Samuel voice synced: ${name} (${voiceId}) — will get local preview installed`);
    }
  }

  console.log(`[ElevenLabs Sync] Synced ${upserted} Professional (elevenlabs provider) voices.`);
  return { imported: upserted };
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function main() {
  await connectDB();
  const result = await syncElevenLabsVoices();
  console.log("Sync complete:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
