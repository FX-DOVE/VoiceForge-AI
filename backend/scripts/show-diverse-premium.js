const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const diverse = await Voice.find({provider:"elevenlabs", model:"multilingual_v3", country: {$ne: ""}}).select("name gender age accent country languages").limit(5).lean();
  console.log("Diverse premium samples:");
  diverse.forEach(s => console.log(`  ${s.name} (${s.gender}, ${s.age}) - ${s.accent} - ${s.country} - ${s.languages}`));
  await mongoose.disconnect();
})();
