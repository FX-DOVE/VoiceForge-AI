const mongoose = require("mongoose");
const config = require("../src/config");
const voiceService = require("../src/services/voiceService");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const flash = await voiceService.listVoices({provider:"elevenlabs", model:"flash"});
  const prem = await voiceService.listVoices({provider:"elevenlabs", model:"multilingual_v3"});
  console.log("Flash voices count:", flash.length);
  if (flash[0]) console.log("Sample flash:", flash[0].name, flash[0].model, flash[0].costTier);
  console.log("Premium voices count:", prem.length);
  if (prem[0]) console.log("Sample prem:", prem[0].name, prem[0].model, prem[0].costTier);
  await mongoose.disconnect();
})();
