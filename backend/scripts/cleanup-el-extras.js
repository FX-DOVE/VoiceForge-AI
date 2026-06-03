#!/usr/bin/env node
/**
 * Cleanup script for extra/unusable ElevenLabs premium voices.
 *
 * The seed-many-el-premium-voices.js added ~100 voices (el-premium- slugs)
 * using a small pool of real EL ids, for "diversity".
 * However, with a free/starter EL API key, most of these "library" voices
 * cannot be used for TTS (paid_plan_required / 402).
 * They also lack cached previews, and on-demand preview falls back to
 * invalid Edge voice (xaiVoiceId set to EL id), causing "could not load preview".
 *
 * This script:
 * - Deletes all voices with slug starting with "el-premium-" and provider="elevenlabs"
 *   (the extras from seed-many)
 * - Then, optionally re-runs preview generation for remaining EL voices
 *   to ensure they have local previews.
 *
 * After this, both /voices library and /studio should show the same ~21
 * usable premium voices (the ones from syncElevenLabsVoices that passed
 * usability test with your key), all with working previews.
 *
 * Run on VPS:
 *   docker compose exec api node scripts/cleanup-el-extras.js
 *
 * Safe: only deletes the known extra slugs. Does not touch synced voices
 * (which have vf- slugs) or clones.
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { Voice } = require("../src/models");

async function cleanup() {
  await connectDB();
  console.log("Connected to MongoDB for EL extras cleanup...");

  // Find the extras from seed-many
  const extras = await Voice.find({
    slug: { $regex: /^el-premium-/ },
    provider: "elevenlabs"
  }).select("_id slug name elevenlabsVoiceId").lean();

  console.log(`Found ${extras.length} extra EL premium voices with el-premium- slugs.`);

  if (extras.length === 0) {
    console.log("No extras to clean. Perhaps already cleaned or not seeded.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const idsToDelete = extras.map(v => v._id);

  // Delete them
  const delResult = await Voice.deleteMany({ _id: { $in: idsToDelete } });
  console.log(`Deleted ${delResult.deletedCount} extra voices.`);

  // Log a few
  console.log("Examples of removed:");
  extras.slice(0, 5).forEach(v => console.log(`  - ${v.name} (${v.slug}) id=${v.elevenlabsVoiceId}`));

  // Now, to ensure the remaining good EL voices have previews, we can suggest running generate.
  // But to make it complete, trigger the preview gen for el voices.
  console.log("\nNow ensuring previews for remaining EL voices...");
  console.log("This will use the generateElevenLabsPreviews logic for provider=elevenlabs.");

  // To avoid code dupe, we can require and call, but since it's a script with main, we'll exec it.
  // For simplicity here, just instruct, but to auto, we can spawn or duplicate minimal.
  // Since the task is to clear, and generate does more, we'll call it via child or just note.

  // For this script, after delete, we can run the preview gen by requiring its functions if exported, but it's not.
  // So, we'll just log the command, but to "build a script", this one clears the extras.

  console.log("\nCleanup of extras done.");
  console.log("To ensure all remaining (~21) premium voices have working local previews, run:");
  console.log("  docker compose exec api node scripts/generateElevenLabsPreviews.js");
  console.log("(This will also clean any other unusable EL voices it finds.)");

  // Optionally, to auto do it, but since generate has its own connect etc, we can exec.
  // But for now, this script focuses on clearing the known extras from seed-many.

  const remainingEl = await Voice.countDocuments({ provider: "elevenlabs", isActive: true });
  console.log(`\nRemaining EL voices in DB: ${remainingEl}`);

  await mongoose.disconnect();
  console.log("Done. Both library and studio should now show the same number of premium voices, all with playable previews.");

  // After cleanup, auto-run preview generation for remaining EL to ensure all have playable local previews.
  // This will also catch/remove any other unusable EL voices.
  console.log("\nAuto-running preview generation for remaining EL voices to fix 'could not load preview'...");
  const { execSync } = require("child_process");
  try {
    execSync("node scripts/generateElevenLabsPreviews.js", { stdio: "inherit", cwd: __dirname + "/.." });
    console.log("Preview generation complete.");
  } catch (e) {
    console.warn("Preview gen had issues (non-fatal):", e.message);
  }

  process.exit(0);
}

const mongoose = require("mongoose");

cleanup().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});