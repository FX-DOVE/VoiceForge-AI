const mongoose = require("mongoose");
const config = require("../src/config");
const { connectDB } = require("../src/config/db");
const {getBillingProfile, calculateCreditsForUsage} = require("../src/utils/creditCalc");

(async () => {
  await connectDB();
  const p = await getBillingProfile("elevenlabs", "multilingual_v3");
  console.log("Premium profile:", p);
  const cr = await calculateCreditsForUsage(1000, "elevenlabs", "multilingual_v3");
  console.log("1000 chars premium cr:", cr);
  const f = await calculateCreditsForUsage(1000, "elevenlabs", "flash");
  console.log("1000 chars flash cr:", f);
  const x = await calculateCreditsForUsage(1000, "xai");
  console.log("1000 chars xai cr:", x);
  await mongoose.disconnect();
})();
