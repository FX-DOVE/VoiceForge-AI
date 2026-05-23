/**
 * Update existing billing settings to use new welcome credits value
 * Run: node scripts/updateWelcomeCredits.js
 */
const mongoose = require("mongoose");
const config = require("../src/config");
const BillingSetting = require("../src/models/BillingSetting");

async function updateWelcomeCredits() {
  console.log("Connecting to database...");
  await mongoose.connect(config.mongodbUri);
  console.log("Connected.");

  // Update existing settings
  const result = await BillingSetting.updateOne(
    {}, // Update the first (and only) settings document
    {
      $set: {
        welcomeCredits: 2380,
        welcomeCreditUsd: 0.01,
      },
    }
  );

  if (result.matchedCount > 0) {
    console.log(`✓ Updated billing settings:`);
    console.log(`  - Welcome credits: 2380 (was 10000)`);
    console.log(`  - Credit value: $0.01 USD (was $6.67)`);
    console.log(`  - Documents modified: ${result.modifiedCount}`);
  } else {
    console.log("No existing settings found. New users will get 2380 credits.");
  }

  await mongoose.disconnect();
  console.log("Done!");
  process.exit(0);
}

updateWelcomeCredits().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
