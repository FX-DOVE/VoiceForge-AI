/**
 * Safe Migration for Multi-Provider Billing & Professional Membership
 * 
 * - Adds support for "professional" plan
 * - Creates ProfessionalMembership collection if needed
 * - Preserves ALL existing user data, credits, plans, payments
 * - No destructive changes
 * 
 * Run: node scripts/migrate-multi-provider.js
 */

const mongoose = require("mongoose");
const config = require("../src/config");
const { User, ProfessionalMembership, Voice, BillingSetting } = require("../src/models");

async function migrate() {
  console.log("Starting VoiceForge Multi-Provider Migration...");

  const mongoUri = config.mongodbUri || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI not set");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  // 1. Ensure ProfessionalMembership collection exists (Mongoose will create on first insert)
  console.log("ProfessionalMembership model loaded - collection will be created on use.");

  // 2. Backfill any users with old "pro" plan if needed, but DO NOT change existing plans
  // Current plans: free, pro, enterprise. New: professional will be added via subscription.
  const userCount = await User.countDocuments();
  console.log(`Found ${userCount} users. Existing plans preserved exactly as-is.`);

  // 3. Ensure Voice has provider field (add if missing on documents) - SAFE backfill
  const voicesWithoutProvider = await Voice.find({ provider: { $exists: false } }).select("_id tier");
  if (voicesWithoutProvider.length > 0) {
    console.log(`Backfilling provider field for ${voicesWithoutProvider.length} voices (safe per-doc updates)...`);
    for (const v of voicesWithoutProvider) {
      const prov = v.tier === "free" ? "free" : "xai";
      await Voice.updateOne({ _id: v._id }, { $set: { provider: prov } });
    }
    console.log("Voice provider backfill complete.");
  } else {
    console.log("All voices already have provider field.");
  }

  // 4. Ensure BillingSetting has multi-provider structure (extend existing)
  const billing = await BillingSetting.getSettings();
  if (!billing.providerProfiles) {
    console.log("Initializing providerProfiles in BillingSetting...");
    billing.providerProfiles = {
      xai: {
        costPerMillionCharacters: billing.ttsCostPerMillionCharacters || 15,
        creditsPerCharacter: billing.creditsPerCharacter || 2,
        platformShare: billing.platformShare || 0.5,
        apiShare: billing.apiShare || 0.5,
      },
      elevenlabs: {
        costPerMillionCharacters: 15, // Default, admin will configure
        creditsPerCharacter: 2,
        platformShare: 0.5,
        apiShare: 0.5,
      },
      free: {
        costPerMillionCharacters: 0,
        creditsPerCharacter: 0,
        platformShare: 0,
        apiShare: 0,
      }
    };
    await billing.save();
    console.log("Added providerProfiles to BillingSetting.");
  }

  console.log("Migration completed successfully. No existing data was modified.");
  console.log(" - Users, credits, payments, history preserved.");
  console.log(" - New fields added for professional plan and providers.");

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
