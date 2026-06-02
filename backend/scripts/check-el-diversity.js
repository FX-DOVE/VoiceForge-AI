const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const totalEl = await Voice.countDocuments({provider: "elevenlabs"});
  const premium = await Voice.countDocuments({provider: "elevenlabs", model: "multilingual_v3", costTier: "high"});
  const flash = await Voice.countDocuments({provider: "elevenlabs", model: "flash"});
  console.log("Total ElevenLabs voices:", totalEl);
  console.log("  - Premium (v3, high):", premium);
  console.log("  - Flash (medium):", flash);
  // Sample some diversity
  const samples = await Voice.find({provider:"elevenlabs", model:"multilingual_v3"}).select("name gender age accent country languages").limit(5).lean();
  console.log("Sample premium voices:");
  samples.forEach(s => console.log(`  ${s.name} | ${s.gender} ${s.age} | ${s.accent} | ${s.country} | langs: ${s.languages}`));
  await mongoose.disconnect();
})();
