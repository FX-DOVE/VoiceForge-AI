/**
 * VoiceForge AI - Billing System Migration Script (2026 Refactor)
 *
 * Purpose:
 * - Ensure all users have sane credit balances after the billing architecture change.
 * - Does NOT change existing balances.
 * - Prepares the system for the new dynamic pricing model.
 *
 * Run with: node scripts/migrate-billing-2026.js
 */

const mongoose = require("mongoose");
const config = require("../src/config");
const { User, BillingSetting, Payment } = require("../src/models");

async function runMigration() {
  console.log("=== VoiceForge Billing Migration 2026 ===");

  await mongoose.connect(config.mongoUri || process.env.MONGO_URI);
  console.log("Connected to database.");

  // 1. Ensure Billing Settings document exists with new defaults
  const settings = await BillingSetting.getSettings();
  console.log("Billing settings verified:", {
    platformShare: settings.platformShare,
    apiShare: settings.apiShare,
    ttsCostPerMillionCharacters: settings.ttsCostPerMillionCharacters,
    creditsPerCharacter: settings.creditsPerCharacter,
  });

  // 2. Backfill any missing credit fields on users (defensive)
  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    let changed = false;

    if (user.totalCredits == null) { user.totalCredits = 0; changed = true; }
    if (user.creditsUsed == null) { user.creditsUsed = 0; changed = true; }
    if (user.creditsRemaining == null) { user.creditsRemaining = 0; changed = true; }
    if (user.totalPayments == null) { user.totalPayments = 0; changed = true; }

    if (changed) {
      await user.save();
      updated++;
    }
  }

  console.log(`Backfilled credit fields for ${updated} users.`);

  // 3. Log current state (do not modify balances)
  const totalUsers = await User.countDocuments();
  console.log(`Total users in system: ${totalUsers}`);

  console.log("\nMigration completed successfully. Existing balances were preserved.");
  console.log("All future deposits and charges will use the new dynamic billing engine.");

  await mongoose.disconnect();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
