/**
 * Backfill model and costTier on existing Voice docs for multi-model support.
 * Safe, only sets if missing.
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { Voice } = require("../src/models");

async function backfill() {
  await connectDB();
  console.log("Backfilling Voice model/costTier...");

  // xAI -> low
  const xai = await Voice.updateMany(
    { provider: "xai", $or: [{ model: { $exists: false } }, { model: "" }] },
    { $set: { model: "voice_api", costTier: "low" } }
  );
  console.log("xAI updated:", xai.modifiedCount);

  // elevenlabs without model -> assume flash (medium) for existing
  const el = await Voice.updateMany(
    { provider: "elevenlabs", $or: [{ model: { $exists: false } }, { model: "" }] },
    { $set: { model: "flash", costTier: "medium" } }
  );
  console.log("ElevenLabs (default flash) updated:", el.modifiedCount);

  // free
  const free = await Voice.updateMany(
    { provider: "free", $or: [{ model: { $exists: false } }, { model: "" }] },
    { $set: { model: "default", costTier: "low" } }
  );
  console.log("Free updated:", free.modifiedCount);

  console.log("Backfill complete.");
  process.exit(0);
}

backfill().catch(e => { console.error(e); process.exit(1); });
