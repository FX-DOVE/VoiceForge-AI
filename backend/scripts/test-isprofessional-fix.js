const mongoose = require("mongoose");
const config = require("../src/config");
const { User } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  console.log("Connected to DB for test");

  const u = await User.findOne();
  if (u) {
    console.log("Testing user:", u.email, "plan:", u.plan);
    try {
      const isPro = await u.isProfessional();
      console.log("isProfessional() returned:", isPro);
    } catch (e) {
      console.error("ERROR in isProfessional():", e.message);
      console.error(e.stack);
    }
  } else {
    console.log("No users found to test");
  }

  await mongoose.disconnect();
  console.log("Test complete");
})();
