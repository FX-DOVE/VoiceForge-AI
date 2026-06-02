/**
 * Seed default BillingProfile documents for multi-model support.
 * Run: node scripts/seed-billing-profiles.js
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const BillingProfile = require("../src/models/BillingProfile");

const defaults = [
  {
    provider: "xai",
    model: "voice_api",
    displayName: "voice forge pro",
    costTier: "low",
    costPerMillionCharacters: 15,
    creditsPerCharacter: 2,
    platformShare: 0.5,
    apiShare: 0.5,
  },
  {
    provider: "elevenlabs",
    model: "flash",
    displayName: "voiceforge Premium v2",
    costTier: "medium",
    costPerMillionCharacters: 50,
    creditsPerCharacter: 7,
    platformShare: 0.5,
    apiShare: 0.5,
  },
  {
    provider: "elevenlabs",
    model: "multilingual_v3",
    displayName: "voiceforge Premium v3",
    costTier: "high",
    costPerMillionCharacters: 100,
    creditsPerCharacter: 14,
    platformShare: 0.5,
    apiShare: 0.5,
  },
  {
    provider: "free",
    model: "default",
    displayName: "free",
    costTier: "low",
    costPerMillionCharacters: 0,
    creditsPerCharacter: 0,
    platformShare: 0,
    apiShare: 0,
  }
];

async function seed() {
  await connectDB();
  console.log("Seeding BillingProfiles...");
  for (const d of defaults) {
    const res = await BillingProfile.findOneAndUpdate(
      { provider: d.provider, model: d.model },
      { $setOnInsert: d },
      { upsert: true, new: true }
    );
    console.log("Upserted:", res.provider, res.model);
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
