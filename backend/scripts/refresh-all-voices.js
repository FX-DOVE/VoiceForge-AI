#!/usr/bin/env node
/**
 * One-shot script to (re)populate the Voice library on VPS after deploy/update.
 *
 * Run on VPS (inside the api container or with proper env):
 *   docker compose exec api node scripts/refresh-all-voices.js
 *
 * What it does:
 * - Seeds base Free + xAI Pro voices
 * - Syncs ElevenLabs voices (the Premium library) using ELEVENLABS_API_KEY from env
 * - Backfills provider/model/costTier fields for rebrand + multi-provider
 * - Seeds BillingProfiles (required for correct credit charging on Pro/Premium)
 * - (Optional) generates local EL previews - comment out if you want to run separately
 *
 * Safe to run multiple times (idempotent upserts).
 *
 * Prerequisites on VPS:
 * - backend/.env has MONGODB_URI and ELEVENLABS_API_KEY (and XAI if using xai sync)
 * - Containers up: docker compose up -d
 */

require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../src/config");
const { seedDefaultVoices } = require("../src/utils/seedVoices");
const { connectDB } = require("../src/config/db");

// Import backfill logic from migrate (or duplicate minimal)
const { Voice, BillingProfile } = require("../src/models");

// Comprehensive backfill to correct provider/source for free/edge/xai/el/cloned, and ensure isPublic/isActive
// This fixes existing prod docs that have wrong provider (e.g. edge voices with provider=xai) or missing isPublic/isActive
async function backfillVoiceFields() {
  console.log("\n=== Backfilling voice provider/model/costTier/isPublic/isActive for rebrand compatibility ===");

  // 1. Set provider based on data for ALL voices (force correct even if currently set wrong, e.g. tier=free but provider=xai)
  let fixedProv = 0;
  const allVoices = await Voice.find({}).select("_id tier source elevenlabsVoiceId xaiVoiceId type provider");
  for (const v of allVoices) {
    let prov = v.provider || "xai";
    let src = v.source || "";
    if (v.type === "cloned") {
      if (v.elevenlabsVoiceId || (v.source === "elevenlabs") || (v.xaiVoiceId && v.xaiVoiceId.length > 20)) {
        prov = "elevenlabs";
        src = src || "elevenlabs";
      } else {
        prov = "xai";
        src = src || "xai";
      }
    } else if (v.elevenlabsVoiceId || v.provider === "elevenlabs" || v.source === "elevenlabs") {
      prov = "elevenlabs";
      src = src || "elevenlabs";
    } else if ((v.tier || "") === "free" || v.source === "edge") {
      prov = "free";
      src = src || "edge";
    } else if (v.source === "xai" || v.xaiVoiceId) {
      prov = "xai";
      src = src || "xai";
    }
    const updates = {};
    if (prov !== v.provider) updates.provider = prov;
    if (src && src !== v.source) updates.source = src;
    if (Object.keys(updates).length) {
      await Voice.updateOne({ _id: v._id }, { $set: updates });
      fixedProv++;
    }
  }
  console.log(`Backfilled/corrected provider/source on ${fixedProv} voices.`);

  // 2. Ensure isPublic and isActive true for all stock / public voices (old docs may miss the fields entirely)
  const toFixPublicActive = await Voice.find({
    $or: [
      { isPublic: { $ne: true } },
      { isActive: { $ne: true } },
      { isPublic: { $exists: false } },
      { isActive: { $exists: false } }
    ]
  }).select("_id type isPublic isActive");
  if (toFixPublicActive.length) {
    await Voice.updateMany(
      { _id: { $in: toFixPublicActive.map(v => v._id) } },
      { $set: { isPublic: true, isActive: true } }
    );
    console.log(`Set isPublic=true, isActive=true on ${toFixPublicActive.length} voices (was missing or false).`);
  }

  // 3. Specific fixes for el that have id but wrong provider
  const elFix = await Voice.find({ elevenlabsVoiceId: { $ne: "" }, provider: { $ne: "elevenlabs" } }).select("_id");
  if (elFix.length) {
    await Voice.updateMany({ _id: { $in: elFix.map(x => x._id) } }, { $set: { provider: "elevenlabs", source: "elevenlabs" } });
    console.log(`Fixed provider on ${elFix.length} EL voices.`);
  }

  // 4. Cloned el
  const clonedEl = await Voice.find({ type: "cloned", elevenlabsVoiceId: { $ne: "" }, provider: { $ne: "elevenlabs" } }).limit(1000);
  if (clonedEl.length) {
    await Voice.updateMany({ _id: { $in: clonedEl.map(x=>x._id)} }, { $set: { provider: "elevenlabs", source: "elevenlabs", tier: "pro" } });
    console.log(`Fixed ${clonedEl.length} cloned EL voices.`);
  }

  // 5. Backfill model/costTier based on provider (if missing)
  const xaiNoModel = await Voice.updateMany(
    { provider: "xai", $or: [{ model: { $exists: false } }, { model: "" }] },
    { $set: { model: "voice_api", costTier: "low" } }
  );
  if (xaiNoModel.modifiedCount) console.log(`Backfilled xAI model/costTier: ${xaiNoModel.modifiedCount}`);

  const elNoModel = await Voice.updateMany(
    { provider: "elevenlabs", $or: [{ model: { $exists: false } }, { model: "" }] },
    { $set: { model: "flash", costTier: "medium" } }
  );
  if (elNoModel.modifiedCount) console.log(`Backfilled EL (flash) model/costTier: ${elNoModel.modifiedCount}`);

  const freeNoModel = await Voice.updateMany(
    { provider: "free", $or: [{ model: { $exists: false } }, { model: "" }] },
    { $set: { model: "edge", costTier: "low" } }
  );
  if (freeNoModel.modifiedCount) console.log(`Backfilled free model/costTier: ${freeNoModel.modifiedCount}`);

  console.log("Backfill complete.");
}

async function seedBillingProfiles() {
  console.log("\n=== Seeding Billing Profiles (for correct Pro/Premium credit costs) ===");
  // Call the existing seed script logic if possible, else minimal
  try {
    const seedScript = require("./seed-billing-profiles");
    if (typeof seedScript === "function") {
      await seedScript();
    } else {
      // Fallback: direct upsert of common profiles
      const profiles = [
        { provider: "xai", model: "voice_api", costTier: "low", costPerMillionCharacters: 5, creditsPerCharacter: 2, platformShare: 0.5, apiShare: 0.5, active: true },
        { provider: "elevenlabs", model: "flash", costTier: "medium", costPerMillionCharacters: 18, creditsPerCharacter: 7, platformShare: 0.5, apiShare: 0.5, active: true, displayName: "VoiceForge Premium" },
        { provider: "elevenlabs", model: "multilingual_v3", costTier: "high", costPerMillionCharacters: 30, creditsPerCharacter: 14, platformShare: 0.5, apiShare: 0.5, active: true, displayName: "VoiceForge Premium" },
        { provider: "free", model: "edge", costTier: "low", costPerMillionCharacters: 0, creditsPerCharacter: 0, platformShare: 1, apiShare: 0, active: true }
      ];
      for (const p of profiles) {
        await BillingProfile.findOneAndUpdate(
          { provider: p.provider, model: p.model },
          { $set: p },
          { upsert: true }
        );
      }
      console.log("Upserted default billing profiles.");
    }
  } catch (e) {
    console.warn("Billing profile seed had issue (non-fatal):", e.message);
  }
}

async function main() {
  console.log("=== VoiceForge AI - Refresh / Fix Voices on VPS ===");
  console.log("This will populate the library (Free + Pro xAI + Premium EL voices).");
  console.log("Make sure ELEVENLABS_API_KEY (and XAI if wanted) are in backend/.env\n");

  await connectDB();
  console.log("DB connected.\n");

  // 1. Base voices (Free + xAI Pro)
  console.log("=== 1. Seed default voices (Free + xAI Pro) ===");
  await seedDefaultVoices();

  // 2. Sync xAI catalog (idempotent)
  console.log("\n=== 2. Sync xAI voices (if XAI_API_KEY present) ===");
  try {
    if (config.xai && config.xai.apiKey) {
      const xaiSync = require("../src/utils/syncXaiVoices");
      if (xaiSync && typeof xaiSync.syncXaiVoices === 'function') {
        await xaiSync.syncXaiVoices();
      } else if (xaiSync && typeof xaiSync === 'function') {
        await xaiSync();
      } else {
        console.log("syncXaiVoices util not exporting expected function, skipping detailed sync (defaults seeded).");
      }
    } else {
      console.log("No XAI_API_KEY or util not found - skipping extra xAI sync (defaults already seeded).");
    }
  } catch (e) {
    console.warn("xAI sync non-fatal:", e.message);
  }

  // 3. Sync ElevenLabs Premium voices (the big one for /library and studio Premium tab)
  console.log("\n=== 3. Sync ElevenLabs voices (VoiceForge Premium library) ===");
  try {
    // Self-contained sync (avoid requiring the sync script directly because it auto-runs its main())
    const elevenlabs = require("../src/integrations/elevenlabsService");
    const { Voice } = require("../src/models");

    console.log("[EL Sync] Fetching from ElevenLabs...");
    let elVoices = [];
    try {
      elVoices = await elevenlabs.listVoices();
    } catch (e) {
      console.error("Failed to list EL voices. Check ELEVENLABS_API_KEY in env.", e.message);
    }

    let upserted = 0;
    for (const ev of elVoices || []) {
      const voiceId = ev.voice_id || ev.id;
      if (!voiceId) continue;
      const slug = `vf-${voiceId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const doc = {
        slug,
        name: ev.name || voiceId,
        provider: "elevenlabs",
        source: "elevenlabs",
        model: "flash",
        costTier: "medium",
        elevenlabsVoiceId: voiceId,
        tier: "pro",
        type: "stock",
        isPublic: true,
        isActive: true,
        languages: ev.labels?.language ? [ev.labels.language] : ["English"],
        gender: ev.labels?.gender || "",
        accent: ev.labels?.accent || "",
        age: ev.labels?.age || "",
        description: ev.description || ev.labels?.description || "Premium ElevenLabs voice",
        tags: ["Premium", "ElevenLabs", ev.labels?.accent || ""].filter(Boolean),
      };
      await Voice.findOneAndUpdate({ slug }, { $set: doc }, { upsert: true });
      upserted++;
    }
    console.log(`[EL Sync] Upserted ${upserted} ElevenLabs Premium voices.`);
  } catch (e) {
    console.error("EL voices sync failed (check key + connection):", e.message);
  }

  // 4. Backfill any missing fields (rebrand safety)
  await backfillVoiceFields();

  // 5. Ensure billing profiles exist (so charging for Pro/Premium uses correct "eleven lab budget")
  await seedBillingProfiles();

  console.log("\n=== Done! ===");
  console.log("Voices should now appear in /voices (library) and /studio.");
  console.log("If previews are missing for EL voices, also run:");
  console.log("  docker compose exec api node scripts/generateElevenLabsPreviews.js");
  console.log("\nRestart the stack if needed: docker compose up -d");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Refresh failed:", err);
  process.exit(1);
});