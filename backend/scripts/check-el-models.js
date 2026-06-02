const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const el = await Voice.find({provider:"elevenlabs"}).select("name model costTier").lean();
  console.log("Total EL:", el.length);
  const byModel = {};
  el.forEach(v => { byModel[v.model] = (byModel[v.model]||0) +1 ; });
  console.log("By model:", byModel);
  const prem = el.filter(v=> v.model==="multilingual_v3" || v.model.includes("v3"));
  console.log("Prem count:", prem.length, prem[0] ? prem[0].name : "");
  await mongoose.disconnect();
})();
