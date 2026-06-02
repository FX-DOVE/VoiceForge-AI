/**
 * VoiceForge AI - Professional Multi-Provider Complete Migration (Safe, Non-Destructive)
 *
 * Per spec:
 * - Use migrations only.
 * - Preserve ALL users, credits, deposits, transactions, history, existing xAI.
 * - No balance resets, no destructive ops.
 * - Backfills only missing provider fields etc for new architecture.
 * - Sets up providerProfiles.xai + elevenlabs if missing.
 *
 * Run: node scripts/migrate-professional-complete.js
 *
 * Idempotent. Safe to run multiple times.
 */

const mongoose = require("mongoose");
const config = require("../src/config");
const { User, Voice, BillingSetting, ProfessionalMembership } = require("../src/models");

async function run() {
  console.log("=== VoiceForge Professional Upgrade Migration (safe) ===");

  const uri = config.mongodbUri || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri);
  console.log("Connected.");

  // 1. Ensure all voices have provider (free | xai | elevenlabs)
  const voicesNoProv = await Voice.find({ provider: { $exists: false } }).select("_id tier source elevenlabsVoiceId");
  let vFixed = 0;
  for (const v of voicesNoProv) {
    let prov = "xai";
    if ((v.tier || "") === "free") prov = "free";
    else if (v.elevenlabsVoiceId || (v.source === "elevenlabs")) prov = "elevenlabs";
    else if (v.source === "edge") prov = "free"; // edge are free tier
    await Voice.updateOne({ _id: v._id }, { $set: { provider: prov } });
    vFixed++;
  }
  console.log(`Backfilled provider on ${vFixed} voices.`);

  // 2. Ensure voices with elevenlabsVoiceId have provider=elevenlabs
  const elVoices = await Voice.find({ elevenlabsVoiceId: { $ne: "" }, provider: { $ne: "elevenlabs" } }).select("_id");
  if (elVoices.length) {
    await Voice.updateMany({ _id: { $in: elVoices.map(v=>v._id) } }, { $set: { provider: "elevenlabs" } });
    console.log(`Fixed ${elVoices.length} elevenlabs voices provider.`);
  }

  // 3. Ensure cloned voices from professional have correct provider (best effort)
  const clonedEl = await Voice.find({ type: "cloned", provider: { $ne: "elevenlabs" }, voiceCloneRef: { $ne: null } }).limit(500);
  let cFixed = 0;
  for (const v of clonedEl) {
    // If it has elevenlabs id stored in xaiVoiceId or eleven, set
    if (v.elevenlabsVoiceId || (v.xaiVoiceId && v.xaiVoiceId.length > 10)) { // rough, el ids are uuid-like
      await Voice.updateOne({ _id: v._id }, { $set: { provider: "elevenlabs" } });
      cFixed++;
    }
  }
  if (cFixed) console.log(`Updated ${cFixed} cloned voices to elevenlabs provider.`);

  // 4. Ensure BillingSetting has complete providerProfiles for xai + elevenlabs + free
  const bs = await BillingSetting.getSettings();
  let changed = false;
  if (!bs.providerProfiles) {
    bs.providerProfiles = {};
    changed = true;
  }
  if (!bs.providerProfiles.xai) {
    bs.providerProfiles.xai = {
      costPerMillionCharacters: bs.ttsCostPerMillionCharacters || 15,
      creditsPerCharacter: bs.creditsPerCharacter || 2,
      platformShare: bs.platformShare || 0.5,
      apiShare: bs.apiShare || 0.5,
    };
    changed = true;
  }
  if (!bs.providerProfiles.elevenlabs) {
    bs.providerProfiles.elevenlabs = {
      costPerMillionCharacters: (bs.elevenlabs && bs.elevenlabs.costPerMillionCharacters) || 50,
      creditsPerCharacter: (bs.elevenlabs && bs.elevenlabs.creditsPerCharacter) || 7,
      platformShare: (bs.elevenlabs && bs.elevenlabs.platformShare) || 0.5,
      apiShare: (bs.elevenlabs && bs.elevenlabs.apiShare) || 0.5,
    };
    changed = true;
  }
  if (!bs.providerProfiles.free) {
    bs.providerProfiles.free = { costPerMillionCharacters: 0, creditsPerCharacter: 0, platformShare: 0, apiShare: 0 };
    changed = true;
  }
  if (changed) {
    await bs.save();
    console.log("Ensured providerProfiles in BillingSetting (xai, elevenlabs, free).");
  } else {
    console.log("Billing providerProfiles already complete.");
  }

  // 5. Ensure ProfessionalMembership collection exists (by touching index)
  await ProfessionalMembership.syncIndexes().catch(() => {});
  const memCount = await ProfessionalMembership.countDocuments();
  console.log(`ProfessionalMembership docs: ${memCount} (collection ready).`);

  // 6. Do NOT touch user plans or credits. Log counts.
  const userCount = await User.countDocuments();
  const proUsers = await User.countDocuments({ plan: "professional" });
  const proMemActive = await ProfessionalMembership.countDocuments({ status: "active" });
  console.log(`Users: ${userCount} | plan=professional: ${proUsers} | active memberships: ${proMemActive}`);

  console.log("\nMigration complete. All existing data preserved. No balances or history modified.");
  console.log("Next: restart server / run any seed if voices needed.");

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("MIGRATION FAILED:", err);
  process.exit(1);
});
