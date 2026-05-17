/**
 * Migration script: Convert existing character balances to credits.
 *
 * Run with: node scripts/migrateCredits.js
 *
 * For each user who has legacy character data:
 *   creditsRemaining = existingCharactersRemaining * 2
 *   creditsUsed      = existingCharactersUsed * 2
 *   totalCredits     = creditsRemaining + creditsUsed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../src/config");

async function migrate() {
  await mongoose.connect(config.mongodbUri);
  console.log("[Migration] Connected to MongoDB");

  const User = require("../src/models/User");
  const { getCharactersLimit } = require("../src/utils/planLimits");

  const users = await User.find({});
  let migrated = 0;

  for (const user of users) {
    // Skip users who already have credit data
    if (user.totalCredits > 0 || user.creditsUsed > 0 || user.creditsRemaining > 0) {
      console.log(`[Skip] ${user.email} — already has credit data`);
      continue;
    }

    const limit = getCharactersLimit(user.plan);
    const charsUsed = user.charactersUsed || 0;
    const charsRemaining = Math.max(0, limit - charsUsed);

    user.creditsUsed = charsUsed * 2;
    user.creditsRemaining = charsRemaining * 2;
    user.totalCredits = user.creditsUsed + user.creditsRemaining;

    await user.save();
    migrated++;
    console.log(
      `[Migrated] ${user.email}: charsUsed=${charsUsed}, charsRemaining=${charsRemaining} → creditsUsed=${user.creditsUsed}, creditsRemaining=${user.creditsRemaining}, totalCredits=${user.totalCredits}`
    );
  }

  console.log(`\n[Done] Migrated ${migrated} of ${users.length} users.`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("[Migration Error]", err);
  process.exit(1);
});
