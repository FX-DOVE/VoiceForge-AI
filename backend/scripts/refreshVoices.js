#!/usr/bin/env node
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { syncXaiVoices } = require("../src/utils/syncXaiVoices");
const { generateAllPreviews } = require("../src/utils/generateVoicePreviews");
const { seedDefaultVoices } = require("../src/utils/seedVoices");

async function main() {
  const force = process.argv.includes("--force");
  await connectDB();

  console.log("=== Step 1: Seed default voices ===");
  await seedDefaultVoices();

  console.log("\n=== Step 2: Sync xAI voice catalog ===");
  const syncResult = await syncXaiVoices();
  console.log("Sync result:", syncResult);

  console.log("\n=== Step 3: Generate voice previews ===");
  const previewResult = await generateAllPreviews({ force, concurrency: 2, source: "xai" });
  console.log("Preview result:", previewResult);

  console.log("\n=== All done! ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Refresh failed:", err);
  process.exit(1);
});
