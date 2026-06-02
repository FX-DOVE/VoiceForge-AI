const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  console.log("Connected to DB for inspection.");

  const elVoices = await Voice.find({ provider: "elevenlabs" })
    .select("name slug provider elevenlabsVoiceId tier source isCoreVoice createdAt")
    .sort({ createdAt: -1 })
    .lean();

  console.log("\n=== Total voices with provider=elevenlabs:", elVoices.length, "===");
  elVoices.slice(0, 10).forEach(v => {
    console.log(`- ${v.name} | slug: ${v.slug} | realElId: ${!!v.elevenlabsVoiceId} | tier: ${v.tier}`);
  });

  const bad = await Voice.find({
    provider: "elevenlabs",
    $or: [{ elevenlabsVoiceId: { $exists: false } }, { elevenlabsVoiceId: null }, { elevenlabsVoiceId: "" }]
  }).select("name slug").lean();

  console.log("\n=== Bad 'elevenlabs' voices without real elevenlabsVoiceId:", bad.length);
  bad.forEach(v => console.log("  BAD:", v.name, v.slug));

  // Also check if any xai voices have wrong labels
  const maybeWrong = await Voice.find({
    provider: { $ne: "elevenlabs" },
    $or: [
      { name: /Eve|Leo|Rex|Sal|Antoni|Rachel/i },
      { source: "elevenlabs" },
      { elevenlabsVoiceId: { $exists: true, $ne: null, $ne: "" } }
    ]
  }).select("name provider source elevenlabsVoiceId").limit(10).lean();

  console.log("\n=== Sample voices that might be leaking (non-el provider but EL name or id):");
  maybeWrong.forEach(v => console.log("  ", v.name, "prov:", v.provider, "src:", v.source, "elId?", !!v.elevenlabsVoiceId));

  await mongoose.disconnect();
  console.log("\nInspection done.");
})();
