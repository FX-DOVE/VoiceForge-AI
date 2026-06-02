const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const one = await Voice.findOne({ provider: "elevenlabs", model: "flash" });
  if (one) {
    one.model = "multilingual_v3";
    one.costTier = "high";
    if (!one.name.includes("Premium")) one.name = one.name + " (Premium)";
    await one.save();
    console.log("Updated to Premium v3:", one.name, one.model);
  } else {
    console.log("No flash voice found to upgrade");
  }
  await mongoose.disconnect();
})();
