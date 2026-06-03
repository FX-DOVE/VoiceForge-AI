#!/usr/bin/env node
/**
 * Force backfill all Voice documents to have correct provider, isPublic, isActive, etc.
 * Run this on VPS if voices still empty after refresh.
 *
 * docker compose exec api node scripts/force-backfill-voices.js
 *
 * This is aggressive and safe (only $set, no deletes).
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { Voice } = require("../src/models");

async function forceBackfill() {
  await connectDB();
  console.log("Connected to DB. Starting force backfill for Voice...");

  const voices = await Voice.find({}).lean();
  console.log(`Found ${voices.length} voices in DB.`);

  let updated = 0;
  for (const v of voices) {
    const updates = {};

    // Determine provider
    let prov = v.provider || "xai";
    const tier = (v.tier || "").toLowerCase();
    const src = (v.source || "").toLowerCase();
    const hasEl = !!v.elevenlabsVoiceId;
    const hasXai = !!v.xaiVoiceId;
    const isCloned = v.type === "cloned";

    if (isCloned) {
      if (hasEl || src === "elevenlabs" || (hasXai && v.xaiVoiceId.length > 20)) {
        prov = "elevenlabs";
      } else {
        prov = "xai";
      }
    } else if (hasEl || src === "elevenlabs" || prov === "elevenlabs") {
      prov = "elevenlabs";
    } else if (tier === "free" || src === "edge" || prov === "free") {
      prov = "free";
    } else if (src === "xai" || hasXai || prov === "xai") {
      prov = "xai";
    }

    if (prov !== v.provider) {
      updates.provider = prov;
    }

    // Source
    let newSrc = src || "";
    if (prov === "free" && !newSrc) newSrc = "edge";
    if (prov === "xai" && !newSrc) newSrc = "xai";
    if (prov === "elevenlabs" && !newSrc) newSrc = "elevenlabs";
    if (newSrc && newSrc !== src) {
      updates.source = newSrc;
    }

    // isPublic / isActive
    if (v.isPublic !== true) updates.isPublic = true;
    if (v.isActive !== true) updates.isActive = true;

    // For free/edge
    if (prov === "free") {
      if (!v.costTier || v.costTier === "low" /* keep if set */) {
        updates.costTier = "low";
      }
      if (!v.model) updates.model = "edge";
      if (!v.tier) updates.tier = "free";
    }

    // For xai
    if (prov === "xai") {
      if (!v.costTier) updates.costTier = "low";
      if (!v.model) updates.model = "voice_api";
      if (!v.tier) updates.tier = "pro";
    }

    // For elevenlabs
    if (prov === "elevenlabs") {
      if (!v.costTier) updates.costTier = hasEl && (v.name || "").toLowerCase().includes("v3") ? "high" : "medium";
      if (!v.model) updates.model = "flash";
      if (!v.tier) updates.tier = "pro";
    }

    // Cloned
    if (isCloned) {
      if (!v.tier) updates.tier = "pro";
    }

    if (Object.keys(updates).length > 0) {
      await Voice.updateOne({ _id: v._id }, { $set: updates });
      updated++;
      if (updated % 10 === 0) console.log(`Updated ${updated} so far...`);
    }
  }

  console.log(`Force backfill complete. Updated ${updated} voices.`);

  // Verify
  const freeCount = await Voice.countDocuments({ provider: "free", isPublic: true, isActive: true });
  const xaiCount = await Voice.countDocuments({ provider: "xai", isPublic: true, isActive: true });
  const elCount = await Voice.countDocuments({ provider: "elevenlabs", isPublic: true, isActive: true });
  const totalPubActive = await Voice.countDocuments({ isPublic: true, isActive: true });

  console.log(`Verification:
- Free (provider=free, pub+active): ${freeCount}
- xAI (provider=xai, pub+active): ${xaiCount}
- EL (provider=elevenlabs, pub+active): ${elCount}
- Total pub+active: ${totalPubActive}
  `);

  process.exit(0);
}

forceBackfill().catch(err => {
  console.error("Backfill failed:", err);
  process.exit(1);
});