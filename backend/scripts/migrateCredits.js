require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../src/models");
const config = require("../src/config");

async function migrate() {
  console.log("Connecting to database...");
  await mongoose.connect(config.mongodbUri);
  console.log("Connected.");

  console.log("Migrating users to credit system...");
  
  const users = await User.find({});
  let migrated = 0;

  for (const user of users) {
    if (user.totalCredits === 0 && user.charactersUsed > 0) {
      // Legacy limits from plan
      let existingCharactersRemaining = 0;
      if (user.plan === "free") existingCharactersRemaining = 10000 - user.charactersUsed;
      if (user.plan === "pro") existingCharactersRemaining = 100000 - user.charactersUsed;
      if (user.plan === "enterprise") existingCharactersRemaining = 1000000 - user.charactersUsed;

      if (existingCharactersRemaining < 0) existingCharactersRemaining = 0;

      const creditsRemaining = existingCharactersRemaining * 2;
      const creditsUsed = user.charactersUsed * 2;
      const totalCredits = creditsRemaining + creditsUsed;

      user.creditsRemaining = creditsRemaining;
      user.creditsUsed = creditsUsed;
      user.totalCredits = totalCredits;
      
      await user.save();
      migrated++;
    }
  }

  console.log(`Migration complete. Migrated ${migrated} users.`);
  process.exit(0);
}

migrate().catch(console.error);
