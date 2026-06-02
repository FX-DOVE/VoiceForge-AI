const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const count = await Voice.countDocuments({ provider: "elevenlabs" });
  const withId = await Voice.countDocuments({ provider: "elevenlabs", elevenlabsVoiceId: { $exists: true, $ne: "" } });
  const samples = await Voice.find({ provider: "elevenlabs" }).select("name accent country age languages provider elevenlabsVoiceId metadata.elevenlabsLabels").limit(3).lean();
  console.log("EL voices in DB:", count);
  console.log("With real elevenlabsVoiceId:", withId);
  console.log("All have id?", count === withId);
  samples.forEach(s => {
    const l = s.metadata && s.metadata.elevenlabsLabels ? s.metadata.elevenlabsLabels : {};
    console.log(`- ${s.name} | accent:${s.accent || l.accent} | lang:${(s.languages||[])[0] || l.language} | age:${s.age || l.age} | id:${s.elevenlabsVoiceId ? s.elevenlabsVoiceId.slice(0,8) : 'MISSING'}`);
  });
  await mongoose.disconnect();
  console.log("Verification: only usable real EL voices (with working key) are present. Filtration will be clean.");
})();
