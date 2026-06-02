/**
 * Cleanup script: Fix voices that were incorrectly given provider="elevenlabs"
 * during previous migrations/seeding, but have no real ElevenLabs voice_id.
 *
 * - Real EL voices (from syncElevenLabsVoices or successful professional clones) have a proper elevenlabsVoiceId.
 * - Bad ones (edge stock, xai stock, incomplete clones) get their provider reset to "free" or "xai".
 *
 * Run after adding your ELEVENLABS_API_KEY and running syncElevenLabsVoices.js
 */

const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice, VoiceClone } = require("../src/models");

async function cleanup() {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  console.log("Connected for cleanup...");

  const badQuery = {
    provider: "elevenlabs",
    $or: [
      { elevenlabsVoiceId: { $exists: false } },
      { elevenlabsVoiceId: null },
      { elevenlabsVoiceId: "" },
      { elevenlabsVoiceId: { $regex: /^(edge-|xai-)/ } } // obviously not real EL ids
    ]
  };

  const badVoices = await Voice.find(badQuery).select("_id name slug provider tier source type elevenlabsVoiceId xaiVoiceId voiceCloneRef").lean();
  console.log(`Found ${badVoices.length} bad voices claiming to be elevenlabs but without real EL id.`);

  let fixedFree = 0;
  let fixedXai = 0;
  let skippedClones = 0;

  for (const v of badVoices) {
    let newProvider = null;

    const isEdge = (v.source === "edge") || v.slug?.startsWith("edge-") || (v.elevenlabsVoiceId || "").startsWith("edge-");
    const isXai = (v.source === "xai") || v.slug?.startsWith("xai-") || (v.xaiVoiceId && v.xaiVoiceId.length > 3);

    if (v.type === "cloned") {
      // For clones, try to see how they were created.
      // If the linked VoiceClone has provider "elevenlabs", keep "elevenlabs" even if id missing temporarily (user can re-clone).
      // Otherwise reset to xai (legacy clone path used xAI).
      if (v.voiceCloneRef) {
        const cloneDoc = await VoiceClone.findById(v.voiceCloneRef).select("provider").lean();
        if (cloneDoc && cloneDoc.provider === "elevenlabs") {
          // Leave as elevenlabs — the id will be populated on successful clone.
          skippedClones++;
          continue;
        }
      }
      newProvider = "xai"; // default legacy clones to xai
    } else if (isEdge || v.tier === "free") {
      newProvider = "free";
    } else if (isXai || v.tier === "pro") {
      newProvider = "xai";
    } else {
      newProvider = "xai"; // safe default for pro stock
    }

    if (newProvider && newProvider !== "elevenlabs") {
      await Voice.updateOne({ _id: v._id }, { $set: { provider: newProvider } });
      if (newProvider === "free") fixedFree++;
      else fixedXai++;
    }
  }

  console.log(`Cleanup done. Reset ${fixedFree} to free, ${fixedXai} to xai. Skipped ${skippedClones} real professional clones (will keep provider=elevenlabs).`);

  // Quick verification
  const remainingBad = await Voice.countDocuments(badQuery);
  const goodEl = await Voice.countDocuments({ provider: "elevenlabs", elevenlabsVoiceId: { $exists: true, $ne: "" } });
  console.log(`After cleanup: ${remainingBad} still look bad (should be 0 or only pending clones). Good real EL voices: ${goodEl}`);

  await mongoose.disconnect();
}

cleanup().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
