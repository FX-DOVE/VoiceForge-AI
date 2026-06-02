const mongoose = require("mongoose");
const config = require("../src/config");
const { User } = require("../src/models");
const voiceService = require("../src/services/voiceService");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  console.log("Connected");

  const u = await User.findOne({ email: "odohchisom51@gmail.com" });
  console.log("User plan:", u ? u.plan : null);

  try {
    const voices = await voiceService.listVoices({}, u);
    console.log("listVoices succeeded, returned", voices.length, "voices (no crash)");
  } catch (e) {
    console.error("listVoices FAILED:", e.message);
    console.error(e.stack);
  }

  await mongoose.disconnect();
})();
