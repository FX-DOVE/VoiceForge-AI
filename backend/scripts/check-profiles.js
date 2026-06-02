const mongoose = require("mongoose");
const config = require("../src/config");
const BillingProfile = require("../src/models/BillingProfile");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const all = await BillingProfile.find({}).lean();
  console.log("Profiles count:", all.length);
  all.forEach(p => console.log(`- ${p.provider}/${p.model} tier:${p.costTier} cost:${p.costPerMillionCharacters} cr:${p.creditsPerCharacter}`));
  await mongoose.disconnect();
})();
